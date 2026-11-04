const express = require('express');
const router = express.Router();
const { createSubject, getSubjects } = require('../controllers/subjectController');
const { protect } = require('../middleware/authMiddleware');
const Subject = require('../models/Subject'); // Subject মডেলটি রিকোয়ার করে নিতে হবে (ডাটাবেজে আপডেট করার জন্য)

// ১. সাবজেক্ট তৈরি করার রাউট
router.post('/', protect, createSubject);

// ২. সব সাবজেক্ট দেখার রাউট
router.get('/', protect, getSubjects);

// ৩. সাবজেক্ট বা অ্যাটেনডেন্স আপডেট করার PUT রাউট
router.put('/update/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    // এখানে সবকটি ফিল্ড ডিস্ট্রাকচার করে নেওয়া হলো যাতে রুটিন ও সময়ও আপডেট হয়
    const { attendedClasses, totalClasses, routineDays, classTime, duration } = req.body;

    console.log("Update Request Received for ID:", id);
    console.log("Request Body Data:", req.body);

    // Database-e subject khuje shob data update kora
    const updatedSubject = await Subject.findByIdAndUpdate(
      id,
      { attendedClasses, totalClasses, routineDays, classTime, duration },
      { new: true }
    );

    if (!updatedSubject) {
      console.log("Subject not found in database!");
      return res.status(404).json({ message: 'Subject paowa jayni' });
    }

    console.log("Updated Successfully:", updatedSubject);
    res.status(200).json({
      success: true,
      message: 'Settings updated successfully on server',
      data: updatedSubject,
    });
  } catch (error) {
    console.log("Server Error during update:", error.message);
    res.status(500).json({ message: 'Server error during update', error: error.message });
  }
});

module.exports = router;