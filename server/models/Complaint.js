const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
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
      default: '',
    },
    className: {
      type: String,
      default: 'Class 10',
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Academic', 'Infrastructure', 'Transport', 'Fee/Accounts', 'Discipline', 'General'],
      default: 'Academic',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved', 'Closed'],
      default: 'Pending',
    },
    adminResponse: {
      type: String,
      default: '',
    },
    resolvedBy: {
      type: String,
      default: '',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Complaint', complaintSchema);
