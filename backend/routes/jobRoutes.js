import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, requireRole } from '../middleware/auth.js';
import Job from '../models/Job.js';
import User from '../models/User.js';

const router = express.Router();

// Get recommended jobs based on user's resume
router.get('/recommend', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.resumeParsed || !user.resumeParsed.skills || user.resumeParsed.skills.length === 0) {
      // Return all jobs if no resume parsed
      const jobs = await Job.find().limit(20).sort({ createdAt: -1 });
      return res.json({ jobs: jobs.map(j => j.toObject()) });
    }

    // Simple matching: find jobs where required skills overlap with user skills
    const userSkills = user.resumeParsed.skills.map(s => s.toLowerCase());
    
    const allJobs = await Job.find().sort({ createdAt: -1 });
    const scoredJobs = allJobs.map(job => {
      const jobSkills = (job.skillsRequired || []).map(s => s.toLowerCase());
      const matches = userSkills.filter(skill => 
        jobSkills.some(js => js.includes(skill) || skill.includes(js))
      );
      return {
        ...job.toObject(),
        matchScore: matches.length / Math.max(jobSkills.length, 1)
      };
    });

    // Sort by match score and return top 20
    scoredJobs.sort((a, b) => b.matchScore - a.matchScore);
    const recommended = scoredJobs.slice(0, 20).map(j => {
      const { matchScore, ...job } = j;
      return job;
    });

    res.json({ jobs: recommended });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch jobs' });
  }
});

// Get all jobs (for recruiters/admins)
router.get('/', authenticate, async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json({ jobs });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch jobs' });
  }
});

// Create job (recruiter/admin only)
router.post('/',
  authenticate,
  requireRole('recruiter', 'admin'),
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
      res.status(500).json({ message: 'Failed to create job' });
    }
  }
);

// Get single job
router.get('/:id', authenticate, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json({ job });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch job' });
  }
});

// Apply to job
router.post('/apply',
  authenticate,
  body('jobId').notEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { jobId } = req.body;
      const user = await User.findById(req.user._id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }

      // Check if already applied
      if (job.applications?.some(app => app.userId?.toString() === user._id.toString())) {
        return res.status(400).json({ message: 'You have already applied to this job' });
      }

      // Add application
      if (!job.applications) {
        job.applications = [];
      }

      job.applications.push({
        userId: user._id,
        appliedAt: new Date(),
        status: 'pending'
      });

      await job.save();

      res.json({ 
        success: true,
        message: 'Application submitted successfully',
        application: job.applications[job.applications.length - 1]
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to apply to job' });
    }
  }
);

// Get user's applications
router.get('/applications', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Find all jobs where user has applied
    const jobs = await Job.find({
      'applications.userId': user._id
    }).sort({ 'applications.appliedAt': -1 });

    // Map to application format with job details
    const applications = jobs.flatMap(job => {
      const userApp = job.applications.find(app => 
        app.userId?.toString() === user._id.toString()
      );
      if (!userApp) return [];
      
      return {
        _id: userApp._id || job._id.toString() + '-' + user._id.toString(),
        jobId: job._id,
        jobTitle: job.title,
        company: job.company || 'Company',
        location: job.location,
        appliedAt: userApp.appliedAt,
        status: userApp.status === 'shortlisted' ? 'accepted' : userApp.status || 'pending',
        job: {
          _id: job._id,
          title: job.title,
          description: job.description,
          company: job.company,
          location: job.location,
          skillsRequired: job.skillsRequired,
          level: job.level,
          type: job.type
        }
      };
    });

    res.json({ 
      success: true,
      applications: applications.sort((a, b) => 
        new Date(b.appliedAt) - new Date(a.appliedAt)
      )
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch applications' });
  }
});

export default router;

