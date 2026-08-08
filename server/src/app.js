const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const overtimeRoutes = require('./routes/overtimeRoutes');
const userRoutes = require('./routes/userRoutes');
const reportRoutes = require('./routes/reportRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [
        ...String(process.env.CLIENT_URL || '')
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
        'http://localhost:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
        'https://d-table-analytics-drog.vercel.app',
        'https://jaysinghchouhan-d-table-analytics.vercel.app',
        'https://d-table-analytics.vercel.app',
      ];

      const isVercelPreview = Boolean(origin && /\.vercel\.app$/i.test(origin));

      if (
        !origin ||
        allowed.includes(origin) ||
        isVercelPreview ||
        process.env.NODE_ENV !== 'production'
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(
  morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Attendance API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/overtime', overtimeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
