const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// All admin routes require Admin role
router.use(protect);
router.use(authorize('admin'));

// Stats
router.get('/stats', getDashboardStats);

// School Profile & Configuration
router.get('/school-profile', getSchoolProfile);
router.put('/school-profile', updateSchoolProfile);

// Students CRUD & Status
router.get('/students', getStudents);
router.get('/students/:id', getStudentById);
router.post('/students', createStudent);
router.put('/students/:id', updateStudent);
router.patch('/students/:id/status', toggleStudentStatus);
router.delete('/students/:id', deleteStudent);

// Teachers CRUD, Assignments & Status
router.get('/teachers', getTeachers);
router.get('/teachers/:id', getTeacherById);
router.post('/teachers', createTeacher);
router.put('/teachers/:id', updateTeacher);
router.patch('/teachers/:id/assignments', assignTeacherClassesAndSubjects);
router.patch('/teachers/:id/status', toggleTeacherStatus);
router.delete('/teachers/:id', deleteTeacher);

// Classes Hierarchy & Subject-Teacher Allocations
router.get('/classes', getClasses);
router.post('/classes', createClass);
router.put('/classes/:id', updateClass);
router.patch('/classes/:id/class-teacher', updateClassTeacher);
router.post('/classes/:id/subjects', assignSubjectToClass);
router.delete('/classes/:id/subjects/:subjectCode', removeSubjectFromClass);
router.delete('/classes/:id', deleteClass);

// Master Subjects Catalog
router.get('/subjects', getSubjects);
router.post('/subjects', createSubject);
router.put('/subjects/:id', updateSubject);
router.delete('/subjects/:id', deleteSubject);

// Notices
router.get('/notices', getNotices);
router.post('/notices', createNotice);
router.delete('/notices/:id', deleteNotice);

// Complaints
router.get('/complaints', getComplaints);
router.patch('/complaints/:id', updateComplaintStatus);

// Fees
router.get('/fees', getFees);
router.patch('/fees/:id', updateFeeStatus);

// Leaves
router.get('/leaves', getLeaves);
router.patch('/leaves/:id', updateLeaveStatus);

module.exports = router;
