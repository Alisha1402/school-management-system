const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  adminOnly,
  teacherOnly,
  studentOnly,
} = require('../controllers/authController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);

// Role-based protected verification routes
router.get('/admin-only', protect, authorize('admin'), adminOnly);
router.get('/teacher-only', protect, authorize('teacher', 'admin'), teacherOnly);
router.get('/student-only', protect, authorize('student', 'admin'), studentOnly);

module.exports = router;
