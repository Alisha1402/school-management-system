const Notice = require('../models/Notice');
const Complaint = require('../models/Complaint');
const Leave = require('../models/Leave');
const Notification = require('../models/Notification');
const Student = require('../models/Student');
const Activity = require('../models/Activity');

// ==========================================
// NOTICES
// ==========================================
const getNotices = async (req, res) => {
  try {
    const { category, audience, priority } = req.query;
    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (audience && audience !== 'All') filter.audience = audience;
    if (priority && priority !== 'All') filter.priority = priority;

    const notices = await Notice.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: notices.length, notices });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createNotice = async (req, res) => {
  try {
    const notice = await Notice.create({
      ...req.body,
      postedBy: req.body.postedBy || req.user.name,
    });

    // Create Notification broadcast
    const roleMap = {
      All: 'all',
      Students: 'student',
      Teachers: 'teacher',
      Parents: 'student',
    };
    await Notification.create({
      recipientRole: roleMap[notice.audience] || 'all',
      title: `📢 New Circular: ${notice.title}`,
      message: notice.content.substring(0, 120) + '...',
      type: 'notice',
    });

    await Activity.create({
      title: 'School Notice Published',
      type: 'notice',
      description: `[${notice.category}] ${notice.title} published for ${notice.audience}.`,
      actor: req.user.name,
    });

    res.status(201).json({ success: true, notice });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const deleteNotice = async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Notice deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// COMPLAINTS & GRIEVANCES
// ==========================================
const getComplaints = async (req, res) => {
  try {
    const { status, category } = req.query;
    const filter = {};
    if (status && status !== 'All') filter.status = status;
    if (category && category !== 'All') filter.category = category;

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: complaints.length, complaints });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const submitComplaint = async (req, res) => {
  try {
    let student = await Student.findOne({ email: req.user.email });
    if (!student) {
      student = {
        _id: req.user._id,
        name: req.user.name,
        admissionNumber: 'ADM/2026/0101',
        rollNumber: '101',
        className: 'Class 10',
      };
    }

    const complaint = await Complaint.create({
      studentId: student._id,
      studentName: student.name,
      admissionNumber: student.admissionNumber,
      rollNumber: student.rollNumber,
      className: student.className,
      subject: req.body.subject,
      category: req.body.category || 'Academic',
      description: req.body.description,
      status: 'Pending',
    });

    await Notification.create({
      recipientRole: 'admin',
      title: `💬 New Grievance Submitted`,
      message: `${student.name} (${student.className}) filed a complaint regarding: ${complaint.subject}`,
      type: 'complaint',
    });

    await Activity.create({
      title: 'Complaint Filed',
      type: 'complaint',
      description: `${student.name} logged a grievance: "${complaint.subject}".`,
      actor: student.name,
    });

    res.status(201).json({ success: true, complaint });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const respondToComplaint = async (req, res) => {
  try {
    const { status, adminResponse } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        status: status || 'Resolved',
        adminResponse,
        resolvedBy: req.user.name,
        resolvedAt: new Date(),
      },
      { new: true }
    );

    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    // Notify the student
    await Notification.create({
      recipientRole: 'student',
      title: `✔ Grievance Response: ${complaint.subject}`,
      message: `Your complaint has been reviewed and marked ${complaint.status}. Remarks: ${adminResponse}`,
      type: 'complaint',
    });

    res.status(200).json({ success: true, complaint });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const getMyComplaints = async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.user.email });
    const query = student ? { $or: [{ studentId: student._id }, { studentName: student.name }] } : { studentName: req.user.name };
    const complaints = await Complaint.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: complaints.length, complaints });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// LEAVE APPLICATIONS
// ==========================================
const getLeaves = async (req, res) => {
  try {
    const { status, applicantRole } = req.query;
    const filter = {};
    if (status && status !== 'All') filter.status = status;
    if (applicantRole && applicantRole !== 'All') filter.applicantRole = applicantRole;

    const leaves = await Leave.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: leaves.length, leaves });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);

    let student = await Student.findOne({ email: req.user.email });
    if (!student) {
      student = {
        _id: req.user._id,
        name: req.user.name,
        admissionNumber: 'ADM/2026/0101',
        rollNumber: '101',
        className: 'Class 10',
      };
    }

    const leave = await Leave.create({
      applicantId: student._id,
      applicantName: req.user.name,
      applicantRole: req.user.role === 'teacher' ? 'teacher' : 'student',
      className: student.className || 'Class 10',
      admissionNumber: student.admissionNumber || '',
      rollNumber: student.rollNumber || '',
      leaveType: leaveType || 'Sick Leave',
      startDate: start,
      endDate: end,
      totalDays,
      reason,
      status: 'Pending',
    });

    await Notification.create({
      recipientRole: 'teacher',
      title: `🏖️ Leave Request: ${req.user.name}`,
      message: `${req.user.name} applied for ${totalDays} day(s) ${leave.leaveType} (${startDate} to ${endDate}).`,
      type: 'leave',
    });

    await Activity.create({
      title: 'Leave Application Submitted',
      type: 'leave',
      description: `${req.user.name} applied for ${totalDays} day(s) ${leave.leaveType}.`,
      actor: req.user.name,
    });

    res.status(201).json({ success: true, leave });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const reviewLeave = async (req, res) => {
  try {
    const { status, adminRemark } = req.body;
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminRemark: adminRemark || 'Leave decision finalized.',
        reviewedBy: req.user.name,
        reviewedAt: new Date(),
      },
      { new: true }
    );

    if (!leave) return res.status(404).json({ success: false, message: 'Leave application not found' });

    // Notify applicant
    await Notification.create({
      recipientRole: leave.applicantRole,
      title: `🏖️ Leave Request ${status}`,
      message: `Your leave application for ${leave.totalDays} day(s) was ${status.toLowerCase()}. Remarks: ${adminRemark || 'Approved by Class Teacher'}`,
      type: 'leave',
    });

    await Activity.create({
      title: `Leave Application ${status}`,
      type: 'leave',
      description: `${leave.applicantName}'s leave application was ${status.toLowerCase()}.`,
      actor: req.user.name,
    });

    res.status(200).json({ success: true, leave });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({
      $or: [{ applicantName: req.user.name }, { applicantId: req.user._id }],
    }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: leaves.length, leaves });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndDelete(req.params.id);
    if (!leave) return res.status(404).json({ success: false, message: 'Leave application not found' });
    res.status(200).json({ success: true, message: 'Leave record permanently deleted', leaveId: req.params.id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint record not found' });
    res.status(200).json({ success: true, message: 'Complaint record permanently deleted', complaintId: req.params.id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// NOTIFICATIONS
// ==========================================
const getNotifications = async (req, res) => {
  try {
    const role = req.user.role;
    const notifications = await Notification.find({
      $or: [{ recipientRole: 'all' }, { recipientRole: role }, { recipientEmail: req.user.email }],
    })
      .sort({ createdAt: -1 })
      .limit(20);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.status(200).json({ success: true, unreadCount, count: notifications.length, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    const role = req.user.role;
    await Notification.updateMany(
      { $or: [{ recipientRole: 'all' }, { recipientRole: role }, { recipientEmail: req.user.email }] },
      { isRead: true }
    );
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getNotices,
  createNotice,
  deleteNotice,
  getComplaints,
  submitComplaint,
  respondToComplaint,
  getMyComplaints,
  getLeaves,
  applyLeave,
  reviewLeave,
  getMyLeaves,
  deleteLeave,
  deleteComplaint,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
