const Fee = require('../models/Fee');
const Timetable = require('../models/Timetable');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Attendance = require('../models/Attendance');
const Assignment = require('../models/Assignment');
const Result = require('../models/Result');
const Complaint = require('../models/Complaint');
const Leave = require('../models/Leave');
const SchoolProfile = require('../models/SchoolProfile');
const Notification = require('../models/Notification');
const Activity = require('../models/Activity');

// ==========================================
// 1. FEES MANAGEMENT
// ==========================================
const getFees = async (req, res) => {
  try {
    const { status, className, academicSession } = req.query;
    const filter = {};
    if (status && status !== 'All') filter.status = status;
    if (className && className !== 'All') filter.className = className;
    if (academicSession) filter.academicSession = academicSession;

    const fees = await Fee.find(filter).sort({ createdAt: -1 });

    const totalBilled = fees.reduce((sum, f) => sum + f.totalAmount, 0);
    const totalCollected = fees.reduce((sum, f) => sum + f.paidAmount, 0);
    const totalOutstanding = fees.reduce((sum, f) => sum + f.remainingAmount, 0);

    res.status(200).json({
      success: true,
      count: fees.length,
      metrics: {
        totalBilled,
        totalCollected,
        totalOutstanding,
      },
      fees,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getFeeById = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id);
    if (!fee) return res.status(404).json({ success: false, message: 'Fee invoice not found' });
    const schoolProfile = (await SchoolProfile.findOne()) || {};
    res.status(200).json({ success: true, fee, schoolProfile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createFeeInvoice = async (req, res) => {
  try {
    const {
      studentId,
      studentName,
      admissionNumber,
      rollNumber,
      className,
      title,
      dueDate,
      feeBreakdown,
    } = req.body;

    const totalAmount = (feeBreakdown || []).reduce((acc, item) => acc + Number(item.amount || 0), 0);
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const fee = await Fee.create({
      studentId,
      studentName,
      admissionNumber,
      rollNumber,
      className,
      academicSession: '2026-27',
      invoiceNumber,
      title: title || 'Composite School Fee 2026-27',
      totalAmount,
      paidAmount: 0,
      remainingAmount: totalAmount,
      dueDate,
      status: 'Pending',
      feeBreakdown,
      transactions: [],
    });

    await Notification.create({
      recipientRole: 'student',
      title: `💰 New Fee Invoice Issued`,
      message: `Invoice #${invoiceNumber} for ₹${totalAmount.toLocaleString('en-IN')} (Due: ${new Date(dueDate).toLocaleDateString()}) has been generated.`,
      type: 'system',
    });

    res.status(201).json({ success: true, fee });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const recordFeePayment = async (req, res) => {
  try {
    const { amount, paymentMethod, transactionRef } = req.body;
    const fee = await Fee.findById(req.params.id);
    if (!fee) return res.status(404).json({ success: false, message: 'Invoice not found' });

    const payAmount = Number(amount);
    const newPaidAmount = fee.paidAmount + payAmount;
    const receiptNumber = `REC-${Date.now().toString().slice(-6)}`;

    fee.paidAmount = newPaidAmount;
    fee.transactions.push({
      amount: payAmount,
      date: new Date(),
      paymentMethod: paymentMethod || 'UPI',
      transactionRef: transactionRef || `TXN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      receiptNumber,
      receivedBy: req.user.name,
    });

    await fee.save();

    await Notification.create({
      recipientRole: 'student',
      title: `✔ Fee Payment Receipt #${receiptNumber}`,
      message: `Received ₹${payAmount.toLocaleString('en-IN')} via ${paymentMethod}. Remaining balance: ₹${fee.remainingAmount.toLocaleString('en-IN')}.`,
      type: 'system',
    });

    await Activity.create({
      title: 'Fee Payment Collected',
      type: 'fee',
      description: `Collected ₹${payAmount.toLocaleString('en-IN')} from ${fee.studentName} (${fee.className}) via ${paymentMethod}.`,
      actor: req.user.name,
    });

    res.status(200).json({ success: true, fee });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const getMyFees = async (req, res) => {
  try {
    let student = await Student.findOne({ email: req.user.email });
    const query = student
      ? { $or: [{ studentId: student._id }, { admissionNumber: student.admissionNumber }, { rollNumber: student.rollNumber }] }
      : { studentName: req.user.name };

    const fees = await Fee.find(query).sort({ createdAt: -1 });
    const schoolProfile = (await SchoolProfile.findOne()) || {};

    const totalBilled = fees.reduce((sum, f) => sum + f.totalAmount, 0);
    const totalPaid = fees.reduce((sum, f) => sum + f.paidAmount, 0);
    const totalDue = fees.reduce((sum, f) => sum + f.remainingAmount, 0);

    res.status(200).json({
      success: true,
      summary: { totalBilled, totalPaid, totalDue },
      fees,
      schoolProfile,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteFeeInvoice = async (req, res) => {
  try {
    const fee = await Fee.findByIdAndDelete(req.params.id);
    if (!fee) return res.status(404).json({ success: false, message: 'Fee invoice not found' });
    res.status(200).json({ success: true, message: 'Fee invoice permanently deleted', feeId: req.params.id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// 2. PERIOD-WISE TIMETABLE
// ==========================================
const getTimetable = async (req, res) => {
  try {
    const { className, section } = req.query;
    const targetClass = className || 'Class 10';
    const targetSection = section || 'Section A';

    let timetable = await Timetable.findOne({ className: targetClass, section: targetSection });
    if (!timetable) {
      // Default Indian Standard School Period Schedule
      timetable = {
        className: targetClass,
        section: targetSection,
        academicSession: '2026-27',
        days: [
          {
            dayName: 'Monday',
            periods: [
              { periodNumber: 1, startTime: '08:00 AM', endTime: '08:45 AM', isBreak: false, subjectName: 'Mathematics', subjectCode: 'MTH-101', teacherName: 'Mrs. Neha Sharma', roomNumber: 'Room 101' },
              { periodNumber: 2, startTime: '08:45 AM', endTime: '09:30 AM', isBreak: false, subjectName: 'English', subjectCode: 'ENG-101', teacherName: 'Dr. Sunita Mehra', roomNumber: 'Room 101' },
              { periodNumber: 3, startTime: '09:30 AM', endTime: '10:15 AM', isBreak: false, subjectName: 'Science', subjectCode: 'SCI-101', teacherName: 'Mr. Rahul Verma', roomNumber: 'Lab 101' },
              { periodNumber: 4, startTime: '10:15 AM', endTime: '10:30 AM', isBreak: true, subjectName: 'Tiffin Break', subjectCode: 'BRK', teacherName: '—', roomNumber: 'Cafeteria' },
              { periodNumber: 5, startTime: '10:30 AM', endTime: '11:15 AM', isBreak: false, subjectName: 'Hindi', subjectCode: 'HIN-101', teacherName: 'Mrs. Pooja Singh', roomNumber: 'Room 101' },
              { periodNumber: 6, startTime: '11:15 AM', endTime: '12:00 PM', isBreak: false, subjectName: 'Computer', subjectCode: 'CS-101', teacherName: 'Mr. Amit Srivastava', roomNumber: 'Computer Lab' },
            ],
          },
          {
            dayName: 'Tuesday',
            periods: [
              { periodNumber: 1, startTime: '08:00 AM', endTime: '08:45 AM', isBreak: false, subjectName: 'Science', subjectCode: 'SCI-101', teacherName: 'Mr. Rahul Verma', roomNumber: 'Lab 101' },
              { periodNumber: 2, startTime: '08:45 AM', endTime: '09:30 AM', isBreak: false, subjectName: 'Mathematics', subjectCode: 'MTH-101', teacherName: 'Mrs. Neha Sharma', roomNumber: 'Room 101' },
              { periodNumber: 3, startTime: '09:30 AM', endTime: '10:15 AM', isBreak: false, subjectName: 'Social Science', subjectCode: 'SST-101', teacherName: 'Mr. Rajesh Gupta', roomNumber: 'Room 101' },
              { periodNumber: 4, startTime: '10:15 AM', endTime: '10:30 AM', isBreak: true, subjectName: 'Tiffin Break', subjectCode: 'BRK', teacherName: '—', roomNumber: 'Cafeteria' },
              { periodNumber: 5, startTime: '10:30 AM', endTime: '11:15 AM', isBreak: false, subjectName: 'English', subjectCode: 'ENG-101', teacherName: 'Dr. Sunita Mehra', roomNumber: 'Room 101' },
              { periodNumber: 6, startTime: '11:15 AM', endTime: '12:00 PM', isBreak: false, subjectName: 'Physical Education', subjectCode: 'PED-101', teacherName: 'Coach Vikram', roomNumber: 'Sports Ground' },
            ],
          },
          {
            dayName: 'Wednesday',
            periods: [
              { periodNumber: 1, startTime: '08:00 AM', endTime: '08:45 AM', isBreak: false, subjectName: 'Mathematics', subjectCode: 'MTH-101', teacherName: 'Mrs. Neha Sharma', roomNumber: 'Room 101' },
              { periodNumber: 2, startTime: '08:45 AM', endTime: '09:30 AM', isBreak: false, subjectName: 'Social Science', subjectCode: 'SST-101', teacherName: 'Mr. Rajesh Gupta', roomNumber: 'Room 101' },
              { periodNumber: 3, startTime: '09:30 AM', endTime: '10:15 AM', isBreak: false, subjectName: 'Hindi', subjectCode: 'HIN-101', teacherName: 'Mrs. Pooja Singh', roomNumber: 'Room 101' },
              { periodNumber: 4, startTime: '10:15 AM', endTime: '10:30 AM', isBreak: true, subjectName: 'Tiffin Break', subjectCode: 'BRK', teacherName: '—', roomNumber: 'Cafeteria' },
              { periodNumber: 5, startTime: '10:30 AM', endTime: '11:15 AM', isBreak: false, subjectName: 'Science', subjectCode: 'SCI-101', teacherName: 'Mr. Rahul Verma', roomNumber: 'Lab 101' },
              { periodNumber: 6, startTime: '11:15 AM', endTime: '12:00 PM', isBreak: false, subjectName: 'Computer', subjectCode: 'CS-101', teacherName: 'Mr. Amit Srivastava', roomNumber: 'Computer Lab' },
            ],
          },
          {
            dayName: 'Thursday',
            periods: [
              { periodNumber: 1, startTime: '08:00 AM', endTime: '08:45 AM', isBreak: false, subjectName: 'Science', subjectCode: 'SCI-101', teacherName: 'Mr. Rahul Verma', roomNumber: 'Lab 101' },
              { periodNumber: 2, startTime: '08:45 AM', endTime: '09:30 AM', isBreak: false, subjectName: 'Mathematics', subjectCode: 'MTH-101', teacherName: 'Mrs. Neha Sharma', roomNumber: 'Room 101' },
              { periodNumber: 3, startTime: '09:30 AM', endTime: '10:15 AM', isBreak: false, subjectName: 'English', subjectCode: 'ENG-101', teacherName: 'Dr. Sunita Mehra', roomNumber: 'Room 101' },
              { periodNumber: 4, startTime: '10:15 AM', endTime: '10:30 AM', isBreak: true, subjectName: 'Tiffin Break', subjectCode: 'BRK', teacherName: '—', roomNumber: 'Cafeteria' },
              { periodNumber: 5, startTime: '10:30 AM', endTime: '11:15 AM', isBreak: false, subjectName: 'Hindi', subjectCode: 'HIN-101', teacherName: 'Mrs. Pooja Singh', roomNumber: 'Room 101' },
              { periodNumber: 6, startTime: '11:15 AM', endTime: '12:00 PM', isBreak: false, subjectName: 'General Knowledge', subjectCode: 'GK-101', teacherName: 'Mr. Rajesh Gupta', roomNumber: 'Room 101' },
            ],
          },
          {
            dayName: 'Friday',
            periods: [
              { periodNumber: 1, startTime: '08:00 AM', endTime: '08:45 AM', isBreak: false, subjectName: 'Mathematics', subjectCode: 'MTH-101', teacherName: 'Mrs. Neha Sharma', roomNumber: 'Room 101' },
              { periodNumber: 2, startTime: '08:45 AM', endTime: '09:30 AM', isBreak: false, subjectName: 'Science Practical', subjectCode: 'SCI-101', teacherName: 'Mr. Rahul Verma', roomNumber: 'Physics Lab' },
              { periodNumber: 3, startTime: '09:30 AM', endTime: '10:15 AM', isBreak: false, subjectName: 'Science Practical', subjectCode: 'SCI-101', teacherName: 'Mr. Rahul Verma', roomNumber: 'Chemistry Lab' },
              { periodNumber: 4, startTime: '10:15 AM', endTime: '10:30 AM', isBreak: true, subjectName: 'Tiffin Break', subjectCode: 'BRK', teacherName: '—', roomNumber: 'Cafeteria' },
              { periodNumber: 5, startTime: '10:30 AM', endTime: '11:15 AM', isBreak: false, subjectName: 'English', subjectCode: 'ENG-101', teacherName: 'Dr. Sunita Mehra', roomNumber: 'Room 101' },
              { periodNumber: 6, startTime: '11:15 AM', endTime: '12:00 PM', isBreak: false, subjectName: 'Sanskrit', subjectCode: 'SKT-101', teacherName: 'Mrs. Pooja Singh', roomNumber: 'Room 101' },
            ],
          },
          {
            dayName: 'Saturday',
            periods: [
              { periodNumber: 1, startTime: '08:00 AM', endTime: '08:45 AM', isBreak: false, subjectName: 'Weekly Unit Test', subjectCode: 'TEST', teacherName: 'Class Teacher', roomNumber: 'Room 101' },
              { periodNumber: 2, startTime: '08:45 AM', endTime: '09:30 AM', isBreak: false, subjectName: 'Club Activities / Debate', subjectCode: 'ACT', teacherName: 'Dr. Sunita Mehra', roomNumber: 'Auditorium' },
              { periodNumber: 3, startTime: '09:30 AM', endTime: '10:15 AM', isBreak: false, subjectName: 'Sports & Yoga', subjectCode: 'PED-101', teacherName: 'Coach Vikram', roomNumber: 'Playground' },
              { periodNumber: 4, startTime: '10:15 AM', endTime: '10:30 AM', isBreak: true, subjectName: 'Break', subjectCode: 'BRK', teacherName: '—', roomNumber: 'Cafeteria' },
              { periodNumber: 5, startTime: '10:30 AM', endTime: '11:15 AM', isBreak: false, subjectName: 'Library Period', subjectCode: 'LIB', teacherName: 'Librarian', roomNumber: 'Library' },
            ],
          },
        ],
      };
    }

    res.status(200).json({ success: true, timetable });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const saveTimetable = async (req, res) => {
  try {
    const { className, section, days, academicSession } = req.body;
    const timetable = await Timetable.findOneAndUpdate(
      { className, section },
      { className, section, days, academicSession: academicSession || '2026-27' },
      { upsert: true, new: true }
    );
    res.status(200).json({ success: true, timetable });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ==========================================
// 3. INSTITUTIONAL REPORTS GENERATOR
// ==========================================
const getInstitutionalReports = async (req, res) => {
  try {
    const [
      students,
      teachers,
      attendance,
      results,
      fees,
      assignments,
      complaints,
      leaves,
      schoolProfile,
    ] = await Promise.all([
      Student.find().sort({ admissionNumber: 1 }),
      Teacher.find(),
      Attendance.find(),
      Result.find().sort({ percentage: -1 }),
      Fee.find().sort({ createdAt: -1 }),
      Assignment.find(),
      Complaint.find().sort({ createdAt: -1 }),
      Leave.find().sort({ createdAt: -1 }),
      SchoolProfile.findOne(),
    ]);

    // Compute Attendance Metrics
    let totalRosterEntries = 0;
    let totalPresents = 0;
    attendance.forEach((session) => {
      session.records.forEach((r) => {
        totalRosterEntries++;
        if (r.status === 'Present') totalPresents++;
      });
    });
    const overallAttendanceRate = totalRosterEntries > 0 ? ((totalPresents / totalRosterEntries) * 100).toFixed(1) : '95.0';

    // Compute Result Metrics
    const totalResults = results.length;
    const passCount = results.filter((r) => r.resultStatus === 'Pass').length;
    const passRate = totalResults > 0 ? ((passCount / totalResults) * 100).toFixed(1) : '100.0';
    const averageScore = totalResults > 0 ? (results.reduce((s, r) => s + r.percentage, 0) / totalResults).toFixed(1) : '0';

    // Compute Fee Metrics
    const totalFeeBilled = fees.reduce((s, f) => s + f.totalAmount, 0);
    const totalFeeCollected = fees.reduce((s, f) => s + f.paidAmount, 0);
    const totalFeeDues = fees.reduce((s, f) => s + f.remainingAmount, 0);
    const feeCollectionRate = totalFeeBilled > 0 ? ((totalFeeCollected / totalFeeBilled) * 100).toFixed(1) : '0';

    // Compute Assignment Metrics
    const totalAssignments = assignments.length;
    let totalSubmissions = 0;
    let totalGraded = 0;
    assignments.forEach((a) => {
      totalSubmissions += a.submissions?.length || 0;
      totalGraded += a.submissions?.filter((s) => s.status === 'Graded').length || 0;
    });

    // Compute Complaint Metrics
    const totalComplaints = complaints.length;
    const resolvedComplaints = complaints.filter((c) => c.status === 'Resolved').length;

    // Compute Leave Metrics
    const totalLeaves = leaves.length;
    const approvedLeaves = leaves.filter((l) => l.status === 'Approved').length;

    res.status(200).json({
      success: true,
      schoolProfile: schoolProfile || {},
      reports: {
        students: {
          totalStudents: students.length,
          data: students,
        },
        attendance: {
          totalSessions: attendance.length,
          overallAttendanceRate: `${overallAttendanceRate}%`,
          data: attendance,
        },
        results: {
          totalEvaluated: totalResults,
          passRate: `${passRate}%`,
          averageScore: `${averageScore}%`,
          data: results,
        },
        fees: {
          totalBilled: totalFeeBilled,
          totalCollected: totalFeeCollected,
          totalDues: totalFeeDues,
          collectionRate: `${feeCollectionRate}%`,
          data: fees,
        },
        assignments: {
          totalAssignments,
          totalSubmissions,
          totalGraded,
          data: assignments,
        },
        complaints: {
          totalComplaints,
          resolvedComplaints,
          data: complaints,
        },
        leaves: {
          totalLeaves,
          approvedLeaves,
          data: leaves,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getFees,
  getFeeById,
  createFeeInvoice,
  recordFeePayment,
  getMyFees,
  deleteFeeInvoice,
  getTimetable,
  saveTimetable,
  getInstitutionalReports,
};
