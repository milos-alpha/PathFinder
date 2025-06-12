require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const fs = require('fs');

// Connect to database
connectDB();

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'http://192.168.225.241:3000',
  'http://localhost:1420',
  'https://backend-3utx.onrender.com'
];

// Single CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests, or Postman)
    if (!origin) return callback(null, true);
    
    // In production, also allow requests from your frontend domains
    if (process.env.NODE_ENV === 'production') {
      // Add your frontend domains here when you deploy them
      const productionOrigins = [
        'https://backend-3utx.onrender.com',
        // Add your frontend URLs here when deployed
      ];
      if (productionOrigins.includes(origin) || !origin) {
        return callback(null, true);
      }
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    // Reject if origin not allowed
    const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
    return callback(new Error(msg), false);
  },
  credentials: true,
  optionsSuccessStatus: 200
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