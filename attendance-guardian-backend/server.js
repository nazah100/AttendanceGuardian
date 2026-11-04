const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Routes Import
const attendanceRoutes = require('./routes/attendanceRoutes');
const subjectRoutes = require('./routes/subjectRoutes'); // <--- ১. Subject Route ইম্পোর্ট

const app = express();
app.use(express.json());
app.use(cors());

// uploads ফোল্ডার Static হিসেবে সার্ভ করা
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/attendance_guardian';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully!'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// Routes Middlewares
app.use('/api/auth', require('./routes/auth'));
app.use('/api/attendance', attendanceRoutes);
app.use('/api/subjects', subjectRoutes); // <--- ২. Subject Route রেজিস্টার

app.get('/', (req, res) => {
  res.send('Attendance Guardian Backend is Running!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
console.log(`Server running on ${PORT}`);
});