import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, requireRole } from '../middleware/auth.js';
import { idempotencyMiddleware } from '../middleware/idempotency.js';
import Recruiter from '../models/Recruiter.js';
import RecruiterRequest from '../models/RecruiterRequest.js';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Interview from '../models/Interview.js';
import { sendRecruiterOptInEmail } from '../services/emailService.js';
import { sendWhatsAppMessage } from '../services/whatsappService.js';

const router = express.Router();

// Get recruiter profile
router.get('/profile', authenticate, requireRole('recruiter'), async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ userId: req.user._id })
      .populate('userId', 'email');
    
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter profile not found' });
    }

    res.json({ recruiter });
  } catch (error) {
    console.error('Error fetching recruiter profile:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Create job posting
router.post('/jobs',
  authenticate,
  requireRole('recruiter'),
  idempotencyMiddleware,
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
      console.error('Error creating job:', error);
      res.status(500).json({ message: 'Failed to create job' });
    }
  }
);

// Get recruiter's jobs
router.get('/jobs', authenticate, requireRole('recruiter'), async (req, res) => {
  try {
    const jobs = await Job.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ jobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Failed to fetch jobs' });
  }
});

// Browse candidates (filtered)
router.get('/candidates',
  authenticate,
  requireRole('recruiter'),
  async (req, res) => {
    try {
      const { skills, experience, role } = req.query;
      
      let query = { role: 'candidate' };
      
      if (skills) {
        query['resumeParsed.skills'] = { $in: skills.split(',') };
      }
      
      if (experience) {
        query['resumeParsed.experienceYears'] = { $gte: parseInt(experience) };
      }
      
      if (role) {
        query['selectedRoleId'] = role;
      }

      const candidates = await User.find(query)
        .select('email phone resumeParsed selectedRoleId selectedSkills languages ctc')
        .populate('selectedRoleId', 'title')
        .limit(50);

      res.json({ candidates });
    } catch (error) {
      console.error('Error fetching candidates:', error);
      res.status(500).json({ message: 'Failed to fetch candidates' });
    }
  }
);

// Send opt-in request
router.post('/optins/request',
  authenticate,
  requireRole('recruiter'),
  idempotencyMiddleware,
  body('candidateId').isMongoId(),
  body('jobId').isMongoId(),
  body('message').optional().isString(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const recruiter = await Recruiter.findOne({ userId: req.user._id });
      if (!recruiter) {
        return res.status(404).json({ message: 'Recruiter profile not found' });
      }

      if (!recruiter.isApproved) {
        return res.status(403).json({ message: 'Recruiter account not approved' });
      }

      // Check credits
      if (recruiter.credits <= 0 && recruiter.planType === 'free') {
        return res.status(403).json({ message: 'Insufficient credits. Please upgrade your plan.' });
      }

      const { candidateId, jobId, message } = req.body;

      // Check if request already exists
      const existing = await RecruiterRequest.findOne({
        candidateId,
        recruiterId: recruiter._id,
        jobId,
        status: 'PENDING'
      });

      if (existing) {
        return res.status(400).json({ message: 'Request already sent' });
      }

      const candidate = await User.findById(candidateId);
      if (!candidate || candidate.role !== 'candidate') {
        return res.status(404).json({ message: 'Candidate not found' });
      }

      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }

      // Create request
      const request = new RecruiterRequest({
        candidateId,
        recruiterId: recruiter._id,
        jobId,
        message
      });

      await request.save();

      // Deduct credit
      if (recruiter.planType !== 'free') {
        recruiter.credits = Math.max(0, recruiter.credits - 1);
        await recruiter.save();
      }

      // Send notifications
      await sendRecruiterOptInEmail(
        candidate.email,
        req.user.email,
        recruiter.companyName,
        job.title,
        message
      );

      // Send WhatsApp if phone available
      if (candidate.phone) {
        await sendWhatsAppMessage(candidate.phone, {
          type: 'opt_in_request',
          recruiterName: req.user.email,
          companyName: recruiter.companyName,
          jobTitle: job.title
        });
      }

      res.status(201).json({ message: 'Opt-in request sent', request });
    } catch (error) {
      console.error('Error sending opt-in request:', error);
      res.status(500).json({ message: 'Failed to send request' });
    }
  }
);

// Get recruiter's opt-in activity
router.get('/optins', authenticate, requireRole('recruiter'), async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ userId: req.user._id });
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    const requests = await RecruiterRequest.find({ recruiterId: recruiter._id })
      .populate('candidateId', 'email phone resumeParsed')
      .populate('jobId', 'title description')
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    console.error('Error fetching opt-ins:', error);
    res.status(500).json({ message: 'Failed to fetch opt-ins' });
  }
});

// Get candidate interviews (if opt-in accepted)
router.get('/candidates/:candidateId/interviews',
  authenticate,
  requireRole('recruiter'),
  async (req, res) => {
    try {
      const { candidateId } = req.params;
      const recruiter = await Recruiter.findOne({ userId: req.user._id });

      // Check if opt-in exists
      const request = await RecruiterRequest.findOne({
        candidateId,
        recruiterId: recruiter._id,
        status: 'ACCEPTED'
      });

      if (!request) {
        return res.status(403).json({ message: 'Opt-in required to view interviews' });
      }

      const interviews = await Interview.find({ userId: candidateId })
        .populate('jobId', 'title description')
        .sort({ createdAt: -1 });

      res.json({ interviews });
    } catch (error) {
      console.error('Error fetching candidate interviews:', error);
      res.status(500).json({ message: 'Failed to fetch interviews' });
    }
  }
);

export default router;

