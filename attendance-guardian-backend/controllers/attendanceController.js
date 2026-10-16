const Attendance = require('../models/Attendance');

// ১. নতুন উপস্থিতি সাবমিট/মার্ক করা
exports.markAttendance = async (req, res) => {
  try {
    const { studentId, subject, status, date } = req.body;

    const currentUserId = req.user._id; 
    const currentUserRole = req.user.role;

    const targetStudentId = studentId || (currentUserRole === 'Student' ? currentUserId : null);

    if (!targetStudentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    const attendanceDate = date || new Date().toISOString().split('T')[0];

    const existingAttendance = await Attendance.findOne({
      student: targetStudentId,
      subject,
      date: attendanceDate,
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance already recorded for today!' });
    }

    const newAttendance = await Attendance.create({
      student: targetStudentId,
      teacher: currentUserRole === 'Teacher' ? currentUserId : undefined,
      subject,
      status: status || 'Present',
      date: attendanceDate,
    });

    res.status(201).json({
      message: 'Attendance recorded successfully',
      attendance: newAttendance,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// ২. ব্যবহারকারীর এটেন্ডেন্স হিস্ট্রি দেখার API (Pagination সহ)
exports.getAttendanceHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const userId = req.user._id;
    const userRole = req.user.role;

    let query = {};

    // স্টুডেন্ট শুধু তার নিজের হিস্ট্রি দেখতে পাবে, টিচার সবার ডাটা দেখতে পাবে
    if (userRole === 'Student') {
      query.student = userId;
    }

    const totalLogs = await Attendance.countDocuments(query);
    const logs = await Attendance.find(query)
      .populate('student', 'username email')
      .populate('teacher', 'username email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      logs,
      currentPage: page,
      totalPages: Math.ceil(totalLogs / limit),
      totalLogs,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};