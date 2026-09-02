const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  },
  rollNumber: {
    type: String,
    required: true,
  },
  studentName: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late', 'Leave'],
    default: 'Present',
    required: true,
  },
  remark: {
    type: String,
    default: '',
  },
});

const attendanceSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
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
    subjectName: {
      type: String,
      required: true,
    },
    subjectCode: {
      type: String,
      required: true,
    },
    markedBy: {
      type: String,
      default: 'Instructor',
    },
    records: {
      type: [attendanceRecordSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Compound index for fast queries and upsert uniqueness
attendanceSchema.index(
  { date: 1, className: 1, section: 1, subjectCode: 1 },
  { unique: true }
);

module.exports = mongoose.model('Attendance', attendanceSchema);
