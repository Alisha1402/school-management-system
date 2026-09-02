const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
  {
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'applicantRoleRef',
    },
    applicantRoleRef: {
      type: String,
      enum: ['Student', 'Teacher'],
      default: 'Student',
    },
    applicantName: {
      type: String,
      required: true,
    },
    applicantRole: {
      type: String,
      enum: ['student', 'teacher'],
      default: 'student',
    },
    className: {
      type: String,
      default: 'Class 10',
    },
    admissionNumber: {
      type: String,
      default: '',
    },
    rollNumber: {
      type: String,
      default: '',
    },
    leaveType: {
      type: String,
      enum: ['Sick Leave', 'Casual Leave', 'Family Emergency', 'Medical Leave', 'Other'],
      default: 'Sick Leave',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalDays: {
      type: Number,
      default: 1,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    reviewedBy: {
      type: String,
      default: '',
    },
    adminRemark: {
      type: String,
      default: '',
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Leave', leaveSchema);
