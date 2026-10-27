const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Assignment = require('../models/Assignment');
const Result = require('../models/Result');
const PerformancePrediction = require('../models/PerformancePrediction');

const FASTAPI_AI_URL = process.env.FASTAPI_AI_URL || 'http://127.0.0.1:8000';
const AI_SERVICE_API_KEY = process.env.AI_SERVICE_API_KEY || '';

// Guard against accidental localhost in production
if (
  process.env.NODE_ENV === 'production' &&
  (!process.env.FASTAPI_AI_URL ||
    process.env.FASTAPI_AI_URL.includes('127.0.0.1') ||
    process.env.FASTAPI_AI_URL.includes('localhost'))
) {
  console.warn(
    '[AI Microservice Guard] WARNING: FASTAPI_AI_URL is unset or pointing to localhost in production mode! Set FASTAPI_AI_URL to your deployed Python FastAPI service URL.'
  );
}

// CBSE Grade Computation Utility
const computeCbseGrade = (pct) => {
  if (pct >= 91) return 'A1';
  if (pct >= 81) return 'A2';
  if (pct >= 71) return 'B1';
  if (pct >= 61) return 'B2';
  if (pct >= 51) return 'C1';
  if (pct >= 41) return 'C2';
  if (pct >= 33) return 'D';
  return 'E';
};

/**
 * Extracts student features from Attendance, Assignment, and Result collections
 */
const extractStudentFeatures = async (studentId) => {
  let student = null;
  if (typeof studentId === 'object' && studentId.rollNumber) {
    student = studentId;
  } else {
    student = await Student.findById(studentId);
  }

  if (!student) {
    throw new Error('Student profile not found');
  }

  // 1. Attendance Features
  const attendanceSessions = await Attendance.find({
    'records.rollNumber': student.rollNumber,
  });

  let totalSessions = 0;
  let presentCount = 0;
  let lateCount = 0;

  attendanceSessions.forEach((s) => {
    const match = (s.records || []).find((r) => r.rollNumber === student.rollNumber);
    if (match) {
      totalSessions++;
      if (match.status === 'Present') presentCount++;
      else if (match.status === 'Late') lateCount++;
    }
  });

  const attendanceRate =
    totalSessions > 0
      ? Number((((presentCount + 0.7 * lateCount) / totalSessions) * 100).toFixed(1))
      : Number((student.attendanceRate || 95.0).toFixed(1));

  // 2. Assignment Features
  const assignments = await Assignment.find({
    $or: [
      { className: student.className },
      { className: new RegExp(`^${student.className}$`, 'i') },
    ],
  });

  const totalAssignmentsCount = assignments.length;
  let submittedCount = 0;
  let totalMarksObtained = 0;
  let totalMaxMarks = 0;

  assignments.forEach((a) => {
    const sub = (a.submissions || []).find(
      (s) =>
        s.rollNumber === student.rollNumber ||
        (s.studentId && s.studentId.toString() === student._id.toString())
    );
    if (sub) {
      submittedCount++;
      if (sub.marksObtained !== null && sub.marksObtained !== undefined) {
        totalMarksObtained += Number(sub.marksObtained);
        totalMaxMarks += Number(a.totalMarks || 20);
      }
    }
  });

  const assignmentCompletionRate =
    totalAssignmentsCount > 0
      ? Number(((submittedCount / totalAssignmentsCount) * 100).toFixed(1))
      : 92.0;

  const assignmentAvgScore =
    totalMaxMarks > 0
      ? Number(((totalMarksObtained / totalMaxMarks) * 100).toFixed(1))
      : Number((assignmentCompletionRate * 0.9).toFixed(1));

  // 3. Mid-Term / Examination Features
  const results = await Result.find({
    $or: [
      { studentId: student._id },
      { admissionNumber: student.admissionNumber },
      { rollNumber: student.rollNumber },
    ],
  }).sort({ createdAt: -1 });

  let midtermExamScore = 75.0;
  if (results.length > 0) {
    // Weighted towards most recent term result
    midtermExamScore = Number(results[0].percentage.toFixed(1));
  } else if (student.gpa) {
    // Fallback: estimate from GPA (scale 4.0 -> percentage)
    midtermExamScore = Number(Math.min(99.0, (student.gpa / 4.0) * 95).toFixed(1));
  }

  // 4. Study Consistency Index (1.0 to 10.0 scale)
  const studyConsistency = Number(
    Math.min(10.0, Math.max(1.0, attendanceRate / 20.0 + assignmentCompletionRate / 25.0)).toFixed(2)
  );

  return {
    student,
    features: {
      student_id: student._id.toString(),
      student_name: student.name,
      roll_number: student.rollNumber,
      class_name: student.className,
      section: student.section,
      attendance_rate: attendanceRate,
      assignment_completion_rate: assignmentCompletionRate,
      assignment_avg_score: assignmentAvgScore,
      midterm_exam_score: midtermExamScore,
      study_consistency: studyConsistency,
      total_sessions: totalSessions,
      total_assignments: totalAssignmentsCount,
    },
  };
};

