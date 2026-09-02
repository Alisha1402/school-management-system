const express = require('express');
const router = express.Router();
const {
  getFees,
  getFeeById,
  createFeeInvoice,
  recordFeePayment,
  getMyFees,
  deleteFeeInvoice,
  getTimetable,
  saveTimetable,
  getInstitutionalReports,
} = require('../controllers/financeController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

// Student Fees
router.get('/my-fees', getMyFees);
router.get('/fees', getFees);
router.get('/fees/:id', getFeeById);
router.post('/fees', authorize('admin'), createFeeInvoice);
router.patch('/fees/:id/pay', authorize('admin'), recordFeePayment);
router.delete('/fees/:id', authorize('admin'), deleteFeeInvoice);

// Timetable
router.get('/timetable', getTimetable);
router.post('/timetable', authorize('admin'), saveTimetable);

// Institutional Reports
router.get('/reports', authorize('admin'), getInstitutionalReports);

module.exports = router;
