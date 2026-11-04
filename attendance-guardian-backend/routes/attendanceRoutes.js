const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { markAttendance, getAttendanceHistory } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware'); // Auth Middleware

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });


// অরিজিনাল ডাটাবেজ সেভ করার রাউট (সবকিছু টেস্ট শেষ হলে উপরের রাউটটি ফেলে এটি ব্যবহার করবেন):
router.post('/mark', protect, markAttendance);


// 2. ATTENDANCE HISTORY ROUTE
router.get('/history', protect, getAttendanceHistory);

// 3. DOCUMENT UPLOAD ROUTE
router.post('/upload-document', protect, upload.single('document'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    return res.status(200).json({
      message: 'Document uploaded successfully!',
      filePath: req.file.path,
      fileName: req.file.filename,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error during file upload', error });
  }
});

module.exports = router;