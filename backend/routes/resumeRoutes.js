import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import User from '../models/User.js';
import aiBrain from '../src/ai/aiBrain.js';
import { checkUsage, incrementUsage } from '../middleware/usageCheck.js';
import { idempotencyMiddleware } from '../middleware/idempotency.js';

const router = express.Router();

// ATS Resume Score endpoint
router.post('/ats-score',
  authenticate,
  idempotencyMiddleware,
  checkUsage('resume-ats'),
  body('jobDescription').optional(),
  body('jobRole').optional(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!user.resumeParsed || !user.resumeParsed.rawText) {
        return res.status(400).json({ 
          message: 'Resume not uploaded or parsed. Please upload your resume first.' 
        });
      }

      const { jobDescription, jobRole } = req.body;

      // Get ATS score from AI Brain
      const atsResult = await aiBrain.process('resume-ats', {
        resumeText: user.resumeParsed.rawText,
        resumeData: user.resumeParsed,
        jobDescription: jobDescription || null,
        jobRole: jobRole || user.selectedRoleId || null
      });

      // Increment usage after successful ATS check
      if (req.usageInfo) {
        await incrementUsage(req.user._id, req.usageInfo.featureKey);
      }

      res.json({
        success: true,
        atsScore: atsResult
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error calculating ATS score:', error);
      }
      res.status(500).json({ 
        success: false,
        message: 'Failed to calculate ATS score' 
      });
    }
  }
);

// Resume analysis endpoint
router.post('/analyze',
  authenticate,
  idempotencyMiddleware,
  checkUsage('resume-ats'),
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!user.resumeParsed || !user.resumeParsed.rawText) {
        return res.status(400).json({ 
          message: 'Resume not uploaded or parsed. Please upload your resume first.' 
        });
      }

      const { jobRole } = req.body;

      // Get analysis from AI Brain
      const analysis = await aiBrain.process('resume-analysis', {
        resumeText: user.resumeParsed.rawText,
        resumeData: user.resumeParsed,
        jobRole: jobRole || null
      });

      // Increment usage after successful analysis
      if (req.usageInfo) {
        await incrementUsage(req.user._id, req.usageInfo.featureKey);
      }

      res.json({
        success: true,
        analysis
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error analyzing resume:', error);
      }
      res.status(500).json({ 
        success: false,
        message: 'Failed to analyze resume' 
      });
    }
  }
);

export default router;

