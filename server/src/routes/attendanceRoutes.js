const express = require('express');
const { body } = require('express-validator');
const {
  punchIn,
  punchOut,
  getMyAttendance,
  getTodayAttendance,
  getTeamAttendance,
  getAllAttendance,
  getAttendanceById,
  validateAttendance,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

const punchValidators = [
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  body('selfie').notEmpty().withMessage('Live selfie is required'),
];

router.use(protect);

router.post('/punch-in', authorize('employee'), punchValidators, punchIn);
router.post('/punch-out', authorize('employee'), punchValidators, punchOut);
router.get('/me', authorize('employee', 'manager', 'admin'), getMyAttendance);
router.get('/today', authorize('employee'), getTodayAttendance);
router.get('/team', authorize('manager'), getTeamAttendance);
router.get('/all', authorize('admin'), getAllAttendance);
router.get('/:id', getAttendanceById);
router.patch(
  '/:id/validate',
  authorize('manager', 'admin'),
  [
    body('validationStatus')
      .isIn(['valid', 'invalid'])
      .withMessage('validationStatus must be valid or invalid'),
    body('validationRemarks').optional().isString(),
  ],
  validateAttendance
);

module.exports = router;
