import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { authenticate, requireRole } from '../middleware/auth.js';
import User from '../models/User.js';
import Recruiter from '../models/Recruiter.js';
import Interview from '../models/Interview.js';
import Payment from '../models/Payment.js';
import Job from '../models/Job.js';
import SupportTicket from '../models/SupportTicket.js';
import ATSReport from '../models/ATSReport.js';

const router = express.Router();

// All admin routes require admin role
router.use(authenticate);
router.use(requireRole('admin'));

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { role, page = 1, limit = 50 } = req.query;
    const query = role ? { role } : {};
    
    const users = await User.find(query)
      .select('-otpHash')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({ users, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching users:', error);
    }
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Get all recruiters
router.get('/recruiters', async (req, res) => {
  try {
    const recruiters = await Recruiter.find()
      .populate('userId', 'email')
      .sort({ createdAt: -1 });

    res.json({ recruiters });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching recruiters:', error);
    }
    res.status(500).json({ message: 'Failed to fetch recruiters' });
  }
});

// Update recruiter status
router.patch('/recruiters/:id/status',
  body('isApproved').isBoolean(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { isApproved } = req.body;

      const recruiter = await Recruiter.findByIdAndUpdate(
        id,
        { isApproved, updatedAt: new Date() },
        { new: true }
      ).populate('userId', 'email');

      if (!recruiter) {
        return res.status(404).json({ message: 'Recruiter not found' });
      }

      res.json({ recruiter });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating recruiter status:', error);
      }
      res.status(500).json({ message: 'Failed to update recruiter' });
    }
  }
);

// Get all interviews
router.get('/interviews', async (req, res) => {
  try {
    const { status, jobId, page = 1, limit = 50 } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (jobId) query.jobId = jobId;

    const interviews = await Interview.find(query)
      .populate('userId', 'email phone')
      .populate('jobId', 'title description')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Interview.countDocuments(query);

    res.json({ interviews, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching interviews:', error);
    }
    res.status(500).json({ message: 'Failed to fetch interviews' });
  }
});

// Get all payments
router.get('/payments', async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('recruiterId', 'companyName')
      .sort({ createdAt: -1 });

    res.json({ payments });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching payments:', error);
    }
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
});

// Create job template
router.post('/jobs',
  body('title').notEmpty(),
  body('description').notEmpty(),
  body('skillsRequired').isArray(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, skillsRequired, level, location } = req.body;

      const job = new Job({
        title,
        description,
        skillsRequired,
        level: level || 'mid',
        location: location || 'Remote',
        createdBy: req.user._id
      });

      await job.save();
      res.status(201).json({ job });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error creating job:', error);
      }
      res.status(500).json({ message: 'Failed to create job' });
    }
  }
);

// Block/Unblock user
router.patch('/users/:id/block',
  body('isBlocked').isBoolean(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { isBlocked } = req.body;

      // Add isBlocked field to user schema if not exists (or use a different approach)
      const user = await User.findByIdAndUpdate(
        id,
        { 
          isBlocked,
          updatedAt: new Date() 
        },
        { new: true }
      ).select('-otpHash');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ user, message: isBlocked ? 'User blocked' : 'User unblocked' });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating user block status:', error);
      }
      res.status(500).json({ message: 'Failed to update user' });
    }
  }
);

// Get user ATS scores (aggregate from resume analysis)
router.get('/ats-scores', async (req, res) => {
  try {
    const users = await User.find({ 
      role: 'candidate',
      resumeParsed: { $exists: true, $ne: null }
    })
      .select('email resumeParsed createdAt planId usage')
      .sort({ createdAt: -1 })
      .limit(100);

    // Calculate ATS scores for users with resumes
    const atsScores = users.map(user => ({
      userId: user._id,
      email: user.email,
      planId: user.planId || 'free',
      hasResume: !!user.resumeParsed?.rawText,
      skills: user.resumeParsed?.skills || [],
      experienceYears: user.resumeParsed?.experienceYears || 0,
      atsChecksUsed: user.usage?.atsChecksThisMonth || 0,
      createdAt: user.createdAt
    }));

    res.json({ atsScores, total: atsScores.length });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching ATS scores:', error);
    }
    res.status(500).json({ message: 'Failed to fetch ATS scores' });
  }
});

