const mongoose = require('mongoose');

const schoolProfileSchema = new mongoose.Schema(
  {
    schoolName: {
      type: String,
      required: true,
      default: 'School Management System',
    },
    schoolCode: {
      type: String,
      required: true,
      default: 'CBSE-SCH-84210',
    },
    affiliation: {
      type: String,
      required: true,
      default: 'Affiliated to CBSE, New Delhi (Affiliation No: 2130842)',
    },
    academicSession: {
      type: String,
      required: true,
      default: '2026-27',
    },
    principalName: {
      type: String,
      required: true,
      default: 'Dr. Rajeshwar Prasad (Ph.D, M.Ed)',
    },
    address: {
      type: String,
      required: true,
      default: 'Plot 42, Institutional Area, Knowledge Park III',
    },
    city: {
      type: String,
      required: true,
      default: 'Greater Noida',
    },
    state: {
      type: String,
      required: true,
      default: 'Uttar Pradesh',
    },
    pincode: {
      type: String,
      required: true,
      default: '201306',
    },
    contactNumber: {
      type: String,
      default: '+91 120 4567890',
    },
    email: {
      type: String,
      default: 'principal@delhipublicacademy.edu.in',
    },
    website: {
      type: String,
      default: 'www.delhipublicacademy.edu.in',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SchoolProfile', schoolProfileSchema);
