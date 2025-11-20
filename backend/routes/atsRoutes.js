import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { checkUsage, incrementUsage } from '../middleware/usageCheck.js';
import ATSReport from '../models/ATSReport.js';
import User from '../models/User.js';
import Resume from '../models/Resume.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import pdf from 'pdf-parse';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Multer config for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/resumes');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `ats-check-${Date.now()}-${Math.round(Math.random() * 1E9)}.pdf`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Upload PDF and analyze
router.post('/analyze',
  authenticate,
  checkUsage('resume-ats'),
  upload.single('resume'),
  body('jobDescription').optional(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'Resume PDF is required' });
      }

      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Extract text from PDF
      const pdfBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdf(pdfBuffer);
      const extractedText = pdfData.text;

      // Create ATS report
      const atsReport = new ATSReport({
        userId: user._id,
        originalPdfUrl: `/uploads/resumes/${req.file.filename}`,
        extractedText,
        jobDescription: req.body.jobDescription || null,
        status: 'processing'
      });

      // TODO: Run ATS analysis using AI
      // For now, generate mock scores
      const mockScore = Math.floor(Math.random() * 30) + 70; // 70-100
      
      atsReport.score = mockScore;
      atsReport.breakdown = {
        keywords: {
          score: mockScore,
          matched: ['React', 'JavaScript', 'Node.js'],
          missing: ['TypeScript', 'AWS'],
          suggestions: ['Add TypeScript to your skills', 'Include AWS certifications']
        },
        formatting: {
          score: 85,
          issues: ['Minor spacing inconsistencies'],
          suggestions: ['Ensure consistent spacing throughout']
        },
        content: {
          score: 80,
          strengths: ['Clear work history', 'Good skill descriptions'],
          weaknesses: ['Could use more quantifiable achievements'],
          suggestions: ['Add metrics to your achievements']
        },
        structure: {
          score: 90,
          issues: [],
          suggestions: ['Structure looks good']
        }
      };

      atsReport.recommendations = [
        {
          type: 'critical',
          category: 'keywords',
          title: 'Add Missing Keywords',
          description: 'Add TypeScript and AWS to increase ATS match rate',
          priority: 1
        },
        {
          type: 'important',
          category: 'content',
          title: 'Quantify Achievements',
          description: 'Add numbers and metrics to your achievements',
          priority: 2
        }
      ];

      atsReport.strengths = ['Well-structured resume', 'Clear work history', 'Relevant skills'];
      atsReport.weaknesses = ['Missing some key technologies', 'Could use more metrics'];
      atsReport.keywordsAnalysis = {
        found: ['React', 'JavaScript', 'Node.js', 'MongoDB'],
        missing: ['TypeScript', 'AWS', 'Docker'],
        relevant: ['React', 'JavaScript', 'Node.js'],
        irrelevant: []
      };

      atsReport.status = 'completed';
      await atsReport.save();

      // Increment usage
      if (req.usageInfo) {
        await incrementUsage(req.user._id, req.usageInfo.featureKey);
      }

      res.json({
        success: true,
        report: atsReport
      });
    } catch (error) {
      console.error('Error analyzing resume:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to analyze resume' 
      });
    }
  }
);

// Get all ATS reports for user
router.get('/reports', authenticate, async (req, res) => {
  try {
    const reports = await ATSReport.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({ reports });
  } catch (error) {
    console.error('Error fetching ATS reports:', error);
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
});

// Get single ATS report
router.get('/reports/:id', authenticate, async (req, res) => {
  try {
    const report = await ATSReport.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    res.json({ report });
  } catch (error) {
    console.error('Error fetching ATS report:', error);
    res.status(500).json({ message: 'Failed to fetch report' });
  }
});

// Analyze existing resume
router.post('/analyze-resume/:resumeId',
  authenticate,
  checkUsage('resume-ats'),
  body('jobDescription').optional(),
  async (req, res) => {
    try {
      const resume = await Resume.findOne({ 
        _id: req.params.resumeId, 
        userId: req.user._id 
      });
      
      if (!resume) {
        return res.status(404).json({ message: 'Resume not found' });
      }

      // Create ATS report for existing resume
      const atsReport = new ATSReport({
        userId: req.user._id,
        resumeId: resume._id,
        jobDescription: req.body.jobDescription || null,
        status: 'processing'
      });

      // TODO: Generate text from resume data and run ATS analysis
      // For now, generate mock scores
      const mockScore = Math.floor(Math.random() * 30) + 70;
      
      atsReport.score = mockScore;
      atsReport.status = 'completed';
      await atsReport.save();

      // Increment usage
      if (req.usageInfo) {
        await incrementUsage(req.user._id, req.usageInfo.featureKey);
      }

      res.json({
        success: true,
        report: atsReport
      });
    } catch (error) {
      console.error('Error analyzing resume:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to analyze resume' 
      });
    }
  }
);

export default router;

