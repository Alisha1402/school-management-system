const mongoose = require('mongoose');

const factorBreakdownSchema = new mongoose.Schema({
  factorName: {
    type: String,
    required: true,
  },
  factorValue: {
    type: Number,
    required: true,
  },
  importanceWeightPct: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Optimal', 'Satisfactory', 'Needs Improvement', 'Critical'],
    default: 'Satisfactory',
  },
  insight: {
    type: String,
    default: '',
  },
});

const performancePredictionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    admissionNumber: {
      type: String,
      default: '',
    },
    rollNumber: {
      type: String,
      required: true,
    },
    className: {
      type: String,
      default: 'Class 10',
    },
    section: {
      type: String,
      default: 'Section A',
    },
    academicSession: {
      type: String,
      default: '2026-27',
    },
    inputFeaturesSnapshot: {
      attendanceRate: { type: Number, required: true },
      assignmentCompletionRate: { type: Number, required: true },
      assignmentAvgScore: { type: Number, required: true },
      midtermExamScore: { type: Number, required: true },
      studyConsistency: { type: Number, default: 5.0 },
      totalAttendanceSessions: { type: Number, default: 0 },
      totalAssignmentsCount: { type: Number, default: 0 },
    },
    prediction: {
      predictedFinalPercentage: { type: Number, required: true },
      predictedCbseGrade: { type: String, required: true },
      confidenceInterval: {
        minPercentage: { type: Number, required: true },
        maxPercentage: { type: Number, required: true },
        confidenceLevel: { type: String, default: '90%' },
      },
      riskLevel: {
        type: String,
        enum: ['Low', 'Moderate', 'High'],
        default: 'Low',
      },
      riskScore: {
        type: Number,
        default: 0.0,
      },
    },
    factorBreakdown: {
      type: [factorBreakdownSchema],
      default: [],
    },
    evidenceBasedInterventions: {
      type: [String],
      default: [],
    },
    modelVersion: {
      type: String,
      default: '1.0.0-rf-academic',
    },
    isFallback: {
      type: Boolean,
      default: false,
    },
    generatedBy: {
      type: String,
      default: 'AI Performance Prediction Engine',
    },
    disclaimer: {
      type: String,
      default:
        'Notice: Predictions are statistical estimates derived from historical regression models and do not guarantee final examination results.',
    },
  },
  { timestamps: true }
);

performancePredictionSchema.index({ studentId: 1, createdAt: -1 });

module.exports = mongoose.model('PerformancePrediction', performancePredictionSchema);
