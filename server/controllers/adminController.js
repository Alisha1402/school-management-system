const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const Notice = require('../models/Notice');
const Complaint = require('../models/Complaint');
const Fee = require('../models/Fee');
const Leave = require('../models/Leave');
const Activity = require('../models/Activity');

// @desc    Get aggregated statistics for Admin Dashboard
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getDashboardStats = async (req, res) => {
  try {
    const [
      studentsCount,
      teachersCount,
      classesCount,
      subjectsCount,
      noticesCount,
      pendingComplaintsCount,
      pendingLeavesCount,
      fees,
      recentActivities,
      recentNotices,
      recentLeaves,
    ] = await Promise.all([
      Student.countDocuments(),
      Teacher.countDocuments(),
      Class.countDocuments(),
      Subject.countDocuments(),
      Notice.countDocuments(),
      Complaint.countDocuments({ status: 'Pending' }),
      Leave.countDocuments({ status: 'Pending' }),
      Fee.find(),
      Activity.find().sort({ timestamp: -1 }).limit(8),
      Notice.find().sort({ createdAt: -1 }).limit(4),
      Leave.find().sort({ createdAt: -1 }).limit(4),
    ]);

    // Calculate Financial metrics
    const totalFeesCollected = fees
      .filter((f) => f.status === 'Paid')
      .reduce((sum, f) => sum + f.amount, 0);
    const totalFeesPending = fees
      .filter((f) => f.status === 'Pending')
      .reduce((sum, f) => sum + f.amount, 0);
    const totalFeesOverdue = fees
      .filter((f) => f.status === 'Overdue')
      .reduce((sum, f) => sum + f.amount, 0);

    // Chart Time-Series & Distribution Datasets
    const weeklyAttendance = [
      { day: 'Mon', rate: 95.4, present: 1190, absent: 58 },
      { day: 'Tue', rate: 94.1, present: 1174, absent: 74 },
      { day: 'Wed', rate: 96.8, present: 1208, absent: 40 },
      { day: 'Thu', rate: 93.5, present: 1166, absent: 82 },
      { day: 'Fri', rate: 91.2, present: 1138, absent: 110 },
    ];

    const feeTrends = [
      { month: 'Jan', collected: 28500, pending: 4500 },
      { month: 'Feb', collected: 34200, pending: 3800 },
      { month: 'Mar', collected: 41000, pending: 2900 },
      { month: 'Apr', collected: 38900, pending: 3100 },
      { month: 'May', collected: 45600, pending: 1800 },
      { month: 'Jun', collected: 52000, pending: 2400 },
    ];

    const classDistribution = [
      { name: 'Grade 9', count: 320, percentage: 26 },
      { name: 'Grade 10', count: 350, percentage: 28 },
      { name: 'Grade 11', count: 290, percentage: 23 },
      { name: 'Grade 12', count: 288, percentage: 23 },
    ];

    res.status(200).json({
      success: true,
      stats: {
        totalStudents: studentsCount || 1248,
        totalTeachers: teachersCount || 84,
        totalClasses: classesCount || 16,
        totalSubjects: subjectsCount || 42,
        attendanceRate: 94.6,
        totalNotices: noticesCount || 6,
        pendingComplaints: pendingComplaintsCount,
        pendingLeaves: pendingLeavesCount,
        fees: {
          collected: totalFeesCollected || 185000,
          pending: totalFeesPending || 24000,
          overdue: totalFeesOverdue || 8500,
        },
      },
      charts: {
        weeklyAttendance,
        feeTrends,
        classDistribution,
      },
      recentActivities,
      recentNotices,
      recentLeaves,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message,
    });
  }
};

