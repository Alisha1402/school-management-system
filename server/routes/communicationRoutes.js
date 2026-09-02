const express = require('express');
const router = express.Router();
const {
  getNotices,
  createNotice,
  deleteNotice,
  getComplaints,
  submitComplaint,
  respondToComplaint,
  getMyComplaints,
  deleteComplaint,
  getLeaves,
  applyLeave,
  reviewLeave,
  getMyLeaves,
  deleteLeave,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require('../controllers/communicationController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

// Notifications
router.get('/notifications', getNotifications);
router.patch('/notifications/read-all', markAllNotificationsRead);
router.patch('/notifications/:id/read', markNotificationRead);

// Notices
router.get('/notices', getNotices);
router.post('/notices', authorize('admin', 'teacher'), createNotice);
router.delete('/notices/:id', authorize('admin'), deleteNotice);

// Complaints & Grievances
router.get('/complaints', getComplaints);
router.get('/my-complaints', getMyComplaints);
router.post('/complaints', submitComplaint);
router.patch('/complaints/:id/respond', authorize('admin', 'teacher'), respondToComplaint);
router.delete('/complaints/:id', authorize('admin'), deleteComplaint);

// Leaves
router.get('/leaves', getLeaves);
router.get('/my-leaves', getMyLeaves);
router.post('/leaves', applyLeave);
router.patch('/leaves/:id/review', authorize('admin', 'teacher'), reviewLeave);
router.delete('/leaves/:id', authorize('admin'), deleteLeave);

module.exports = router;
