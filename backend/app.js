require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const fs = require('fs');

// Connect to database
connectDB();

const app = express();

// For React Native, we need to allow requests with no origin
// Web browsers have origins, but mobile apps don't
const allowedOrigins = [
  'http://localhost:3000',        // Web development
  'http://192.168.150.241:3000',  // Local web server
  'http://localhost:1420',        // Alternative local port
  'https://backend-3utx.onrender.com', // Your backend URL
];

// CORS configuration optimized for React Native
app.use(cors({
  origin: function(origin, callback) {
    // IMPORTANT: React Native apps don't send an origin header
    // Always allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) {
      return callback(null, true);
    }
    
    // Allow localhost and development origins
    if (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('192.168.')) {
      return callback(null, true);
    }
    
    // Check allowed origins list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // In production, be more permissive for mobile apps
    if (process.env.NODE_ENV === 'production') {
      // You can add additional logic here if needed
      console.log('Blocked origin in production:', origin);
    }
    
    // Reject if origin not allowed
    const msg = `CORS policy does not allow access from origin: ${origin}`;
    return callback(new Error(msg), false);
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json());

const uploadsDir = path.join(__dirname, 'uploads');

// Check if directory exists, if not create it
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Uploads directory created');
}

// Regular static file serving (for viewing)
app.use('/api/uploads', express.static(uploadsDir));

// Download route - forces download of files
app.get('/api/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  // Get file extension to determine content type
  const ext = path.extname(filename).toLowerCase();
  let contentType = 'application/octet-stream';
  
  // Set appropriate content type for common image formats
  switch (ext) {
    case '.png':
      contentType = 'image/png';
      break;
    case '.jpg':
    case '.jpeg':
      contentType = 'image/jpeg';
      break;
    case '.gif':
      contentType = 'image/gif';
      break;
    case '.svg':
      contentType = 'image/svg+xml';
      break;
  }
  
  // Set headers to force download
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', contentType);
  
  // Send the file
  res.sendFile(filePath);
});

// Alternative: Handle download parameter on regular uploads route
app.get('/api/uploads/:filename', (req, res, next) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);
  
  // Check if download parameter is present
  if (req.query.download === '1') {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Get file extension for content type
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.svg':
        contentType = 'image/svg+xml';
        break;
    }
    
    // Set download headers
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', contentType);
    
    return res.sendFile(filePath);
  }
  
  // If no download parameter, continue to regular static serving
  next();
});

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Test route
app.get('/api/', (req, res) => {
  res.json({ 
    message: 'Backend API is working',
    availableRoutes: [
      '/api/health',
      '/api/auth/register',
      '/api/auth/login', 
      '/api/auth/users',
      '/api/admin/buildings',
      '/api/user/buildings/search'
    ]
  });
});

// Routes - Use only app.use() for route mounting
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/user', require('./routes/user'));

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    error: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  // CORS errors
  if (err.message.includes('CORS policy')) {
    return res.status(403).json({ 
      error: 'CORS policy violation',
      message: err.message 
    });
  }
  
  // Default error response
  res.status(err.status || 500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

module.exports = app;