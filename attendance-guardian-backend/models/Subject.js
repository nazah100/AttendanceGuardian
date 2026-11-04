const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    totalClasses: {
      type: Number,
      default: 0,
    },
    attendedClasses: {
      type: Number,
      default: 0,
    },
    classTime: {
      type: String,
      default: '10:00 AM',
    },
    routineDays: [
      {
        type: String,
      },
    ],
    duration: {
      type: Number,
      default: 45,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', subjectSchema);