/**
 * Fallback statistical inference in case FastAPI microservice is temporarily sleeping on Render
 */
const fallbackStatisticalPrediction = (features) => {
  const {
    attendance_rate,
    assignment_completion_rate,
    assignment_avg_score,
    midterm_exam_score,
    study_consistency,
  } = features;

  // Formula based on trained Random Forest coefficients:
  const rawScore =
    0.835 * midterm_exam_score +
    0.064 * assignment_avg_score +
    0.058 * assignment_completion_rate +
    0.022 * attendance_rate +
    0.021 * (study_consistency * 10);

  const predictedFinalPercentage = Number(Math.min(99.0, Math.max(30.0, rawScore)).toFixed(2));
  const predictedCbseGrade = computeCbseGrade(predictedFinalPercentage);

  const margin = 3.2;
  const minPercentage = Number(Math.max(0.0, predictedFinalPercentage - margin).toFixed(2));
  const maxPercentage = Number(Math.min(100.0, predictedFinalPercentage + margin).toFixed(2));

  let riskLevel = 'Low';
  let riskScore = 5.0;
  if (predictedFinalPercentage < 50) {
    riskLevel = 'High';
    riskScore = 80.0;
  } else if (predictedFinalPercentage < 75) {
    riskLevel = 'Moderate';
    riskScore = 45.0;
  }

  const factorBreakdown = [
    {
      factorName: 'Term Exam Performance',
      factorValue: midterm_exam_score,
      importanceWeightPct: 83.5,
      status: midterm_exam_score >= 80 ? 'Optimal' : midterm_exam_score >= 60 ? 'Satisfactory' : 'Needs Improvement',
      insight: 'Term assessment baseline accounts for the primary foundation of expected annual proficiency.',
    },
    {
      factorName: 'Homework Accuracy',
      factorValue: assignment_avg_score,
      importanceWeightPct: 6.4,
      status: assignment_avg_score >= 80 ? 'Optimal' : assignment_avg_score >= 65 ? 'Satisfactory' : 'Needs Improvement',
      insight: 'Reflects understanding and precision on weekly subjective assignments.',
    },
    {
      factorName: 'Coursework Completion Rate',
      factorValue: assignment_completion_rate,
      importanceWeightPct: 5.8,
      status: assignment_completion_rate >= 85 ? 'Optimal' : assignment_completion_rate >= 70 ? 'Satisfactory' : 'Needs Improvement',
      insight: 'Measures student discipline and task completion consistency.',
    },
    {
      factorName: 'Classroom Attendance',
      factorValue: attendance_rate,
      importanceWeightPct: 2.2,
      status: attendance_rate >= 85 ? 'Optimal' : attendance_rate >= 75 ? 'Satisfactory' : 'Critical',
      insight: 'Measures pedagogical exposure and compliance with CBSE minimum 75% norm.',
    },
  ];

  const interventions = [];
  if (attendance_rate < 75.0) {
    interventions.push(
      `Attendance (${attendance_rate}%) is below the mandatory CBSE 75% threshold. Prioritize regular attendance to prevent attendance shortage alerts.`
    );
  }
  if (assignment_completion_rate < 80.0) {
    interventions.push(
      `Assignment completion rate (${assignment_completion_rate}%) is lagging. Submitting scheduled NCERT exercises will improve coursework retention.`
    );
  }
  if (midterm_exam_score < 60.0) {
    interventions.push(
      `Mid-term score (${midterm_exam_score}%) indicates need for targeted chapter revision and practice tests.`
    );
  }
  if (interventions.length === 0) {
    interventions.push(
      'Strong academic momentum across all metrics. Maintain consistent revision and practice CBSE sample papers for top-tier standing.'
    );
  }

  return {
    student_id: features.student_id,
    student_name: features.student_name,
    roll_number: features.roll_number,
    class_name: features.class_name,
    predicted_final_percentage: predictedFinalPercentage,
    predicted_cbse_grade: predictedCbseGrade,
    confidence_interval: {
      min_percentage: minPercentage,
      max_percentage: maxPercentage,
      confidence_level: 'Heuristic Spread',
    },
    risk_level: riskLevel,
    risk_score: riskScore,
    factor_breakdown: factorBreakdown,
    evidence_based_interventions: interventions,
    model_version: 'fallback-heuristic-v1',
    is_fallback: true,
    generated_at: new Date().toISOString(),
    disclaimer:
      'Notice: The Python ML microservice was unreachable. This prediction was generated by the internal rule-based heuristic fallback engine.',
  };
};

