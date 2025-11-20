import express from 'express';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticate } from '../middleware/auth.js';
import User from '../models/User.js';
import { parseResume } from '../utils/resumeParser.js';
import fs from 'fs/promises';
import aiBrain from '../src/ai/aiBrain.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file) {
      return cb(null, true); // No file is okay
    }
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-otpHash');
    res.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// Error handler for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ message: `File upload error: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ message: err.message || 'File upload error' });
  }
  next();
};

// Update basic info (phone, resume, languages, CTC)
router.put('/basic',
  authenticate,
  upload.single('resume'),
  handleMulterError,
  body('phone').optional().isString(),
  body('languages').optional(),
  body('ctc').optional().isNumeric(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { phone, languages, ctc } = req.body;
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (phone) user.phone = phone;
      
      // Handle languages - can be string (JSON) or array
      if (languages) {
        try {
          user.languages = typeof languages === 'string' ? JSON.parse(languages) : languages;
        } catch (parseError) {
          // If parsing fails, try treating as comma-separated string
          user.languages = languages.split(',').map(l => l.trim()).filter(l => l);
        }
      }
      
      if (ctc) user.ctc = parseFloat(ctc);

      // Handle resume upload
      if (req.file) {
        user.resumeUrl = `/uploads/${req.file.filename}`;
        
        // Parse resume
        try {
          const parsed = await parseResume(req.file.path);
          user.resumeParsed = parsed;
        } catch (parseError) {
          console.error('Error parsing resume:', parseError);
          // Continue even if parsing fails
        }
      }

      user.updatedAt = new Date();
      await user.save();

      res.json({
        message: 'Profile updated',
        user: {
          id: user._id,
          phone: user.phone,
          languages: user.languages,
          ctc: user.ctc,
          resumeUrl: user.resumeUrl,
          resumeParsed: user.resumeParsed
        }
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ 
        message: 'Failed to update profile',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// Update role and skills
router.put('/role-skills',
  authenticate,
  body('roleId').isMongoId(),
  body('skills').isArray().isLength({ min: 1, max: 10 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { roleId, skills } = req.body;
      const user = await User.findById(req.user._id);

      user.selectedRoleId = roleId;
      user.selectedSkills = skills;
      user.updatedAt = new Date();
      await user.save();

      res.json({
        message: 'Role and skills updated',
        user: {
          selectedRoleId: user.selectedRoleId,
          selectedSkills: user.selectedSkills
        }
      });
    } catch (error) {
      console.error('Error updating role/skills:', error);
      res.status(500).json({ message: 'Failed to update role and skills' });
    }
  }
);

// Calculate ATS score
router.post('/ats',
  authenticate,
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

      res.json({
        success: true,
        atsScore: atsResult
      });
    } catch (error) {
      console.error('Error calculating ATS score:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to calculate ATS score' 
      });
    }
  }
);

export default router;
