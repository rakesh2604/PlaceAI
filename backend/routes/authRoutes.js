import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token helper
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// Standardize user response - ensures consistent structure across all auth endpoints
const formatUserResponse = (user) => {
  const hasPhone = !!user.phone;
  const hasResume = !!user.resumeUrl;
  const hasRole = !!user.selectedRoleId;
  // Profile is complete if phone + resume exist (role selection is optional for basic profile)
  const profileCompleted = hasPhone && hasResume;

  return {
    _id: user._id.toString(),
    email: user.email || '',
    name: user.name || '',
    role: user.role || 'candidate',
    phone: user.phone || '',
    languages: user.languages || [],
    compensationPaise: user.compensationPaise || 0,
    skills: user.selectedSkills || [],
    profileCompleted,
    // Include additional fields used by frontend (with defaults)
    resumeUrl: user.resumeUrl || null,
    selectedRoleId: user.selectedRoleId || null,
    planId: user.planId || 'free',
    isPremium: user.isPremium || false,
    resume: user.resume || null
  };
};

// Standardized auth response helper
const sendAuthResponse = (res, user, token, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    token,
    user: formatUserResponse(user)
  });
};

// Register new user
router.post('/register',
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Create new user
      const user = new User({
        name: name.trim(),
        email,
        role: 'candidate',
        passwordHash: await bcrypt.hash(password, 10)
      });

      await user.save();

      // Generate JWT
      const token = generateToken(user);

      // Send standardized response
      sendAuthResponse(res, user, token, 201);
    } catch (error) {
      res.status(500).json({ 
        message: 'Failed to register',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// Login with email and password
router.post('/login',
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Check if user has password (not OAuth-only user)
      if (!user.passwordHash) {
        return res.status(401).json({ 
          message: 'This account was created with Google. Please use Google Sign-In.' 
        });
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Check if user is blocked
      if (user.isBlocked) {
        return res.status(403).json({ 
          message: 'Your account has been blocked. Please contact support.' 
        });
      }

      // Generate JWT
      const token = generateToken(user);

      // Send standardized response
      sendAuthResponse(res, user, token);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error logging in:', error);
      }
      res.status(500).json({ 
        message: 'Failed to login',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// Google OAuth authentication
router.post('/google',
  body('credential').notEmpty().withMessage('Google credential is required'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { credential } = req.body;

      if (!process.env.GOOGLE_CLIENT_ID) {
        if (process.env.NODE_ENV === 'development') {
          console.error('GOOGLE_CLIENT_ID not configured');
        }
        return res.status(500).json({ message: 'Google OAuth not configured' });
      }

      // Verify Google ID token
      let ticket;
      try {
        ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID
        });
      } catch (googleError) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Google token verification failed:', googleError);
        }
        return res.status(401).json({ message: 'Invalid Google token' });
      }

      const payload = ticket.getPayload();
      const { sub: googleId, email, name, picture } = payload;

      if (!email) {
        return res.status(400).json({ message: 'Email not provided by Google' });
      }

      // Find or create user
      let user = await User.findOne({ email });

      if (user) {
        // User exists - update Google ID if not set
        if (!user.googleId) {
          user.googleId = googleId;
          if (!user.name && name) {
            user.name = name;
          }
          await user.save();
        } else if (user.googleId !== googleId) {
          return res.status(401).json({ message: 'Google account mismatch' });
        }
      } else {
        // Create new user
        user = new User({
          email,
          name: name || '',
          googleId,
          role: 'candidate'
        });
        await user.save();
      }

      // Check if user is blocked
      if (user.isBlocked) {
        return res.status(403).json({ 
          message: 'Your account has been blocked. Please contact support.' 
        });
      }

      // Generate JWT
      const token = generateToken(user);

      // Send standardized response
      sendAuthResponse(res, user, token);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error with Google authentication:', error);
      }
      res.status(500).json({ 
        message: 'Failed to authenticate with Google',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// Admin login (password-based)
router.post('/admin/login',
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: 'Validation failed',
          errors: errors.array() 
        });
      }

      const { email, password } = req.body;
      
      // Normalize email for lookup (lowercase and trim)
      const normalizedEmail = email.toLowerCase().trim();

      // Find user by normalized email
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check if user has password
      if (!user.passwordHash) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check admin role
      const adminEmails = [
        'admin@placedai.com',
        'rakeshsaw.rakeshsaw10@gmail.com',
        'rakesh.kr2604@gmail.com'
      ];

      if (user.role !== 'admin') {
        if (adminEmails.includes(normalizedEmail)) {
          user.role = 'admin';
          await user.save();
        } else {
          return res.status(403).json({ 
            message: 'Access denied. Admin access required.' 
          });
        }
      }

      // Generate JWT
      const token = generateToken(user);

      // Send standardized response for admin login
      sendAuthResponse(res, user, token);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error logging in admin:', error);
      }
      res.status(500).json({ 
        message: 'Failed to login',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// Recruiter register (keep existing)
router.post('/recruiter/register',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('companyName').notEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, companyName } = req.body;

      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      user = new User({
        email,
        role: 'recruiter',
        passwordHash: await bcrypt.hash(password, 10)
      });
      await user.save();

      const Recruiter = (await import('../models/Recruiter.js')).default;
      const recruiter = new Recruiter({
        userId: user._id,
        companyName,
        credits: 0,
        planType: 'free',
        isApproved: false
      });
      await recruiter.save();

      const token = generateToken(user);

      res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role
        },
        recruiter: {
          companyName: recruiter.companyName,
          credits: recruiter.credits
        }
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error registering recruiter:', error);
      }
      res.status(500).json({ message: 'Failed to register' });
    }
  }
);

// Recruiter login (keep existing)
router.post('/recruiter/login',
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email, role: 'recruiter' });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      if (!user.passwordHash) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const Recruiter = (await import('../models/Recruiter.js')).default;
      const recruiter = await Recruiter.findOne({ userId: user._id });

      const token = generateToken(user);

      res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role
        },
        recruiter: recruiter ? {
          companyName: recruiter.companyName,
          credits: recruiter.credits,
          isApproved: recruiter.isApproved
        } : null
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error logging in recruiter:', error);
      }
      res.status(500).json({ message: 'Failed to login' });
    }
  }
);

export default router;
