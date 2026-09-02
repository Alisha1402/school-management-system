const mongoose = require('mongoose');

const periodSlotSchema = new mongoose.Schema(
  {
    periodNumber: {
      type: Number,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    isBreak: {
      type: Boolean,
      default: false,
    },
    subjectName: {
      type: String,
      default: '',
    },
    subjectCode: {
      type: String,
      default: '',
    },
    teacherName: {
      type: String,
      default: '',
    },
    roomNumber: {
      type: String,
      default: 'Room 101',
    },
  },
  { _id: false }
);

const dayScheduleSchema = new mongoose.Schema(
  {
    dayName: {
      type: String,
      required: true,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    periods: [periodSlotSchema],
  },
  { _id: false }
);

const timetableSchema = new mongoose.Schema(
  {
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
    days: [dayScheduleSchema],
  },
  { timestamps: true }
);

timetableSchema.index({ className: 1, section: 1, academicSession: 1 }, { unique: true });

module.exports = mongoose.model('Timetable', timetableSchema);
