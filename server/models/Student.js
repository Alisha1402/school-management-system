const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    admissionNumber: {
      type: String,
      required: [true, 'Admission Number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required'],
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    className: {
      type: String,
      required: [true, 'Class is required'], // e.g. Class 10, Class 11, Nursery
    },
    section: {
      type: String,
      required: [true, 'Section is required'], // e.g. Section A, Section B
      default: 'Section A',
    },
    academicSession: {
      type: String,
      default: '2026-27',
    },
    admissionDate: {
      type: Date,
      default: Date.now,
    },
    dob: {
      type: Date,
      required: [true, 'Date of Birth is required'],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Gender is required'],
      default: 'Male',
    },
    fatherName: {
      type: String,
      required: [true, "Father's name is required"],
      trim: true,
    },
    motherName: {
      type: String,
      required: [true, "Mother's name is required"],
      trim: true,
    },
    guardianName: {
      type: String,
      default: '',
      trim: true,
    },
    parentContact: {
      type: String,
      required: [true, 'Parent mobile number is required'],
      trim: true,
    },
    parentEmail: {
      type: String,
      default: '',
      trim: true,
    },
    parentOccupation: {
      type: String,
      default: 'Professional / Business',
    },
    address: {
      type: String,
      required: [true, 'Residential address is required'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      default: 'New Delhi',
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      default: 'Delhi',
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      default: '110001',
    },
    aadhaarNumber: {
      type: String,
      default: '', // Optional Aadhaar (Masked format: XXXX-XXXX-4812)
    },
    bloodGroup: {
      type: String,
      default: 'O+',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended'],
      default: 'Active',
    },
    gpa: {
      type: Number,
      default: 3.8,
    },
    attendanceRate: {
      type: Number,
      default: 95.0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
