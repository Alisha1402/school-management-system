import json
import os
from datetime import datetime
from typing import List
import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, Security, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
from schemas import (
    BatchPredictionInput,
    ConfidenceInterval,
    FactorContribution,
    ModelInfoResponse,
    PredictionInput,
    PredictionOutput,
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'model.joblib')
METADATA_PATH = os.path.join(BASE_DIR, 'metadata.json')

app = FastAPI(
    title='School Management System - AI Performance Prediction Service',
    description='FastAPI ML Microservice predicting student academic trajectories using empirical Random Forest models.',
    version='1.0.0',
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

API_KEY_HEADER = APIKeyHeader(name='X-API-KEY', auto_error=False)
EXPECTED_API_KEY = os.getenv('AI_SERVICE_API_KEY', '')

# Model & metadata cache
model = None
metadata = {}


def load_artifacts():
    global model, metadata
    if not os.path.exists(MODEL_PATH) or not os.path.exists(METADATA_PATH):
        raise RuntimeError('Model artifacts not found. Please run train_model.py first.')
    model = joblib.load(MODEL_PATH)
    with open(METADATA_PATH, 'r') as f:
        metadata = json.load(f)


try:
    load_artifacts()
except Exception as e:
    print(f'Warning: Could not load model on init: {e}')


def verify_api_key(api_key: str = Security(API_KEY_HEADER)):
    # If an API key is configured in env, require and validate it
    if EXPECTED_API_KEY and api_key != EXPECTED_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Invalid or missing X-API-KEY header',
        )
    return True


def compute_cbse_grade(pct: float) -> str:
    if pct >= 91:
        return 'A1'
    if pct >= 81:
        return 'A2'
    if pct >= 71:
        return 'B1'
    if pct >= 61:
        return 'B2'
    if pct >= 51:
        return 'C1'
    if pct >= 41:
        return 'C2'
    if pct >= 33:
        return 'D'
    return 'E'


def generate_interventions(inp: PredictionInput, pred_score: float) -> List[str]:
    interventions = []

    if inp.attendance_rate < 75.0:
        interventions.append(
            f'Attendance ({inp.attendance_rate:.1f}%) is below the mandatory CBSE 75% threshold. '
            'Prioritize regular attendance to prevent attendance shortage alerts.'
        )
    elif inp.attendance_rate < 85.0:
        interventions.append(
            f'Current attendance is {inp.attendance_rate:.1f}%. Aiming for 90%+ will bolster continuity '
            'and increase overall coursework retention.'
        )

    if inp.assignment_completion_rate < 70.0:
        interventions.append(
            f'Assignment completion rate ({inp.assignment_completion_rate:.1f}%) is lagging. '
            'Timely submission of all assigned NCERT problems is recommended to boost formative scores.'
        )
    elif inp.assignment_completion_rate < 90.0:
        interventions.append(
            'Ensure remaining pending coursework deliverables are submitted before scheduled deadlines.'
        )

    if inp.assignment_avg_score < 60.0:
        interventions.append(
            f'Average assignment score ({inp.assignment_avg_score:.1f}%) indicates need for conceptual review. '
            'Schedule doubt-clearing sessions with subject faculty.'
        )

    if inp.midterm_exam_score < 50.0:
        interventions.append(
            f'Mid-term assessment score ({inp.midterm_exam_score:.1f}%) is in the vulnerable zone. '
            'Prioritize high-weightage chapters and practice past CBSE board papers.'
        )
    elif inp.midterm_exam_score < 75.0:
        interventions.append(
            'Target identified mid-term weak chapters with targeted weekly mock test revisions.'
        )

    if pred_score >= 85.0 and len(interventions) == 0:
        interventions.append(
            'Exceptional academic trajectory across all indicators. Maintain consistent study rhythm and focus on advanced NCERT exemplar problems for top-tier A1 distinction.'
        )

    if not interventions:
        interventions.append(
            'Consistent steady performance. Maintaining current homework discipline and attendance will ensure solid academic progress.'
        )

    return interventions


def evaluate_factor_breakdown(inp: PredictionInput) -> List[FactorContribution]:
    factors = []

    # 1. Mid-term score
    m_status = 'Optimal' if inp.midterm_exam_score >= 80 else 'Satisfactory' if inp.midterm_exam_score >= 60 else 'Needs Improvement' if inp.midterm_exam_score >= 40 else 'Critical'
    factors.append(FactorContribution(
        factor_name='Term Exam Performance',
        factor_value=inp.midterm_exam_score,
        importance_weight_pct=83.5,
        status=m_status,
        insight=f'Term assessment baseline accounts for the primary foundation of expected annual proficiency.'
    ))

    # 2. Assignment Score
    a_status = 'Optimal' if inp.assignment_avg_score >= 85 else 'Satisfactory' if inp.assignment_avg_score >= 70 else 'Needs Improvement' if inp.assignment_avg_score >= 50 else 'Critical'
    factors.append(FactorContribution(
        factor_name='Homework Accuracy',
        factor_value=inp.assignment_avg_score,
        importance_weight_pct=6.4,
        status=a_status,
        insight=f'Reflects understanding and precision on weekly subjective assignments.'
    ))

    # 3. Assignment Completion
    c_status = 'Optimal' if inp.assignment_completion_rate >= 90 else 'Satisfactory' if inp.assignment_completion_rate >= 75 else 'Needs Improvement' if inp.assignment_completion_rate >= 50 else 'Critical'
    factors.append(FactorContribution(
        factor_name='Coursework Completion Rate',
        factor_value=inp.assignment_completion_rate,
        importance_weight_pct=5.8,
        status=c_status,
        insight=f'Measures student discipline and task completion consistency.'
    ))

    # 4. Attendance
    att_status = 'Optimal' if inp.attendance_rate >= 90 else 'Satisfactory' if inp.attendance_rate >= 75 else 'Needs Improvement' if inp.attendance_rate >= 60 else 'Critical'
    factors.append(FactorContribution(
        factor_name='Classroom Attendance',
        factor_value=inp.attendance_rate,
        importance_weight_pct=2.2,
        status=att_status,
        insight=f'Measures pedagogical exposure and compliance with CBSE minimum 75% norm.'
    ))

    return factors


