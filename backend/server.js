import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
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

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB with improved error handling
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/placedai';

if (!process.env.MONGO_URI) {
  console.warn('⚠️  MONGO_URI not found in .env, using default: mongodb://localhost:27017/placedai');
}

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log(`   Database: ${mongoose.connection.db.databaseName}`);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('   Please check your MONGO_URI in .env file');
    console.error('   Example: MONGO_URI=mongodb://localhost:27017/placedai');
    // Don't exit in development - allow server to start for testing
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
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

// Health check
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  const dbStatus = dbStatusMap[dbState] || 'unknown';
  const isConnected = dbState === 1;
  
  res.json({
    status: isConnected ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    databaseState: dbState,
    uptime: process.uptime(),
    mongoUri: process.env.MONGO_URI ? 'configured' : 'missing'
  });
});

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
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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
  console.log(`Client connected: ${socket.userId}`);

  // Join interview room for transcript streaming
  socket.on('join-interview', (interviewId) => {
    socket.join(`interview:${interviewId}`);
    console.log(`User ${socket.userId} joined interview ${interviewId}`);
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
    console.log(`Client disconnected: ${socket.userId}`);
    // Clean up active streams for this socket
    for (const [key, stream] of activeStreams.entries()) {
      if (stream.socket === socket) {
        activeStreams.delete(key);
      }
    }
  });
});

export { io };

