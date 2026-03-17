const express = require('express');
const aiRoutes = require('./routes/ai.routes');
const authRoutes = require('./routes/auth.routes');
const fileRoutes = require('./routes/file.routes'); // Add this
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://ai-code-review-and-bug-detection-system.onrender.com'
  ],
  credentials: true
}));;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.send('Code Review API with Project Analysis');
});

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes); // Existing AI routes
app.use('/api/files', fileRoutes); // New file upload routes

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;
