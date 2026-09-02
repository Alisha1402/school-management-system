const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
    },
    studentName: {
      type: String,
      required: true,
    },
    rollNumber: {
      type: String,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    fileUrl: {
      type: String,
      default: '',
    },
    fileName: {
      type: String,
      default: '',
    },
    submissionText: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Submitted', 'Graded', 'Late'],
      default: 'Submitted',
    },
    marksObtained: {
      type: Number,
      default: null,
    },
    feedback: {
      type: String,
      default: '',
    },
    gradedAt: {
      type: Date,
      default: null,
    },
    gradedBy: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Assignment description / instructions are required'],
    },
    className: {
      type: String,
      required: [true, 'Class name is required'], // e.g. Class 10
    },
    section: {
      type: String,
      required: [true, 'Section is required'], // e.g. Section A
    },
    subjectName: {
      type: String,
      required: [true, 'Subject name is required'],
    },
    subjectCode: {
      type: String,
      required: [true, 'Subject code is required'],
      uppercase: true,
    },
    teacherName: {
      type: String,
      required: true,
    },
    deadline: {
      type: Date,
      required: [true, 'Submission deadline is required'],
    },
    totalMarks: {
      type: Number,
      default: 20,
    },
    attachmentUrl: {
      type: String,
      default: '',
    },
    attachmentName: {
      type: String,
      default: '',
    },
    submissions: {
      type: [submissionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assignment', assignmentSchema);