// Approve premium manually
router.patch('/users/:id/premium',
  body('isPremium').isBoolean(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { isPremium } = req.body;

      const user = await User.findByIdAndUpdate(
        id,
        { 
          isPremium,
          updatedAt: new Date() 
        },
        { new: true }
      ).select('-otpHash');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ user, message: isPremium ? 'Premium approved' : 'Premium removed' });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating premium status:', error);
      }
      res.status(500).json({ message: 'Failed to update premium status' });
    }
  }
);

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const totalCandidates = await User.countDocuments({ role: 'candidate' });
    const totalRecruiters = await Recruiter.countDocuments();
    const totalInterviews = await Interview.countDocuments();
    const completedInterviews = await Interview.countDocuments({ status: 'completed' });
    const totalPayments = await Payment.countDocuments({ status: 'completed' });
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const usersWithResumes = await User.countDocuments({ 
      role: 'candidate',
      resumeParsed: { $exists: true, $ne: null }
    });
    
    // Usage stats
    const premiumUsers = await User.countDocuments({ planId: 'premium' });
    const enterpriseUsers = await User.countDocuments({ planId: 'enterprise' });
    
    // Aggregate usage
    const usageStats = await User.aggregate([
      { $group: {
        _id: null,
        totalAIInterviews: { $sum: '$usage.aiInterviewsThisMonth' },
        totalATSChecks: { $sum: '$usage.atsChecksThisMonth' },
        totalResumeGenerations: { $sum: '$usage.resumeGenerationsThisMonth' }
      }}
    ]);

    // Get total ATS reports and support tickets
    const totalATSReports = await ATSReport.countDocuments();
    const totalSupportTickets = await SupportTicket.countDocuments();

    res.json({
      totalCandidates,
      totalRecruiters,
      totalInterviews,
      completedInterviews,
      totalPayments,
      totalRevenue: totalRevenue[0]?.total || 0,
      usersWithResumes,
      premiumUsers,
      enterpriseUsers,
      totalATSReports,
      totalSupportTickets,
      usage: usageStats[0] || { totalAIInterviews: 0, totalATSChecks: 0, totalResumeGenerations: 0 }
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching stats:', error);
    }
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

// Get all support tickets
router.get('/support-tickets', async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const query = status ? { status } : {};
    
    const tickets = await SupportTicket.find(query)
      .populate('userId', 'email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await SupportTicket.countDocuments(query);
    
    res.json({ tickets, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching support tickets:', error);
    }
    res.status(500).json({ message: 'Failed to fetch support tickets' });
  }
});

// Update support ticket status
router.patch('/support-tickets/:id/status',
  body('status').isIn(['open', 'in-progress', 'resolved', 'closed']),
  body('adminNotes').optional().isString(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { status, adminNotes } = req.body;

      const ticket = await SupportTicket.findById(id);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }
      
      ticket.status = status;
      if (adminNotes !== undefined) {
        ticket.adminNotes = adminNotes;
      }
      ticket.updatedAt = new Date();
      await ticket.save();
      
      await ticket.populate('userId', 'email');

      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      res.json({ ticket, message: 'Ticket updated' });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating ticket:', error);
      }
      res.status(500).json({ message: 'Failed to update ticket' });
    }
  }
);

// Get usage overview
router.get('/usage', async (req, res) => {
  try {
    const users = await User.find({ role: 'candidate' })
      .select('email planId usage createdAt')
      .sort({ createdAt: -1 });
    
    const usageByPlan = await User.aggregate([
      { $group: {
        _id: '$planId',
        count: { $sum: 1 },
        totalInterviews: { $sum: '$usage.aiInterviewsThisMonth' },
        totalATSChecks: { $sum: '$usage.atsChecksThisMonth' },
        totalResumeGen: { $sum: '$usage.resumeGenerationsThisMonth' }
      }}
    ]);

    res.json({ 
      users: users.slice(0, 100), // Limit to 100 for performance
      usageByPlan,
      totalUsers: users.length
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching usage:', error);
    }
    res.status(500).json({ message: 'Failed to fetch usage data' });
  }
});

// Update user plan
router.patch('/users/:id/plan',
  body('planId').isIn(['free', 'premium', 'enterprise']),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { planId } = req.body;

      const user = await User.findByIdAndUpdate(
        id,
        { 
          planId,
          isPremium: planId !== 'free',
          updatedAt: new Date() 
        },
        { new: true }
      ).select('-otpHash');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ user, message: 'Plan updated' });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating plan:', error);
      }
      res.status(500).json({ message: 'Failed to update plan' });
    }
  }
);

// Create new admin
router.post('/create',
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: 'Validation failed',
          errors: errors.array() 
        });
      }

      const { name, email, password } = req.body;

      // Check if admin already exists
      const existingAdmin = await User.findOne({ email: email.toLowerCase() });
      if (existingAdmin) {
        return res.status(400).json({ message: 'Admin with this email already exists' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create new admin user
      const admin = new User({
        name: name.trim(),
        email: email.toLowerCase(),
        passwordHash,
        role: 'admin',
        updatedAt: new Date()
      });

      await admin.save();

      // Return admin without sensitive data
      const adminResponse = admin.toObject();
      delete adminResponse.passwordHash;
      delete adminResponse.otpHash;

      res.status(201).json({ 
        message: 'Admin created successfully',
        admin: adminResponse 
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error creating admin:', error);
      }
      if (error.code === 11000) {
        return res.status(400).json({ message: 'Admin with this email already exists' });
      }
      res.status(500).json({ message: 'Failed to create admin' });
    }
  }
);

// Reset admin password
router.post('/reset-password',
  body('oldPassword').notEmpty().withMessage('Old password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: 'Validation failed',
          errors: errors.array() 
        });
      }

      const { oldPassword, newPassword } = req.body;
      const admin = req.user;

      // Verify old password
      if (!admin.passwordHash) {
        return res.status(400).json({ message: 'No password set for this account' });
      }

      const isValidPassword = await bcrypt.compare(oldPassword, admin.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid old password' });
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 10);

      // Update password
      admin.passwordHash = newPasswordHash;
      admin.updatedAt = new Date();
      await admin.save();

      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error resetting password:', error);
      }
      res.status(500).json({ message: 'Failed to reset password' });
    }
  }
);

export default router;

