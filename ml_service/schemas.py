from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class PredictionInput(BaseModel):
    student_id: Optional[str] = None
    student_name: Optional[str] = None
    roll_number: Optional[str] = None
    class_name: Optional[str] = 'Class 10'
    section: Optional[str] = 'Section A'
    attendance_rate: float = Field(..., ge=0.0, le=100.0, description='Attendance percentage (0-100)')
    assignment_completion_rate: float = Field(..., ge=0.0, le=100.0, description='Assignment completion rate (0-100)')
    assignment_avg_score: float = Field(..., ge=0.0, le=100.0, description='Average assignment score (0-100)')
    midterm_exam_score: float = Field(..., ge=0.0, le=100.0, description='Mid-term or previous term exam score (0-100)')
    study_consistency: Optional[float] = Field(default=None, ge=0.0, le=10.0, description='Consistency index (0-10)')


class BatchPredictionInput(BaseModel):
    students: List[PredictionInput]


class FactorContribution(BaseModel):
    factor_name: str
    factor_value: float
    importance_weight_pct: float
    status: str  # 'Optimal' | 'Satisfactory' | 'Needs Improvement' | 'Critical'
    insight: str


class ConfidenceInterval(BaseModel):
    min_percentage: float
    max_percentage: float
    confidence_level: str = Field(
        default='Ensemble Spread (Uncalibrated)',
        description='Spread across ensemble tree predictions; heuristic estimate rather than calibrated parametric confidence interval.',
    )


class PredictionOutput(BaseModel):
    student_id: Optional[str] = None
    student_name: Optional[str] = None
    roll_number: Optional[str] = None
    class_name: Optional[str] = None
    predicted_final_percentage: float
    predicted_cbse_grade: str
    confidence_interval: ConfidenceInterval
    risk_level: str  # 'Low' | 'Moderate' | 'High'
    risk_score: float  # 0 to 100 risk scale
    factor_breakdown: List[FactorContribution]
    evidence_based_interventions: List[str]
    model_version: str
    generated_at: str
    disclaimer: str


class ModelInfoResponse(BaseModel):
    model_version: str
    algorithm: str
    features: List[str]
    metrics: Dict[str, Any]
    feature_importances: Dict[str, float]
    training_dataset: Dict[str, Any]
    disclaimer: str