def predict_single(inp: PredictionInput) -> PredictionOutput:
    if model is None:
        load_artifacts()

    # Derived study consistency if not supplied
    if inp.study_consistency is None:
        consistency = (inp.attendance_rate / 20.0) + (inp.assignment_completion_rate / 25.0)
        consistency = float(np.clip(consistency, 1.0, 10.0))
    else:
        consistency = inp.study_consistency

    feature_cols = metadata.get('features', [
        'attendance_rate',
        'assignment_completion_rate',
        'assignment_avg_score',
        'midterm_exam_score',
        'study_consistency',
    ])
    features_df = pd.DataFrame([[
        inp.attendance_rate,
        inp.assignment_completion_rate,
        inp.assignment_avg_score,
        inp.midterm_exam_score,
        consistency,
    ]], columns=feature_cols)

    # Point prediction
    pred_mean = float(model.predict(features_df)[0])
    pred_mean = float(np.clip(pred_mean, 0.0, 100.0))

    # Tree variance for confidence interval
    tree_preds = [tree.predict(features_df.values)[0] for tree in model.estimators_]
    tree_std = float(np.std(tree_preds))
    margin = float(np.clip(1.645 * tree_std, 2.0, 7.5))  # 90% confidence bound, clipped realistically

    min_pct = float(np.clip(pred_mean - margin, 0.0, 100.0))
    max_pct = float(np.clip(pred_mean + margin, 0.0, 100.0))

    cbse_grade = compute_cbse_grade(pred_mean)

    # Risk assessment
    if pred_mean >= 75.0:
        risk_level = 'Low'
        risk_score = round(max(0.0, 100.0 - pred_mean) * 0.5, 1)
    elif pred_mean >= 50.0:
        risk_level = 'Moderate'
        risk_score = round(35.0 + (75.0 - pred_mean) * 1.4, 1)
    else:
        risk_level = 'High'
        risk_score = round(70.0 + min(30.0, (50.0 - pred_mean) * 1.5), 1)

    interventions = generate_interventions(inp, pred_mean)
    factors = evaluate_factor_breakdown(inp)

    return PredictionOutput(
        student_id=inp.student_id,
        student_name=inp.student_name,
        roll_number=inp.roll_number,
        class_name=inp.class_name,
        predicted_final_percentage=round(pred_mean, 2),
        predicted_cbse_grade=cbse_grade,
        confidence_interval=ConfidenceInterval(
            min_percentage=round(min_pct, 2),
            max_percentage=round(max_pct, 2),
            confidence_level='Ensemble Spread (Uncalibrated)',
        ),
        risk_level=risk_level,
        risk_score=risk_score,
        factor_breakdown=factors,
        evidence_based_interventions=interventions,
        model_version=metadata.get('model_version', '1.0.0-rf-academic'),
        generated_at=datetime.utcnow().isoformat() + 'Z',
        disclaimer='Notice: Predictions are statistical estimates derived from supervised regression models to assist pedagogical mentoring. The prediction range reflects tree estimator variance (uncalibrated) and does not guarantee final examination results.',
    )


@app.get('/health', tags=['System'])
def health_check():
    return {
        'status': 'healthy',
        'service': 'ai-performance-prediction',
        'model_loaded': model is not None,
        'model_version': metadata.get('model_version', 'unknown'),
        'timestamp': datetime.utcnow().isoformat() + 'Z',
    }


@app.get('/model-info', response_model=ModelInfoResponse, tags=['Model'])
def get_model_info():
    if not metadata:
        load_artifacts()
    return ModelInfoResponse(**metadata)


@app.post('/predict', response_model=PredictionOutput, tags=['Inference'])
def predict_student_performance(
    input_data: PredictionInput,
    authorized: bool = Security(verify_api_key),
):
    try:
        return predict_single(input_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Prediction failed: {str(e)}')


@app.post('/batch-predict', response_model=List[PredictionOutput], tags=['Inference'])
def predict_batch_performance(
    batch_data: BatchPredictionInput,
    authorized: bool = Security(verify_api_key),
):
    try:
        results = [predict_single(s) for s in batch_data.students]
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Batch prediction failed: {str(e)}')


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)
