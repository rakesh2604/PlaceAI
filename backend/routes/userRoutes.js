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
import { validateProfileUpdate, validatePhone } from '../middleware/validateProfile.js';
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js';

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

// Error handler for multer - must be defined before routes use it
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false,
        error: 'File too large. Maximum size is 5MB.' 
      });
    }
    return res.status(400).json({ 
      success: false,
      error: err.message || 'File upload error' 
    });
  }
  if (err) {
    return res.status(400).json({ 
      success: false,
      error: err.message || 'Upload failed' 
    });
  }
  next();
};

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-otpHash');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// GET /api/user/profile - Standardized profile endpoint
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash -otpHash');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email || '',
        name: user.name || '',
        role: user.role || 'candidate',
        phone: user.phone || '',
        phoneVerified: user.phoneVerified || false,
        currency: user.currency || 'INR',
        compensationPaise: user.compensationPaise || 0,
        languages: user.languages || [],
        skills: user.selectedSkills || [],
        resume: user.resume || null,
        resumeUrl: user.resumeUrl || null,
        selectedRoleId: user.selectedRoleId || null,
        planId: user.planId || 'free',
        isPremium: user.isPremium || false,
        profileCompleted: !!(user.phone && user.resumeUrl)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
});

// PATCH /api/user/profile - Standardized profile update endpoint
router.patch('/profile',
  authenticate,
  validateProfileUpdate,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          error: 'Validation failed',
          details: errors.array()
        });
      }
      
      const { name, phone, languages, compensationPaise, resumeId } = req.body;
      const user = await User.findById(req.user._id);
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      // Update name
      if (name !== undefined) {
        user.name = name.trim();
      }
      
      // Update phone with E.164 validation
      if (phone !== undefined) {
        const phoneValidation = validatePhone(phone, 'IN');
        if (!phoneValidation.valid) {
          return res.status(400).json({
            success: false,
            error: phoneValidation.error
          });
        }
        user.phone = phoneValidation.formatted;
        user.phoneVerified = false; // Reset verification on phone change
      }
      
      // Update languages
      if (languages !== undefined) {
        user.languages = Array.isArray(languages) ? languages : [];
      }
      
      // Update compensation (store in paise)
      if (compensationPaise !== undefined) {
        user.compensationPaise = parseInt(compensationPaise, 10);
        user.currency = 'INR'; // Always INR for now
      }
      
      // Update resume reference if provided
      // Note: resumeId links to existing resume metadata stored via /resume endpoint
      // If resumeId is provided, ensure resumeUrl is also set for backward compatibility
      if (resumeId !== undefined && resumeId) {
        // Resume was already uploaded, just link it
        // resumeUrl and resume metadata should already be set from upload
        // This is just for linking purposes
      }
      
      user.updatedAt = new Date();
      await user.save();
      
      // Profile update logged (removed console.log for production)
      
      res.json({
        success: true,
        user: {
          _id: user._id,
          email: user.email || '',
          name: user.name || '',
          role: user.role || 'candidate',
          phone: user.phone || '',
          phoneVerified: user.phoneVerified || false,
          currency: user.currency || 'INR',
          compensationPaise: user.compensationPaise || 0,
          languages: user.languages || [],
          skills: user.selectedSkills || [],
          resume: user.resume || null,
          resumeUrl: user.resumeUrl || null,
          selectedRoleId: user.selectedRoleId || null,
          planId: user.planId || 'free',
          isPremium: user.isPremium || false,
          profileCompleted: !!(user.phone && user.resumeUrl)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// POST /api/user/resume - Upload resume with metadata
router.post('/resume',
  authenticate,
  upload.single('resume'),
  handleMulterError,
  async (req, res) => {
    try {
      // File upload validation
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded. Please select a file.'
        });
      }
      
      // Ensure req.file.path exists (diskStorage) or req.file.buffer (memoryStorage)
      if (!req.file.path && !req.file.buffer) {
        if (process.env.NODE_ENV === 'development') {
          console.error('File upload error: No path or buffer found in req.file');
        }
        return res.status(400).json({
          success: false,
          error: 'File upload failed: Invalid file data'
        });
      }
      
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      
      // Store resume metadata - simplified response
      const resumeMetadata = {
        id: req.file.filename,
        filename: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        uploadedAt: new Date()
      };
      
      user.resume = {
        id: req.file.filename,
        ...resumeMetadata
      };
      user.resumeUrl = `/uploads/${req.file.filename}`;
      
      // Parse resume for skills extraction (only if path exists)
      if (req.file.path) {
        try {
          const parsed = await parseResume(req.file.path);
          user.resumeParsed = parsed;
        } catch (parseError) {
          // Continue even if parsing fails - resume upload succeeds without parsing
          if (process.env.NODE_ENV === 'development') {
            console.error('Error parsing resume:', parseError);
          }
        }
      }
      
      user.updatedAt = new Date();
      await user.save();
      
      // Calculate profileCompleted for response - phone + resume only
      const profileCompleted = !!(user.phone && user.resumeUrl);
      
      // Return resume metadata AND updated user with profileCompleted status
      res.json({
        success: true,
        resume: resumeMetadata,
        user: {
          _id: user._id,
          email: user.email || '',
          name: user.name || '',
          role: user.role || 'candidate',
          phone: user.phone || '',
          phoneVerified: user.phoneVerified || false,
          currency: user.currency || 'INR',
          compensationPaise: user.compensationPaise || 0,
          languages: user.languages || [],
          skills: user.selectedSkills || [],
          resume: user.resume || null,
          resumeUrl: user.resumeUrl || null,
          selectedRoleId: user.selectedRoleId || null,
          planId: user.planId || 'free',
          isPremium: user.isPremium || false,
          profileCompleted
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to upload resume'
      });
    }
  }
);

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
          // Continue even if parsing fails - resume upload succeeds without parsing
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
      res.status(500).json({ 
        success: false,
        message: 'Failed to calculate ATS score' 
      });
    }
  }
);

export default router;
