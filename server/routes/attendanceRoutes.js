const express = require('express');
const router = express.Router();
const {
  saveAttendance,
  getSessionAttendance,
  getMyAttendance,
  getAdminAttendanceReports,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Base route: /api/attendance
router.use(protect);

// 1. Mark & Save Attendance (Teacher & Admin)
router.post('/', authorize('teacher', 'admin'), saveAttendance);

// 2. Fetch Session Roster or Marked Records (Teacher, Admin, Student)
router.get('/session', getSessionAttendance);

// 3. Student Personal Attendance (Daily, Monthly, History)
router.get('/my-attendance', getMyAttendance);

// 4. Admin Complete Reports & Analytics
router.get('/reports', authorize('admin'), getAdminAttendanceReports);

module.exports = router;
