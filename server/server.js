require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const academicRoutes = require('./routes/academicRoutes');
const communicationRoutes = require('./routes/communicationRoutes');
const financeRoutes = require('./routes/financeRoutes');
const predictionRoutes = require('./routes/predictionRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect Database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/predictions', predictionRoutes);

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    message: 'API is running successfully!',
    status: 'online',
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
