const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Notice title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Notice content is required'],
    },
    category: {
      type: String,
      enum: ['Holiday Notice', 'Exam Notice', 'PTM Notice', 'School Event', 'Important Announcement'],
      default: 'Important Announcement',
    },
    audience: {
      type: String,
      enum: ['All', 'Students', 'Teachers', 'Parents'],
      default: 'All',
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    postedBy: {
      type: String,
      required: true,
      default: 'Dr. Rajeshwar Prasad (Principal)',
    },
    attachmentUrl: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notice', noticeSchema);
