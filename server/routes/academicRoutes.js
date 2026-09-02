const express = require('express');
const router = express.Router();
const {
  getExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  getResults,
  publishResult,
  getMyResults,
  getStudentReportCard,
} = require('../controllers/academicController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

// Student Personal Results & Report Card
router.get('/my-results', getMyResults);
router.get('/report-card/:id', getStudentReportCard);

// Exam Schedules
router.get('/exams', getExams);
router.get('/exams/:id', getExamById);
router.post('/exams', authorize('admin', 'teacher'), createExam);
router.put('/exams/:id', authorize('admin', 'teacher'), updateExam);
router.delete('/exams/:id', authorize('admin'), deleteExam);

// Results & Grading
router.get('/results', getResults);
router.post('/results/publish', authorize('admin', 'teacher'), publishResult);

module.exports = router;
