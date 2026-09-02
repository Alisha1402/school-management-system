const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Teacher name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Teacher email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      default: 'Mathematics',
    },
    qualification: {
      type: String,
      default: 'M.Sc, B.Ed',
    },
    experienceYears: {
      type: Number,
      default: 8,
    },
    phone: {
      type: String,
      default: '+91 98112 34567',
    },
    address: {
      type: String,
      default: 'Sector 62, Noida, Uttar Pradesh - 201301',
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    subject: {
      type: String,
      default: 'Mathematics', // Hindi, English, Mathematics, Science, Social Science, Computer, Sanskrit, GK, Physical Education
    },
    status: {
      type: String,
      enum: ['Active', 'On Leave', 'Inactive'],
      default: 'Active',
    },
    bio: {
      type: String,
      default: 'Senior CBSE educator dedicated to academic excellence and conceptual clarity.',
    },
    assignedClasses: {
      type: [String],
      default: ['Class 10 - Section A'],
    },
    assignedSubjects: {
      type: [String],
      default: ['Mathematics'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Teacher', teacherSchema);
