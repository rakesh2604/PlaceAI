import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { mkdir } from 'fs/promises';

// Define __dirname for ESM compatibility (needed before dotenv.config)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables FIRST, before any other imports
const require = createRequire(import.meta.url);
require('dotenv').config();

// ENV CHECK - Log environment variable status (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('ENV CHECK:', {
    JWT_SECRET: !!process.env.JWT_SECRET,
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    MONGO_URI: !!process.env.MONGO_URI
  });
}

// Now import everything else AFTER dotenv loads
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/User.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import recruiterRoutes from './routes/recruiterRoutes.js';
import optInRoutes from './routes/optInRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import resumeBuilderRoutes from './routes/resumeBuilderRoutes.js';
import atsRoutes from './routes/atsRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import judgeRoutes from './routes/judgeRoutes.js';

const app = express();

// Middleware
// CORS Configuration - Environment-driven
// For production: Set CORS_ORIGINS env var to comma-separated list of allowed origins
// Example: CORS_ORIGINS=https://your-app.vercel.app,https://www.yourdomain.com
// For development/staging: Set ALLOW_ALL_ORIGINS=true to allow all origins
const corsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    // Allow all origins if ALLOW_ALL_ORIGINS is true (development/staging)
    if (process.env.ALLOW_ALL_ORIGINS === 'true') {
      return callback(null, true);
    }
    
    // Production: Use explicit allow list from CORS_ORIGINS env var
    const allowedOrigins = process.env.CORS_ORIGINS 
      ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
      : [];
    
    // If no origin (e.g., Postman, curl), allow it
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Ensure uploads directory exists and serve uploaded files
const uploadsDir = path.join(__dirname, 'uploads');
(async () => {
  try {
    await mkdir(uploadsDir, { recursive: true });
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Uploads directory ensured:', uploadsDir);
    }
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('⚠️  Warning: Could not create uploads directory:', err.message);
    }
  }
})();

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Connect to MongoDB - require MONGO_URI from environment
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI is required but not set in environment variables');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ MongoDB connected successfully');
      console.log(`   Database: ${mongoose.connection.db.databaseName}`);
    }
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('   Please check your MONGO_URI in .env file');
    process.exit(1);
  });

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️  MongoDB disconnected');
  }
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});

// API root endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'PlacedAI API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      user: '/api/user',
      jobs: '/api/jobs',
      interview: '/api/interview',
      recruiter: '/api/recruiter',
      optins: '/api/optins',
      billing: '/api/billing',
      admin: '/api/admin',
      chat: '/api/chat',
      resume: '/api/resume',
      'resume-builder': '/api/resume-builder',
      ats: '/api/ats',
      support: '/api/support'
    },
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/optins', optInRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/resume-builder', resumeBuilderRoutes);
app.use('/api/ats', atsRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/judge', judgeRoutes);

// Health check route
app.get('/health', (req, res) => res.send('OK'));

// 404 handler for undefined routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    message: 'API endpoint not found',
    path: req.path,
    method: req.method,
    availableEndpoints: [
      '/api/health',
      '/api/auth',
      '/api/user',
      '/api/jobs',
      '/api/interview',
      '/api/recruiter',
      '/api/optins',
      '/api/billing',
      '/api/admin'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Server running on port ${PORT}`);
  }
});

// Socket.IO CORS - Use same logic as Express CORS
const socketCorsOrigin = process.env.ALLOW_ALL_ORIGINS === 'true' 
  ? "*" 
  : (process.env.CORS_ORIGINS || "").split(',').map(o => o.trim()).filter(Boolean);

const io = new SocketIOServer(server, {
  cors: {
    origin: socketCorsOrigin.length > 0 ? socketCorsOrigin : "*",
    credentials: true
  }
});

// Socket authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
});

// Store active transcript streams
const activeStreams = new Map(); // interviewId -> { socket, lastOffset }

io.on('connection', (socket) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Client connected: ${socket.userId}`);
  }

  // Join interview room for transcript streaming
  socket.on('join-interview', (interviewId) => {
    socket.join(`interview:${interviewId}`);
    if (process.env.NODE_ENV === 'development') {
      console.log(`User ${socket.userId} joined interview ${interviewId}`);
    }
  });

  // Handle transcript chunk streaming
  socket.on('transcript-chunk', async (data) => {
    try {
      const { interviewId, questionId, offset, text } = data;
      
      // Store stream state
      const streamKey = `${interviewId}:${questionId}`;
      if (!activeStreams.has(streamKey)) {
        activeStreams.set(streamKey, { socket, lastOffset: -1 });
      }
      
      const stream = activeStreams.get(streamKey);
      
      // Check for duplicate (deduplication)
      if (offset <= stream.lastOffset) {
        // Already processed, send acknowledgment
        socket.emit('chunk-ack', { offset, acknowledged: true, duplicate: true });
        return;
      }

      // Process chunk via HTTP endpoint (reuses existing logic)
      // In production, you'd process this directly here
      // For now, we'll emit acknowledgment and let HTTP handle storage
      stream.lastOffset = offset;
      
      // Acknowledge chunk
      socket.emit('chunk-ack', { 
        offset, 
        acknowledged: true,
        timestamp: new Date().toISOString()
      });

      // Broadcast to other clients in the room (if needed)
      socket.to(`interview:${interviewId}`).emit('transcript-update', {
        questionId,
        offset,
        text
      });
    } catch (error) {
      console.error('Error handling transcript chunk:', error);
      socket.emit('chunk-error', { error: error.message });
    }
  });

  socket.on('disconnect', () => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Client disconnected: ${socket.userId}`);
    }
    // Clean up active streams for this socket
    for (const [key, stream] of activeStreams.entries()) {
      if (stream.socket === socket) {
        activeStreams.delete(key);
      }
    }
  });
});

export { io };
