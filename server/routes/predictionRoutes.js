const express = require('express');
const router = express.Router();
const {
  getMyPrediction,
  getStudentPredictionById,
  regeneratePrediction,
  getClassRiskMatrix,
  getModelTelemetry,
} = require('../controllers/predictionController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

// Student personal forecast endpoint
router.get('/my-prediction', getMyPrediction);

// Faculty & Admin endpoints
router.get('/class-risk-matrix', authorize('teacher', 'admin'), getClassRiskMatrix);
router.get('/model-telemetry', authorize('teacher', 'admin'), getModelTelemetry);
router.get('/student/:id', authorize('teacher', 'admin'), getStudentPredictionById);

// Recalculate prediction (Protected; Students can only recalculate their own)
router.post('/generate/:id', regeneratePrediction);

module.exports = router;
