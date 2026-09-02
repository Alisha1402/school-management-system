const mongoose = require('mongoose');

const classSubjectSchema = new mongoose.Schema({
  subjectName: {
    type: String,
    required: true,
  },
  subjectCode: {
    type: String,
    required: true,
  },
  teacherName: {
    type: String,
    required: true,
    default: 'Unassigned',
  },
  credits: {
    type: Number,
    default: 4,
  },
  weeklyPeriods: {
    type: Number,
    default: 5,
  },
});

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Class / Grade name is required'], // e.g. Class 10, Grade 11
      trim: true,
    },
    section: {
      type: String,
      required: [true, 'Section is required'], // e.g. Section A, Section B
      trim: true,
      default: 'Section A',
    },
    roomNumber: {
      type: String,
      default: 'Room 101',
    },
    capacity: {
      type: Number,
      default: 40,
    },
    studentsCount: {
      type: Number,
      default: 0,
    },
    classTeacher: {
      type: String,
      default: 'Unassigned',
    },
    // Array of subjects and specific assigned teachers for this class & section
    subjects: {
      type: [classSubjectSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Class', classSchema);
