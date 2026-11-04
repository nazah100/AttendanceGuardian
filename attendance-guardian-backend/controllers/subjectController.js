// backend/controllers/subjectController.js
const Subject = require('../models/Subject');

// 1. New Subject Add Kora
exports.createSubject = async (req, res) => {
  try {
    const { name, code, totalClasses, attendedClasses, classTime, routineDays, duration } = req.body;

    // req.user check kora (Auth Middleware theke asche)
    const userId = req.user ? req.user._id || req.user.id : null;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User unauthorized' });
    }

    const newSubject = new Subject({
      userId: userId, // User Wise Link Up
      name,
      code,
      totalClasses: Number(totalClasses) || 0,
      attendedClasses: Number(attendedClasses) || 0,
      classTime: classTime || '10:00 AM',
      routineDays: routineDays || [],
      duration: duration || 45,
    });

    const savedSubject = await newSubject.save();

    res.status(201).json({
      success: true,
      message: 'Subject added successfully!',
      subject: savedSubject,
    });
  } catch (error) {
    console.error('Create Subject Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 2. Logged In User-er sob Subject fetch kora
exports.getSubjects = async (req, res) => {
  try {
    const userId = req.user ? req.user._id || req.user.id : null;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User unauthorized' });
    }

    // Specific user er subject find kora
    const subjects = await Subject.find({ userId });

    // Directly Array Response Return kora
    res.status(200).json(subjects);
  } catch (error) {
    console.error('Get Subjects Error:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};