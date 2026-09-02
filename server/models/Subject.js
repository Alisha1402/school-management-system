const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Subject code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    department: {
      type: String,
      default: 'General Sciences',
    },
    credits: {
      type: Number,
      default: 4,
    },
    weeklyPeriods: {
      type: Number,
      default: 5,
    },
    description: {
      type: String,
      default: 'Core curriculum coursework and laboratory syllabus.',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', subjectSchema);
