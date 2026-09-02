const mongoose = require('mongoose');

const examScheduleSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    default: '09:00 AM',
  },
  endTime: {
    type: String,
    default: '12:00 PM',
  },
  subjectName: {
    type: String,
    required: true,
  },
  subjectCode: {
    type: String,
    required: true,
  },
  maxMarks: {
    type: Number,
    default: 100,
  },
  roomNumber: {
    type: String,
    default: 'Room 101',
  },
});

const examSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Exam name is required'],
      trim: true,
    },
    examType: {
      type: String,
      enum: ['Unit Test', 'Half-Yearly', 'Pre-Board', 'Annual Examination'],
      required: [true, 'Exam type is required'],
    },
    academicSession: {
      type: String,
      default: '2026-27',
    },
    className: {
      type: String,
      required: [true, 'Class name is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    schedule: {
      type: [examScheduleSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Ongoing', 'Completed', 'Results Published'],
      default: 'Upcoming',
    },
    instructions: {
      type: String,
      default: 'Standard CBSE board examination rules apply. Students must carry their Admit Card and stationeries.',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Exam', examSchema);
