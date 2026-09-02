const express = require('express');
const router = express.Router();
const {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  gradeSubmission,
  getMyAssignments,
} = require('../controllers/assignmentController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

// Student personal assignments
router.get('/my-assignments', getMyAssignments);

// General CRUD
router.get('/', getAssignments);
router.get('/:id', getAssignmentById);
router.post('/', authorize('teacher', 'admin'), createAssignment);
router.put('/:id', authorize('teacher', 'admin'), updateAssignment);
router.delete('/:id', authorize('teacher', 'admin'), deleteAssignment);

// Student Homework Submission
router.post('/:id/submit', submitAssignment);

// Teacher Grading
router.patch('/:id/submissions/:submissionId/grade', authorize('teacher', 'admin'), gradeSubmission);

module.exports = router;
