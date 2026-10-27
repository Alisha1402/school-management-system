"""
Automated Unit and Integration Tests for FastAPI ML Microservice
Direct function and schema validation for high speed and reliability.
"""

import sys
from main import (
    health_check,
    get_model_info,
    predict_student_performance,
    predict_batch_performance,
)
from schemas import (
    PredictionInput,
    BatchPredictionInput,
)


def run_tests():
    print('================================================================')
    print('TESTING FASTAPI ACADEMIC PERFORMANCE PREDICTION MICROSERVICE')
    print('================================================================\n')

    # 1. Health check
    print('[1/5] Testing health_check endpoint...')
    health_res = health_check()
    assert health_res['status'] == 'healthy'
    assert health_res['model_loaded'] is True
    print(f'   [OK] Health Check Passed: {health_res}')

    # 2. Model info
    print('\n[2/5] Testing get_model_info endpoint...')
    info_res = get_model_info()
    assert info_res.algorithm == 'RandomForestRegressor'
    assert 'test_r2' in info_res.metrics
    print(f'   [OK] Model Info Verified: Algorithm={info_res.algorithm}, R2={info_res.metrics["test_r2"]}')

    # 3. High Performing Student Prediction
    print('\n[3/5] Testing predict_student_performance (High Performing Student)...')
    high_input = PredictionInput(
        student_id='6a982bde9cd81960038bf6df',
        student_name='Aarav Sharma',
        roll_number='101',
        class_name='Class 10',
        section='Section A',
        attendance_rate=98.4,
        assignment_completion_rate=100.0,
        assignment_avg_score=95.0,
        midterm_exam_score=95.5,
    )
    pred = predict_student_performance(high_input)
    print(f'   * Student: {pred.student_name} (Roll #{pred.roll_number})')
    print(f'   * Predicted Annual Score: {pred.predicted_final_percentage}%')
    print(f'   * Predicted CBSE Grade: {pred.predicted_cbse_grade}')
    print(f'   * 90% Confidence Interval: [{pred.confidence_interval.min_percentage}%, {pred.confidence_interval.max_percentage}%]')
    print(f'   * Risk Level: {pred.risk_level} (Risk Score: {pred.risk_score})')
    print(f'   * Key Factor 1: {pred.factor_breakdown[0].factor_name} ({pred.factor_breakdown[0].factor_value}%) - {pred.factor_breakdown[0].status}')
    assert pred.predicted_cbse_grade in ['A1', 'A2']
    assert pred.risk_level == 'Low'
    assert len(pred.factor_breakdown) == 4
    assert len(pred.evidence_based_interventions) > 0
    print('   [OK] High-Performer Prediction Validated')

    # 4. At-Risk Student Prediction
    print('\n[4/5] Testing predict_student_performance (At-Risk / Low Attendance Student)...')
    low_input = PredictionInput(
        student_id='6a982bde9cd81960038bf999',
        student_name='Demo At-Risk Student',
        roll_number='109',
        class_name='Class 10',
        section='Section A',
        attendance_rate=55.0,
        assignment_completion_rate=40.0,
        assignment_avg_score=45.0,
        midterm_exam_score=38.0,
    )
    pred_low = predict_student_performance(low_input)
    print(f'   * Student: {pred_low.student_name}')
    print(f'   * Predicted Annual Score: {pred_low.predicted_final_percentage}%')
    print(f'   * Predicted CBSE Grade: {pred_low.predicted_cbse_grade}')
    print(f'   * Risk Level: {pred_low.risk_level} (Risk Score: {pred_low.risk_score})')
    print(f'   * Generated Intervention: "{pred_low.evidence_based_interventions[0]}"')
    assert pred_low.risk_level in ['Moderate', 'High']
    assert pred_low.predicted_final_percentage < 60.0
    print('   [OK] At-Risk Prediction and Intervention Triggered Successfully')

    # 5. Batch Prediction
    print('\n[5/5] Testing predict_batch_performance...')
    batch_input = BatchPredictionInput(students=[high_input, low_input])
    batch_res = predict_batch_performance(batch_input)
    assert len(batch_res) == 2
    assert batch_res[0].student_name == 'Aarav Sharma'
    assert batch_res[1].student_name == 'Demo At-Risk Student'
    print(f'   [OK] Batch Prediction Returned {len(batch_res)} student assessments successfully')

    print('\n================================================================')
    print('ALL 5 FASTAPI SERVICE TESTS PASSED WITH 100% SUCCESS!')
    print('================================================================\n')


if __name__ == '__main__':
    run_tests()
