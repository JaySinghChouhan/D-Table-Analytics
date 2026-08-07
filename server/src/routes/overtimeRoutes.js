const express = require('express');
const { body } = require('express-validator');
const {
  requestOvertime,
  getMyOvertime,
  getPendingOvertime,
  reviewOvertime,
} = require('../controllers/overtimeController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  authorize('employee'),
  [
    body('attendanceId').notEmpty().withMessage('attendanceId is required'),
    body('requestedHours').isFloat({ min: 0.5 }).withMessage('requestedHours must be at least 0.5'),
    body('reason').trim().notEmpty().withMessage('Reason is required'),
  ],
  requestOvertime
);

router.get('/me', authorize('employee', 'manager', 'admin'), getMyOvertime);
router.get('/pending', authorize('manager', 'admin'), getPendingOvertime);
router.patch(
  '/:id/review',
  authorize('manager', 'admin'),
  [
    body('status').isIn(['approved', 'rejected']).withMessage('status must be approved or rejected'),
    body('reviewRemarks').optional().isString(),
  ],
  reviewOvertime
);

module.exports = router;
