const mongoose = require('mongoose');

const subjectMarkSchema = new mongoose.Schema({
  subjectName: {
    type: String,
    required: true,
  },
  subjectCode: {
    type: String,
    required: true,
  },
  theoryMarks: {
    type: Number,
    default: 0,
  },
  practicalMarks: {
    type: Number,
    default: 0,
  },
  marksObtained: {
    type: Number,
    required: true,
  },
  maxMarks: {
    type: Number,
    default: 100,
  },
  grade: {
    type: String,
    default: 'A1',
  },
});

const resultSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    admissionNumber: {
      type: String,
      required: true,
    },
    rollNumber: {
      type: String,
      required: true,
    },
    className: {
      type: String,
      required: true,
    },
    section: {
      type: String,
      required: true,
    },
    academicSession: {
      type: String,
      default: '2026-27',
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
    },
    examName: {
      type: String,
      required: true,
    },
    examType: {
      type: String,
      enum: ['Unit Test', 'Half-Yearly', 'Pre-Board', 'Annual Examination'],
      default: 'Half-Yearly',
    },
    subjectMarks: {
      type: [subjectMarkSchema],
      default: [],
    },
    totalMarksObtained: {
      type: Number,
      required: true,
    },
    totalMaxMarks: {
      type: Number,
      required: true,
      default: 600,
    },
    percentage: {
      type: Number,
      required: true,
    },
    overallGrade: {
      type: String,
      default: 'A1',
    },
    resultStatus: {
      type: String,
      enum: ['Pass', 'Fail', 'Compartment'],
      default: 'Pass',
    },
    rankInClass: {
      type: Number,
      default: 1,
    },
    remarks: {
      type: String,
      default: 'Excellent academic performance. Promoted with distinction.',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Result', resultSchema);
