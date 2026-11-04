const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late'],
      default: 'Present',
    },
    weight: {
      type: Number,
      default: 1,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Attendance', attendanceSchema);