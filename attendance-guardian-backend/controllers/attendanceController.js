const Attendance = require('../models/Attendance');
const Subject = require('../models/Subject');

// Geofence Attendance Mark করার কন্ট্রোলার
exports.markAttendance = async (req, res) => {
  try {
    const { subjectId, latitude, longitude, duration } = req.body;
    const userId = req.user._id || req.user.id;

    if (!subjectId) {
      return res.status(400).json({ success: false, message: 'Subject ID is required' });
    }

    // ১. আজকের তারিখের শুরু ও শেষ
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // ২. চেক করা আজ অলরেডি এই সাবজেক্টে এটেনডেন্স দেয়া হয়েছে কিনা
    const existingAttendance = await Attendance.findOne({
      userId,
      subjectId,
      date: { $gte: startOfDay,$lte: endOfDay },
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already recorded for today!',
      });
    }

    // ৩. Duration Weight Calculation
    const incrementValue = Math.round((duration || 45) / 45) || 1;

    // ৪. নতুন Attendance Record সেভ
    const newAttendance = new Attendance({
      userId,
      subjectId,
      latitude,
      longitude,
      status: 'Present',
      weight: incrementValue,
      date: new Date(),
    });

    await newAttendance.save();

    // ৫. Subject model update
    const updatedSubject = await Subject.findByIdAndUpdate(
      subjectId,
      {
        $inc: {
          attendedClasses: incrementValue,
          totalClasses: incrementValue,
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: `Attendance recorded successfully! (+${incrementValue} period)`,
      attendance: newAttendance,
      subject: updatedSubject,
    });
  } catch (error) {
    console.error('Mark Attendance Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// Attendance History বের করার কন্ট্রোলার
exports.getAttendanceHistory = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const history = await Attendance.find({ userId })
      .populate('subjectId', 'name code') // Subject-এর নাম ও কোড আনার জন্য
      .sort({ createdAt: -1 }); // নতুনগুলো আগে দেখাবে

    res.status(200).json(history);
  } catch (error) {
    console.error('Fetch History Error:', error);
    res.status(500).json({ message: 'Error fetching history', error: error.message });
  }
};