/**
 * Predicts student performance by calling FastAPI microservice with fallback
 */
const generateAndSavePrediction = async (studentId, requestedBy = 'System') => {
  const { student, features } = await extractStudentFeatures(studentId);

  let predictionData = null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4-sec timeout

    const headers = { 'Content-Type': 'application/json' };
    if (AI_SERVICE_API_KEY) {
      headers['X-API-KEY'] = AI_SERVICE_API_KEY;
    }

    const res = await fetch(`${FASTAPI_AI_URL}/predict`, {
      method: 'POST',
      headers,
      body: JSON.stringify(features),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      predictionData = await res.json();
    } else {
      console.warn(`FastAPI returned status ${res.status}. Falling back to internal engine.`);
      predictionData = fallbackStatisticalPrediction(features);
    }
  } catch (err) {
    // FastAPI server is offline or unreachable - use internal statistical engine gracefully
    predictionData = fallbackStatisticalPrediction(features);
  }

  // Persist prediction snapshot into MongoDB PerformancePrediction collection
  const record = await PerformancePrediction.create({
    studentId: student._id,
    studentName: student.name,
    admissionNumber: student.admissionNumber || '',
    rollNumber: student.rollNumber,
    className: student.className,
    section: student.section,
    academicSession: student.academicSession || '2026-27',
    inputFeaturesSnapshot: {
      attendanceRate: features.attendance_rate,
      assignmentCompletionRate: features.assignment_completion_rate,
      assignmentAvgScore: features.assignment_avg_score,
      midtermExamScore: features.midterm_exam_score,
      studyConsistency: features.study_consistency,
      totalAttendanceSessions: features.total_sessions,
      totalAssignmentsCount: features.total_assignments,
    },
    prediction: {
      predictedFinalPercentage: predictionData.predicted_final_percentage,
      predictedCbseGrade: predictionData.predicted_cbse_grade,
      confidenceInterval: {
        minPercentage: predictionData.confidence_interval.min_percentage,
        maxPercentage: predictionData.confidence_interval.max_percentage,
        confidenceLevel: predictionData.confidence_interval.confidence_level || '90%',
      },
      riskLevel: predictionData.risk_level,
      riskScore: predictionData.risk_score,
    },
    factorBreakdown: (predictionData.factor_breakdown || []).map((f) => ({
      factorName: f.factor_name,
      factorValue: f.factor_value,
      importanceWeightPct: f.importance_weight_pct,
      status: f.status,
      insight: f.insight,
    })),
    evidenceBasedInterventions: predictionData.evidence_based_interventions || [],
    modelVersion: predictionData.model_version || (predictionData.is_fallback ? 'fallback-heuristic-v1' : '1.0.0-rf-academic'),
    isFallback: Boolean(predictionData.is_fallback),
    generatedBy: requestedBy,
    disclaimer: predictionData.disclaimer,
  });

  return record;
};

module.exports = {
  extractStudentFeatures,
  generateAndSavePrediction,
  fallbackStatisticalPrediction,
};
