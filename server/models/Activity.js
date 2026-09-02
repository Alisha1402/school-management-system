const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['admission', 'fee', 'leave', 'notice', 'complaint', 'exam', 'attendance', 'system'],
      default: 'system',
    },
    description: {
      type: String,
      required: true,
    },
    actor: {
      type: String,
      default: 'System',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Activity', activitySchema);
