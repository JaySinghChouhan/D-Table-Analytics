const express = require('express');
const { getDailyReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/daily', protect, authorize('employee', 'manager', 'admin'), getDailyReport);

module.exports = router;