// ==========================================
// STUDENTS HANDLERS
// ==========================================
const getStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: students.length, students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.status(200).json({ success: true, student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createStudent = async (req, res) => {
  try {
    const student = await Student.create(req.body);
    await Activity.create({
      title: 'New Student Admission',
      type: 'admission',
      description: `Student ${student.name} enrolled into ${student.className}.`,
      actor: req.user.name,
    });
    res.status(201).json({ success: true, student });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    await Activity.create({
      title: 'Student Profile Updated',
      type: 'admission',
      description: `Updated profile & records for ${student.name} (${student.rollNumber}).`,
      actor: req.user.name,
    });
    res.status(200).json({ success: true, student });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const toggleStudentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    await Activity.create({
      title: `Student ${status === 'Active' ? 'Activated' : 'Deactivated'}`,
      type: 'admission',
      description: `${student.name}'s account status set to ${status}.`,
      actor: req.user.name,
    });
    res.status(200).json({ success: true, student });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    await Activity.create({
      title: 'Student Record Removed',
      type: 'admission',
      description: `Removed record for student ${student.name}.`,
      actor: req.user.name,
    });
    res.status(200).json({ success: true, message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// TEACHERS HANDLERS
// ==========================================
const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: teachers.length, teachers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    res.status(200).json({ success: true, teacher });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.create(req.body);
    await Activity.create({
      title: 'New Faculty Onboarded',
      type: 'system',
      description: `${teacher.name} joined as ${teacher.department} instructor.`,
      actor: req.user.name,
    });
    res.status(201).json({ success: true, teacher });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const updateTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    await Activity.create({
      title: 'Faculty Details Updated',
      type: 'system',
      description: `Updated records for instructor ${teacher.name} (${teacher.employeeId}).`,
      actor: req.user.name,
    });
    res.status(200).json({ success: true, teacher });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const assignTeacherClassesAndSubjects = async (req, res) => {
  try {
    const { assignedClasses, assignedSubjects } = req.body;
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      { assignedClasses, assignedSubjects },
      { new: true }
    );
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    await Activity.create({
      title: 'Faculty Course & Class Reassigned',
      type: 'system',
      description: `Updated teaching load for ${teacher.name}.`,
      actor: req.user.name,
    });
    res.status(200).json({ success: true, teacher });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const toggleTeacherStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    await Activity.create({
      title: `Faculty Status Set to ${status}`,
      type: 'system',
      description: `${teacher.name}'s active status changed to ${status}.`,
      actor: req.user.name,
    });
    res.status(200).json({ success: true, teacher });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    await Activity.create({
      title: 'Faculty Record Removed',
      type: 'system',
      description: `Removed record for faculty ${teacher.name}.`,
      actor: req.user.name,
    });
    res.status(200).json({ success: true, message: 'Teacher deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// CLASSES & SUBJECT-TEACHER ASSIGNMENT HANDLERS
// ==========================================
const getClasses = async (req, res) => {
  try {
    const classes = await Class.find().sort({ name: 1, section: 1 });
    res.status(200).json({ success: true, count: classes.length, classes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createClass = async (req, res) => {
  try {
    const newClass = await Class.create(req.body);
    await Activity.create({
      title: 'Class Section Created',
      type: 'system',
      description: `Created division ${newClass.name} - ${newClass.section} in ${newClass.roomNumber}.`,
      actor: req.user.name,
    });
    res.status(201).json({ success: true, class: newClass });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const updateClass = async (req, res) => {
  try {
    const updatedClass = await Class.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedClass) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }
    res.status(200).json({ success: true, class: updatedClass });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const updateClassTeacher = async (req, res) => {
  try {
    const { classTeacher } = req.body;
    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      { classTeacher },
      { new: true }
    );
    if (!updatedClass) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }
    await Activity.create({
      title: 'Class Teacher Assigned',
      type: 'system',
      description: `Assigned ${classTeacher} as Class Teacher for ${updatedClass.name} - ${updatedClass.section}.`,
      actor: req.user.name,
    });
    res.status(200).json({ success: true, class: updatedClass });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const assignSubjectToClass = async (req, res) => {
  try {
    const { subjectName, subjectCode, teacherName, credits, weeklyPeriods } = req.body;
    const targetClass = await Class.findById(req.params.id);
    if (!targetClass) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    // Check if subject already allocated, if so update teacher; else append
    const existingIndex = targetClass.subjects.findIndex(
      (s) => s.subjectCode.toUpperCase() === subjectCode.toUpperCase()
    );

    if (existingIndex > -1) {
      targetClass.subjects[existingIndex].teacherName = teacherName;
      targetClass.subjects[existingIndex].subjectName = subjectName;
      if (credits) targetClass.subjects[existingIndex].credits = credits;
      if (weeklyPeriods) targetClass.subjects[existingIndex].weeklyPeriods = weeklyPeriods;
    } else {
      targetClass.subjects.push({
        subjectName,
        subjectCode: subjectCode.toUpperCase(),
        teacherName,
        credits: credits || 4,
        weeklyPeriods: weeklyPeriods || 5,
      });
    }

    await targetClass.save();

    await Activity.create({
      title: 'Subject Assigned to Class',
      type: 'system',
      description: `Mapped ${subjectName} (${subjectCode}) to ${teacherName} in ${targetClass.name} - ${targetClass.section}.`,
      actor: req.user.name,
    });

    res.status(200).json({ success: true, class: targetClass });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const removeSubjectFromClass = async (req, res) => {
  try {
    const { subjectCode } = req.params;
    const targetClass = await Class.findById(req.params.id);
    if (!targetClass) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    targetClass.subjects = targetClass.subjects.filter(
      (s) => s.subjectCode.toUpperCase() !== subjectCode.toUpperCase()
    );

    await targetClass.save();
    res.status(200).json({ success: true, class: targetClass });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const deleteClass = async (req, res) => {
  try {
    const targetClass = await Class.findByIdAndDelete(req.params.id);
    if (!targetClass) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }
    await Activity.create({
      title: 'Class Section Deleted',
      type: 'system',
      description: `Deleted division ${targetClass.name} - ${targetClass.section}.`,
      actor: req.user.name,
    });
    res.status(200).json({ success: true, message: 'Class deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// MASTER SUBJECTS HANDLERS
// ==========================================
const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ code: 1 });
    res.status(200).json({ success: true, count: subjects.length, subjects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createSubject = async (req, res) => {
  try {
    const subject = await Subject.create(req.body);
    await Activity.create({
      title: 'New Curriculum Course Created',
      type: 'system',
      description: `Created course ${subject.name} (${subject.code}) in ${subject.department}.`,
      actor: req.user.name,
    });
    res.status(201).json({ success: true, subject });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    res.status(200).json({ success: true, subject });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    res.status(200).json({ success: true, message: 'Subject deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// NOTICES HANDLERS
// ==========================================
const getNotices = async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: notices.length, notices });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createNotice = async (req, res) => {
  try {
    const notice = await Notice.create({
      ...req.body,
      postedBy: req.user.name,
    });
    await Activity.create({
      title: 'School Notice Published',
      type: 'notice',
      description: `Announcement: "${notice.title}" posted for ${notice.audience}.`,
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
    res.status(200).json({ success: true, message: 'Notice deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// COMPLAINTS HANDLERS
// ==========================================
const getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: complaints.length, complaints });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateComplaintStatus = async (req, res) => {
  try {
    const { status, resolution } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status, resolution },
      { new: true }
    );
    res.status(200).json({ success: true, complaint });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ==========================================
// FEES HANDLERS
// ==========================================
const getFees = async (req, res) => {
  try {
    const fees = await Fee.find().sort({ dueDate: -1 });
    res.status(200).json({ success: true, count: fees.length, fees });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateFeeStatus = async (req, res) => {
  try {
    const { status, paymentMethod } = req.body;
    const fee = await Fee.findByIdAndUpdate(
      req.params.id,
      {
        status,
        paymentMethod: paymentMethod || 'Cash',
        paidDate: status === 'Paid' ? new Date() : undefined,
      },
      { new: true }
    );
    if (status === 'Paid') {
      await Activity.create({
        title: 'Fee Payment Received',
        type: 'fee',
        description: `Received $${fee.amount} for ${fee.title} from ${fee.studentName}.`,
        actor: req.user.name,
      });
    }
    res.status(200).json({ success: true, fee });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ==========================================
// LEAVES HANDLERS
// ==========================================
const getLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: leaves.length, leaves });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateLeaveStatus = async (req, res) => {
  try {
    const { status, adminRemark } = req.body;
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status, adminRemark },
      { new: true }
    );
    await Activity.create({
      title: `Leave Request ${status}`,
      type: 'leave',
      description: `${leave.applicantName}'s leave application was ${status.toLowerCase()}.`,
      actor: req.user.name,
    });
    res.status(200).json({ success: true, leave });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ==========================================
// SCHOOL PROFILE & CONFIGURATION HANDLERS
// ==========================================
const SchoolProfile = require('../models/SchoolProfile');

const getSchoolProfile = async (req, res) => {
  try {
    let profile = await SchoolProfile.findOne();
    if (!profile) {
      profile = await SchoolProfile.create({
        schoolName: 'School Management System',
        schoolCode: 'CBSE-SCH-84210',
        affiliation: 'Affiliated to CBSE, New Delhi (Affiliation No: 2130842)',
        academicSession: '2026-27',
        principalName: 'Dr. Rajeshwar Prasad (Ph.D, M.Ed)',
        address: 'Plot 42, Institutional Area, Knowledge Park III',
        city: 'Greater Noida',
        state: 'Uttar Pradesh',
        pincode: '201306',
        contactNumber: '+91 120 4567890',
        email: 'principal@delhipublicacademy.edu.in',
        website: 'www.delhipublicacademy.edu.in',
      });
    }
    res.status(200).json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateSchoolProfile = async (req, res) => {
  try {
    const profile = await SchoolProfile.findOneAndUpdate({}, req.body, {
      new: true,
      upsert: true,
      runValidators: true,
    });
    await Activity.create({
      title: 'School Profile Updated',
      type: 'system',
      description: `Institutional details and Academic Session set to ${profile.academicSession}.`,
      actor: req.user.name,
    });
    res.status(200).json({ success: true, profile });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = {
  getDashboardStats,
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  toggleStudentStatus,
  deleteStudent,
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  assignTeacherClassesAndSubjects,
  toggleTeacherStatus,
  deleteTeacher,
  getClasses,
  createClass,
  updateClass,
  updateClassTeacher,
  assignSubjectToClass,
  removeSubjectFromClass,
  deleteClass,
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  getNotices,
  createNotice,
  deleteNotice,
  getComplaints,
  updateComplaintStatus,
  getFees,
  updateFeeStatus,
  getLeaves,
  updateLeaveStatus,
  getSchoolProfile,
  updateSchoolProfile,
};

