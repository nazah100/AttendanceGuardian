const express = require('express');
const router = express.Router();
const { markAttendance, getAttendanceHistory } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware'); // আপনার Auth Middleware

// সকল রুট সুরক্ষিত (JWT Token লাগবে)
router.post('/mark', protect, markAttendance);
router.get('/history', protect, getAttendanceHistory);

module.exports = router;