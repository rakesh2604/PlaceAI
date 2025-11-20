import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { sendOtpEmail } from '../services/emailService.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP (works for both login and signup)
router.post('/send-otp',
  body('email').isEmail().normalizeEmail(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // express-validator's normalizeEmail() modifies req.body.email
      // Use the normalized email from req.body
      const email = req.body.email;
      const otp = generateOTP();

      let user = await User.findOne({ email });
      
      // Debug: Log user lookup
      if (process.env.NODE_ENV === 'development') {
        console.log('[Send OTP] Email lookup:', {
          email: email,
          userFound: !!user,
          userRole: user?.role,
          userEmail: user?.email
        });
      }
      
      // Only create placeholder user if doesn't exist (will be finalized on OTP verify)
      // IMPORTANT: Don't overwrite existing user's role - preserve admin/recruiter roles
      if (!user) {
        user = new User({ email, role: 'candidate' });
      }
      // If user exists, preserve their existing role (don't change admin to candidate)

      await user.setOTP(otp);
      await user.save();

      // In development, log the OTP for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log(`[OTP Generated] Email: ${email}, OTP: ${otp}, Expires: ${user.otpExpiry}`);
      }

      // Send OTP email (non-blocking - OTP is already saved)
      try {
        await sendOtpEmail(email, otp);
      } catch (emailError) {
        // Email failed but OTP is saved, so we can still proceed
        console.error('Email sending failed, but OTP is saved:', emailError.message);
      }

      // Check if email service is configured
      const emailConfigured = process.env.SMTP_HOST && process.env.SMTP_USER;
      
      res.json({ 
        message: emailConfigured ? 'OTP sent to email' : 'OTP generated (check console for mock mode)',
        // In development/mock mode, always include OTP in response for testing
        ...(process.env.NODE_ENV === 'development' && { 
          otp: otp,
          note: 'Development mode: OTP shown for testing. Check server console for details.'
        })
      });
    } catch (error) {
      console.error('Error sending OTP:', error);
      res.status(500).json({ 
        message: 'Failed to send OTP',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// Verify OTP (for both login and signup)
router.post('/verify-otp',
  body('email').isEmail().normalizeEmail(),
  body('otp').custom((value) => {
    // Accept both string and number, ensure it's 6 digits
    const otpStr = String(value).trim();
    if (!/^\d{6}$/.test(otpStr)) {
      throw new Error('OTP must be exactly 6 digits');
    }
    return true;
  }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // express-validator's normalizeEmail() modifies req.body.email
      // Use the normalized email from req.body
      const email = req.body.email;
      const { otp, name, phone, password, isSignup, isAdminLogin } = req.body;

      // Find user with normalized email (express-validator already normalized it)
      let user = await User.findOne({ email });
      
      // Debug: Log email lookup
      if (process.env.NODE_ENV === 'development') {
        console.log('[OTP Verify] Email lookup:', {
          email: email,
          userFound: !!user,
          userEmail: user?.email,
          userRole: user?.role,
          hasOtpHash: user?.otpHash ? 'yes' : 'no',
          hasOtpExpiry: user?.otpExpiry ? 'yes' : 'no'
        });
      }
      
      // For signup, create user if doesn't exist
      if (isSignup && !user) {
        user = new User({
          email,
          name: name || '',
          phone: phone || '',
          role: 'candidate'
        });
        
        // Set password if provided
        if (password) {
          await user.setPassword(password);
        }
        
        // Save user before OTP verification
        await user.save();
      }
      
      // For login (existing user), update profile if provided
      if (!isSignup && user) {
        let updated = false;
        if (name && name.trim() && !user.name) {
          user.name = name.trim();
          updated = true;
        }
        if (phone && phone.trim() && !user.phone) {
          user.phone = phone.trim();
          updated = true;
        }
        if (password && password.trim()) {
          await user.setPassword(password);
          updated = true;
        }
        if (updated) {
          await user.save();
        }
      }

      if (!user) {
        return res.status(404).json({ message: 'User not found. Please request OTP again.' });
      }

      // Verify OTP - ensure OTP is a string for comparison
      const otpString = String(otp).trim();
      
      // Debug logging in development
      if (process.env.NODE_ENV === 'development') {
        console.log('OTP Verification Debug:', {
          email: email,
          otpReceived: otpString,
          hasOtpHash: !!user.otpHash,
          hasOtpExpiry: !!user.otpExpiry,
          otpExpiry: user.otpExpiry,
          isExpired: user.otpExpiry ? new Date() > user.otpExpiry : 'N/A'
        });
      }
      
      const isValid = await user.compareOTP(otpString);
      if (!isValid) {
        // Provide more detailed error message
        let errorMessage = 'Invalid or expired OTP';
        if (!user.otpHash || !user.otpExpiry) {
          errorMessage = 'No OTP found. Please request a new OTP.';
        } else if (new Date() > user.otpExpiry) {
          errorMessage = 'OTP has expired. Please request a new OTP.';
        }
        return res.status(401).json({ message: errorMessage });
      }

      // If this is an admin login attempt and user doesn't have admin role,
      // check if email matches admin pattern or allow role update
      // For security: only allow if email matches known admin pattern or is in admin list
      if (isAdminLogin && user.role !== 'admin') {
        // Check if email should be admin (you can add your admin emails here)
        const adminEmails = [
          'admin@placedai.com',
          'rakeshsaw.rakeshsaw10@gmail.com',
          'rakesh.kr2604@gmail.com' // Add your admin email
        ];
        
        if (adminEmails.includes(email.toLowerCase())) {
          user.role = 'admin';
          await user.save();
        } else {
          // OTP is correct but user doesn't have admin role and email not in admin list
          return res.status(403).json({ 
            message: 'Access denied. Admin access required. Please contact support to grant admin privileges.',
            role: user.role 
          });
        }
      }

      // For signup, update user info if provided
      if (isSignup) {
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (password) {
          await user.setPassword(password);
        }
      }

      // Clear OTP
      user.otpHash = undefined;
      user.otpExpiry = undefined;
      await user.save();

      // Generate JWT
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          resumeUrl: user.resumeUrl,
          selectedRoleId: user.selectedRoleId,
          planId: user.planId,
          isPremium: user.isPremium
        }
      });
    } catch (error) {
      console.error('Error verifying OTP:', error);
      res.status(500).json({ message: 'Failed to verify OTP' });
    }
  }
);

// Recruiter register
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

      // Check if user exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Create user
      user = new User({
        email,
        role: 'recruiter',
        otpHash: await bcrypt.hash(password, 10) // Store hashed password
      });
      await user.save();

      // Create recruiter profile
      const Recruiter = (await import('../models/Recruiter.js')).default;
      const recruiter = new Recruiter({
        userId: user._id,
        companyName,
        credits: 0,
        planType: 'free',
        isApproved: false
      });
      await recruiter.save();

      // Generate JWT
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

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
      console.error('Error registering recruiter:', error);
      res.status(500).json({ message: 'Failed to register' });
    }
  }
);

// Recruiter login
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

      // Compare password hash
      const isValid = await bcrypt.compare(password, user.otpHash);
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const Recruiter = (await import('../models/Recruiter.js')).default;
      const recruiter = await Recruiter.findOne({ userId: user._id });

      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

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
      console.error('Error logging in recruiter:', error);
      res.status(500).json({ message: 'Failed to login' });
    }
  }
);

export default router;

