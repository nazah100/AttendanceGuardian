const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // User মডেলের সাথে সম্পর্ক যুক্ত করা হলো
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late'],
      default: 'Present',
    },
    date: {
      type: String, // 'YYYY-MM-DD' ফরম্যাটে ডেট সেভ রাখার জন্য
      required: true,
    },
  },
  {
    timestamps: true, // createdAt ও updatedAt স্বয়ংক্রিয়ভাবে তৈরি হবে
  }
);

// একই স্টুডেন্ট যাতে একই দিনে একই সাবজেক্টে একাধিকবার এন্ট্রি দিতে না পারে
attendanceSchema.index({ student: 1, subject: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);