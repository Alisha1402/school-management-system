const mongoose = require('mongoose');

const feeBreakdownSchema = new mongoose.Schema(
  {
    head: {
      type: String,
      required: true,
      enum: [
        'Tuition Fee',
        'Admission Fee',
        'Examination Fee',
        'Transport Fee',
        'Computer Fee',
        'Annual Fee',
        'Other Fee',
      ],
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const transactionSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'Net Banking', 'Cheque', 'Cash', 'Debit Card'],
      default: 'UPI',
    },
    transactionRef: {
      type: String,
      default: '',
    },
    receiptNumber: {
      type: String,
      default: '',
    },
    receivedBy: {
      type: String,
      default: 'Accounts Department',
    },
  },
  { timestamps: true }
);

const feeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
    },
    studentName: {
      type: String,
      required: true,
    },
    admissionNumber: {
      type: String,
      default: 'ADM/2026/0101',
    },
    rollNumber: {
      type: String,
      default: '101',
    },
    className: {
      type: String,
      required: true,
    },
    academicSession: {
      type: String,
      default: '2026-27',
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      default: 'Annual Composite School Fee 2026-27',
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    remainingAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Paid', 'Partial', 'Pending', 'Overdue'],
      default: 'Pending',
    },
    feeBreakdown: [feeBreakdownSchema],
    transactions: [transactionSchema],
  },
  { timestamps: true }
);

// Auto-calculate remaining amount and status before save
feeSchema.pre('save', function () {
  this.remainingAmount = Math.max(0, this.totalAmount - this.paidAmount);
  if (this.paidAmount >= this.totalAmount) {
    this.status = 'Paid';
  } else if (this.paidAmount > 0) {
    this.status = 'Partial';
  } else if (new Date() > new Date(this.dueDate)) {
    this.status = 'Overdue';
  } else {
    this.status = 'Pending';
  }
});

module.exports = mongoose.model('Fee', feeSchema);
