import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import Resume from '../models/Resume.js';
import ParsingJob from '../models/ParsingJob.js';
import RenderJob from '../models/RenderJob.js';
import ATSJob from '../models/ATSJob.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import pdf from 'pdf-parse';
import { parseTemplate } from '../utils/templateParser.js';
import { parseLinkedInURL, parseLinkedInZIP } from '../utils/linkedInParser.js';
import aiBrain from '../src/ai/aiBrain.js';
import { idempotencyMiddleware } from '../middleware/idempotency.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Initial resume data structure
const INITIAL_RESUME_DATA = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    website: '',
    summary: ''
  },
  education: [],
  experience: [],
  skills: [],
  projects: [],
  achievements: [],
  certifications: [],
  languages: []
};

// Multer config for resume uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/resumes');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `resume-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`);
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

// Multer config for template imports (PDF/DOCX)
const templateStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/templates');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `template-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`);
  }
});

const templateUpload = multer({
  storage: templateStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.pdf') || file.originalname.endsWith('.docx')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'));
    }
  }
});

// Multer config for LinkedIn ZIP imports
const zipStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/linkedin');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `linkedin-${Date.now()}-${Math.round(Math.random() * 1E9)}.zip`);
  }
});

const zipUpload = multer({
  storage: zipStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/zip' || file.mimetype === 'application/x-zip-compressed' || file.originalname.endsWith('.zip')) {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP files are allowed'));
    }
  }
});

// Get all resumes for user
router.get('/all', authenticate, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id })
      .sort({ updatedAt: -1 });
    res.json({ resumes });
  } catch (error) {
    console.error('Error fetching resumes:', error);
    res.status(500).json({ message: 'Failed to fetch resumes' });
  }
});

// Get single resume
router.get('/:id', authenticate, async (req, res) => {
  try {
    const resume = await Resume.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    res.json({ resume });
  } catch (error) {
    console.error('Error fetching resume:', error);
    res.status(500).json({ message: 'Failed to fetch resume' });
  }
});

// Import template (PDF/DOCX) - async job
router.post('/import-template',
  authenticate,
  idempotencyMiddleware,
  templateUpload.single('template'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const filePath = req.file.path;
      const fileUrl = `/uploads/templates/${path.basename(filePath)}`;

      // Create parsing job
      const parsingJob = new ParsingJob({
        userId: req.user._id,
        type: 'template',
        filePath,
        fileUrl,
        status: 'pending'
      });
      await parsingJob.save();

      // Start async parsing (non-blocking)
      processParsingJob(parsingJob._id).catch(err => {
        console.error('Error processing parsing job:', err);
      });

      res.json({
        jobId: parsingJob._id.toString(),
        status: 'pending',
        message: 'Template import job started'
      });
    } catch (error) {
      console.error('Error starting template import job:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to start template import job' 
      });
    }
  }
);

// Get parsing job status
router.get('/parsing-job/:jobId', authenticate, async (req, res) => {
  try {
    const job = await ParsingJob.findOne({
      _id: req.params.jobId,
      userId: req.user._id
    });

    if (!job) {
      return res.status(404).json({ message: 'Parsing job not found' });
    }

    res.json({
      jobId: job._id.toString(),
      status: job.status,
      progress: job.progress,
      result: job.result,
      error: job.error,
      resumeId: job.resumeId?.toString()
    });
  } catch (error) {
    console.error('Error fetching parsing job:', error);
    res.status(500).json({ message: 'Failed to fetch parsing job' });
  }
});

// Get render job status
router.get('/render-job/:jobId', authenticate, async (req, res) => {
  try {
    const job = await RenderJob.findOne({
      _id: req.params.jobId,
      userId: req.user._id
    });

    if (!job) {
      return res.status(404).json({ message: 'Render job not found' });
    }

    res.json({
      jobId: job._id.toString(),
      status: job.status,
      outputUrl: job.outputUrl,
      error: job.error,
      resumeId: job.resumeId?.toString()
    });
  } catch (error) {
    console.error('Error fetching render job:', error);
    res.status(500).json({ message: 'Failed to fetch render job' });
  }
});

// Import from LinkedIn URL - async job
router.post('/import-linkedin-url',
  authenticate,
  idempotencyMiddleware,
  body('url').isURL().withMessage('Valid LinkedIn URL is required'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { url } = req.body;

      // Create parsing job
      const parsingJob = new ParsingJob({
        userId: req.user._id,
        type: 'linkedin-url',
        fileUrl: url,
        status: 'pending'
      });
      await parsingJob.save();

      // Start async parsing (non-blocking)
      processParsingJob(parsingJob._id).catch(err => {
        console.error('Error processing parsing job:', err);
      });

      res.json({
        jobId: parsingJob._id.toString(),
        status: 'pending',
        message: 'LinkedIn URL import job started'
      });
    } catch (error) {
      console.error('Error starting LinkedIn URL import job:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to start LinkedIn URL import job' 
      });
    }
  }
);

// Import from LinkedIn ZIP - async job
router.post('/import-linkedin-zip',
  authenticate,
  idempotencyMiddleware,
  zipUpload.single('zip'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No ZIP file uploaded' });
      }

      const zipPath = req.file.path;
      const fileUrl = `/uploads/linkedin/${path.basename(zipPath)}`;

      // Create parsing job
      const parsingJob = new ParsingJob({
        userId: req.user._id,
        type: 'linkedin-zip',
        filePath: zipPath,
        fileUrl,
        status: 'pending'
      });
      await parsingJob.save();

      // Start async parsing (non-blocking)
      processParsingJob(parsingJob._id).catch(err => {
        console.error('Error processing parsing job:', err);
      });

      res.json({
        jobId: parsingJob._id.toString(),
        status: 'pending',
        message: 'LinkedIn ZIP import job started'
      });
    } catch (error) {
      console.error('Error starting LinkedIn ZIP import job:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to start LinkedIn ZIP import job' 
      });
    }
  }
);

// Get imported template layout
router.get('/template/:id', authenticate, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    if (!resume.importedTemplate || !resume.importedTemplate.parsedLayoutJson) {
      return res.status(404).json({ message: 'No imported template found for this resume' });
    }

    res.json({
      template: resume.importedTemplate.parsedLayoutJson,
      fileUrl: resume.importedTemplate.fileUrl,
      originalName: resume.importedTemplate.originalName
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ message: 'Failed to fetch template' });
  }
});

// Create or update resume
router.post('/save',
  authenticate,
  body('templateId').isIn(['modern', 'classic', 'minimal', 'creative', 'professional', 'executive', 'imported']),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { resumeId, templateId, ...resumeData } = req.body;
      
      let resume;
      if (resumeId) {
        // Update existing resume
        resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
        if (!resume) {
          return res.status(404).json({ message: 'Resume not found' });
        }
        Object.assign(resume, resumeData);
        resume.templateId = templateId;
      } else {
        // Create new resume
        resume = new Resume({
          userId: req.user._id,
          templateId,
          ...resumeData
        });
      }

      await resume.save();
      res.json({ resume });
    } catch (error) {
      console.error('Error saving resume:', error);
      res.status(500).json({ message: 'Failed to save resume' });
    }
  }
);

// Delete resume
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const resume = await Resume.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Delete PDF if exists
    if (resume.pdfUrl) {
      const pdfPath = path.join(__dirname, '..', resume.pdfUrl);
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
    }

    await Resume.deleteOne({ _id: req.params.id });
    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({ message: 'Failed to delete resume' });
  }
});

// Generate PDF - async render job
router.post('/:id/generate-pdf', 
  authenticate,
  idempotencyMiddleware,
  async (req, res) => {
    try {
      const resume = await Resume.findOne({ 
        _id: req.params.id, 
        userId: req.user._id 
      });
      
      if (!resume) {
        return res.status(404).json({ message: 'Resume not found' });
      }

      // Check if render job already exists
      const existingJob = await RenderJob.findOne({
        resumeId: resume._id,
        status: { $in: ['pending', 'processing'] }
      });

      if (existingJob) {
        return res.json({
          jobId: existingJob._id.toString(),
          status: existingJob.status,
          message: 'Render job already in progress'
        });
      }

      // Create render job
      const renderJob = new RenderJob({
        userId: req.user._id,
        resumeId: resume._id,
        status: 'pending'
      });
      await renderJob.save();

      // Start async rendering (non-blocking)
      processRenderJob(renderJob._id).catch(err => {
        console.error('Error processing render job:', err);
      });

      res.json({
        jobId: renderJob._id.toString(),
        status: 'pending',
        message: 'PDF generation job started'
      });
    } catch (error) {
      console.error('Error starting PDF generation job:', error);
      res.status(500).json({ message: 'Failed to start PDF generation job' });
    }
  }
);

// Improve resume with AI (ATS optimization) - async job
router.post('/:id/improve-ai',
  authenticate,
  idempotencyMiddleware,
  body('jobDescription').optional().isString(),
  body('jobRole').optional().isString(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const resume = await Resume.findOne({
        _id: req.params.id,
        userId: req.user._id
      });

      if (!resume) {
        return res.status(404).json({ message: 'Resume not found' });
      }

      const { jobDescription, jobRole } = req.body;

      // Check if ATS job already exists
      const existingJob = await ATSJob.findOne({
        resumeId: resume._id,
        type: 'rewrite',
        status: { $in: ['pending', 'processing'] }
      });

      if (existingJob) {
        return res.json({
          jobId: existingJob._id.toString(),
          status: existingJob.status,
          message: 'AI improvement job already in progress'
        });
      }

      // Create ATS rewrite job
      const atsJob = new ATSJob({
        userId: req.user._id,
        resumeId: resume._id,
        type: 'rewrite',
        jobDescription: jobDescription || '',
        jobRole: jobRole || '',
        status: 'pending'
      });
      await atsJob.save();

      // Start async processing (non-blocking)
      processATSJob(atsJob._id).catch(err => {
        console.error('Error processing ATS job:', err);
      });

      res.json({
        jobId: atsJob._id.toString(),
        status: 'pending',
        message: 'AI improvement job started'
      });
    } catch (error) {
      console.error('Error starting AI improvement job:', error);
      res.status(500).json({ message: 'Failed to start AI improvement job' });
    }
  }
);

// Get ATS job status
router.get('/ats-job/:jobId', authenticate, async (req, res) => {
  try {
    const job = await ATSJob.findOne({
      _id: req.params.jobId,
      userId: req.user._id
    });

    if (!job) {
      return res.status(404).json({ message: 'ATS job not found' });
    }

    res.json({
      jobId: job._id.toString(),
      status: job.status,
      progress: job.progress,
      result: job.result,
      error: job.error
    });
  } catch (error) {
    console.error('Error fetching ATS job:', error);
    res.status(500).json({ message: 'Failed to fetch ATS job' });
  }
});

// Set active resume
router.post('/:id/set-active', authenticate, async (req, res) => {
  try {
    // Set all resumes to inactive
    await Resume.updateMany(
      { userId: req.user._id },
      { isActive: false }
    );

    // Set this resume to active
    const resume = await Resume.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    resume.isActive = true;
    await resume.save();

    res.json({ resume, message: 'Resume set as active' });
  } catch (error) {
    console.error('Error setting active resume:', error);
    res.status(500).json({ message: 'Failed to set active resume' });
  }
});

/**
 * Generate HTML from resume data for PDF rendering
 */
const generateResumeHTML = (resume) => {
  const data = resume.data || INITIAL_RESUME_DATA;
  const escapeHtml = (text) => String(text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; padding: 20px; }
        .header { border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; }
        .name { font-size: 28px; font-weight: bold; color: #1e40af; margin-bottom: 5px; }
        .contact { font-size: 12px; color: #666; }
        .section { margin-bottom: 20px; }
        .section-title { font-size: 18px; font-weight: bold; color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; margin-bottom: 10px; }
        .experience-item, .education-item { margin-bottom: 15px; }
        .job-title { font-weight: bold; font-size: 16px; }
        .company { color: #666; font-size: 14px; }
        .date { color: #999; font-size: 12px; font-style: italic; }
        .description { margin-top: 5px; font-size: 14px; }
        .skills { display: flex; flex-wrap: wrap; gap: 8px; }
        .skill-tag { background: #e0e7ff; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
        .summary { font-style: italic; color: #555; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="name">${escapeHtml(data.personalInfo?.fullName || 'Your Name')}</div>
        <div class="contact">
          ${data.personalInfo?.email ? `Email: ${escapeHtml(data.personalInfo.email)} | ` : ''}
          ${data.personalInfo?.phone ? `Phone: ${escapeHtml(data.personalInfo.phone)} | ` : ''}
          ${escapeHtml(data.personalInfo?.location || '')}
        </div>
      </div>
      
      ${data.personalInfo?.summary ? `<div class="summary">${escapeHtml(data.personalInfo.summary)}</div>` : ''}
      
      ${data.experience && data.experience.length > 0 ? `
        <div class="section">
          <div class="section-title">EXPERIENCE</div>
          ${data.experience.map(exp => `
            <div class="experience-item">
              <div class="job-title">${escapeHtml(exp.title || '')}</div>
              <div class="company">${escapeHtml(exp.company || '')}</div>
              <div class="date">${escapeHtml(exp.startDate || '')} - ${exp.current ? 'Present' : escapeHtml(exp.endDate || '')}</div>
              <div class="description">${escapeHtml(exp.description || '')}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      ${data.education && data.education.length > 0 ? `
        <div class="section">
          <div class="section-title">EDUCATION</div>
          ${data.education.map(edu => `
            <div class="education-item">
              <div class="job-title">${escapeHtml(edu.degree || '')}</div>
              <div class="company">${escapeHtml(edu.institution || '')}</div>
              <div class="date">${escapeHtml(edu.startDate || '')} - ${escapeHtml(edu.endDate || '')}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      ${data.skills && data.skills.length > 0 ? `
        <div class="section">
          <div class="section-title">SKILLS</div>
          <div class="skills">
            ${data.skills.map(skill => 
              skill.items ? skill.items.map(item => `<span class="skill-tag">${escapeHtml(item || '')}</span>`).join('') : ''
            ).join('')}
          </div>
        </div>
      ` : ''}
    </body>
    </html>
  `;
  
  return html;
};

/**
 * Convert resume data to text format for AI analysis
 */
const convertResumeToText = (resume) => {
  let text = '';
  
  if (resume.personalInfo) {
    text += `Name: ${resume.personalInfo.fullName || ''}\n`;
    text += `Summary: ${resume.personalInfo.summary || ''}\n\n`;
  }
  
  if (resume.experience && resume.experience.length > 0) {
    text += 'EXPERIENCE\n';
    resume.experience.forEach(exp => {
      text += `${exp.title || ''} at ${exp.company || ''}\n`;
      text += `${exp.startDate || ''} - ${exp.current ? 'Present' : exp.endDate || ''}\n`;
      text += `${exp.description || ''}\n`;
      if (exp.achievements && exp.achievements.length > 0) {
        exp.achievements.forEach(ach => text += `• ${ach}\n`);
      }
      text += '\n';
    });
  }
  
  if (resume.education && resume.education.length > 0) {
    text += 'EDUCATION\n';
    resume.education.forEach(edu => {
      text += `${edu.degree || ''} from ${edu.institution || ''}\n`;
      text += `${edu.startDate || ''} - ${edu.endDate || ''}\n\n`;
    });
  }
  
  if (resume.skills && resume.skills.length > 0) {
    text += 'SKILLS\n';
    resume.skills.forEach(skill => {
      if (skill.category) {
        text += `${skill.category}: `;
      }
      if (skill.items && skill.items.length > 0) {
        text += skill.items.join(', ');
      }
      text += '\n';
    });
  }
  
  return text;
};

/**
 * Apply AI improvements to resume
 */
const applyAIImprovements = async (resume, improvementResult, jobDescription) => {
  // Create a copy to modify
  const improved = resume.toObject();
  
  // Improve summary if provided
  if (improvementResult.suggestedSummary) {
    improved.personalInfo = improved.personalInfo || {};
    improved.personalInfo.summary = improvementResult.suggestedSummary;
  }
  
  // Improve experience descriptions using STAR method
  if (improvementResult.improvedExperience && improved.experience) {
    improved.experience = improved.experience.map((exp, idx) => {
      const improvedExp = improvementResult.improvedExperience[idx];
      if (improvedExp) {
        return {
          ...exp,
          description: improvedExp.description || exp.description,
          achievements: improvedExp.achievements || exp.achievements
        };
      }
      return exp;
    });
  }
  
  // Add suggested keywords to skills
  if (improvementResult.suggestedKeywords && improved.skills) {
    const existingSkills = new Set();
    improved.skills.forEach(skill => {
      if (skill.items) {
        skill.items.forEach(item => existingSkills.add(item.toLowerCase()));
      }
    });
    
    improvementResult.suggestedKeywords.forEach(keyword => {
      if (!existingSkills.has(keyword.toLowerCase())) {
        if (improved.skills.length === 0) {
          improved.skills.push({ category: '', items: [] });
        }
        if (!improved.skills[0].items) {
          improved.skills[0].items = [];
        }
        improved.skills[0].items.push(keyword);
      }
    });
  }
  
  // Update resume with improvements
  Object.assign(resume, improved);
  
  return resume;
};

/**
 * Process parsing job asynchronously
 */
const processParsingJob = async (jobId) => {
  try {
    const job = await ParsingJob.findById(jobId);
    if (!job) {
      console.error(`Parsing job ${jobId} not found`);
      return;
    }

    job.status = 'processing';
    job.startedAt = new Date();
    job.progress = 10;
    await job.save();

    let parsedData = null;
    let parsedLayout = null;

    if (job.type === 'template') {
      job.progress = 30;
      await job.save();
      
      parsedLayout = await parseTemplate(job.filePath);
      const fileUrl = job.fileUrl;
      const originalName = path.basename(job.filePath);

      const resume = new Resume({
        userId: job.userId,
        templateId: 'imported',
        importedTemplate: {
          originalName,
          fileUrl,
          parsedLayoutJson: parsedLayout,
          importedAt: new Date()
        },
        ...INITIAL_RESUME_DATA
      });
      await resume.save();

      job.resumeId = resume._id;
      job.result = { parsedLayoutJson: parsedLayout };
    } else if (job.type === 'linkedin-zip') {
      job.progress = 30;
      await job.save();
      
      parsedData = await parseLinkedInZIP(job.filePath);

      const resume = new Resume({
        userId: job.userId,
        templateId: 'modern',
        linkedInData: {
          parsedData,
          importedAt: new Date(),
          importSource: 'zip'
        },
        personalInfo: {
          fullName: parsedData.name || '',
          summary: parsedData.summary || '',
          linkedin: ''
        },
        experience: parsedData.experience || [],
        education: parsedData.education || [],
        skills: parsedData.skills || [],
        projects: parsedData.projects || [],
        certifications: parsedData.certifications || []
      });
      await resume.save();

      // Clean up ZIP file
      if (fs.existsSync(job.filePath)) {
        fs.unlinkSync(job.filePath);
      }

      job.resumeId = resume._id;
      job.result = { linkedInData: parsedData };
    } else if (job.type === 'linkedin-url') {
      job.progress = 30;
      await job.save();
      
      parsedData = await parseLinkedInURL(job.fileUrl);

      const resume = new Resume({
        userId: job.userId,
        templateId: 'modern',
        linkedInData: {
          parsedData,
          importedAt: new Date(),
          importSource: 'url'
        },
        personalInfo: {
          fullName: parsedData.name || '',
          summary: parsedData.summary || '',
          linkedin: job.fileUrl
        },
        experience: parsedData.experience || [],
        education: parsedData.education || [],
        skills: parsedData.skills || [],
        projects: parsedData.projects || [],
        certifications: parsedData.certifications || []
      });
      await resume.save();

      job.resumeId = resume._id;
      job.result = { linkedInData: parsedData };
    }

    job.status = 'completed';
    job.progress = 100;
    job.completedAt = new Date();
    await job.save();

    console.log(`Parsing job ${jobId} completed successfully`);
  } catch (error) {
    console.error(`Error processing parsing job ${jobId}:`, error);
    const job = await ParsingJob.findById(jobId);
    if (job) {
      job.status = 'failed';
      job.error = error.message;
      await job.save();
    }
  }
};

/**
 * Process render job asynchronously
 */
const processRenderJob = async (jobId) => {
  try {
    const job = await RenderJob.findById(jobId);
    if (!job) {
      console.error(`Render job ${jobId} not found`);
      return;
    }

    job.status = 'processing';
    job.startedAt = new Date();
    job.progress = 20;
    await job.save();

    const resume = await Resume.findById(job.resumeId);
    if (!resume) {
      throw new Error('Resume not found');
    }

    job.progress = 50;
    await job.save();

    // Generate PDF using puppeteer
    const puppeteer = (await import('puppeteer')).default;
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer'
      ]
    });
    
    try {
      const page = await browser.newPage();
      
      // Generate HTML from resume data
      const htmlContent = generateResumeHTML(resume);
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' }
      });
      
      // Save PDF file
      const uploadDir = path.join(__dirname, '../uploads/resumes');
      await fs.mkdir(uploadDir, { recursive: true });
      const filename = `resume-${resume._id}-${Date.now()}.pdf`;
      const filePath = path.join(uploadDir, filename);
      await fs.writeFile(filePath, pdfBuffer);
      
      const pdfUrl = `/uploads/resumes/${filename}`;
      const previewUrl = pdfUrl;

      resume.pdfUrl = pdfUrl;
      await resume.save();
      
      job.outputUrl = pdfUrl;
      job.progress = 90;
      await job.save();
      
      job.status = 'completed';
      job.progress = 100;
      job.result = { pdfUrl, previewUrl };
      job.completedAt = new Date();
      await job.save();
      
      await browser.close();
    } catch (pdfError) {
      await browser.close();
      throw pdfError;
    }

    console.log(`Render job ${jobId} completed successfully`);
  } catch (error) {
    console.error(`Error processing render job ${jobId}:`, error);
    const job = await RenderJob.findById(jobId);
    if (job) {
      job.status = 'failed';
      job.error = error.message;
      await job.save();
    }
  }
};

/**
 * Process ATS job asynchronously
 */
const processATSJob = async (jobId) => {
  try {
    const job = await ATSJob.findById(jobId);
    if (!job) {
      console.error(`ATS job ${jobId} not found`);
      return;
    }

    job.status = 'processing';
    job.startedAt = new Date();
    job.progress = 10;
    await job.save();

    const resume = await Resume.findById(job.resumeId);
    if (!resume) {
      throw new Error('Resume not found');
    }

    job.progress = 30;
    await job.save();

    const resumeText = convertResumeToText(resume);

    if (job.type === 'rewrite') {
      // AI rewrite
      job.progress = 50;
      await job.save();

      const improvementResult = await aiBrain.process('resume-ats', {
        resumeText,
        resumeData: resume,
        jobDescription: job.jobDescription,
        jobRole: job.jobRole || resume.personalInfo?.summary || 'General'
      });

      job.progress = 80;
      await job.save();

      // Apply improvements
      const improvedResume = await applyAIImprovements(resume, improvementResult, job.jobDescription);
      await improvedResume.save();

      job.result = {
        improvedResume: improvedResume.toObject(),
        suggestions: improvementResult.suggestions || [],
        keywords: improvementResult.keywords || [],
        missingKeywords: improvementResult.missingKeywords || []
      };
    } else {
      // ATS scoring
      job.progress = 50;
      await job.save();

      const atsResult = await aiBrain.process('resume-ats', {
        resumeText,
        resumeData: resume,
        jobDescription: job.jobDescription,
        jobRole: job.jobRole
      });

      job.result = {
        atsScore: atsResult.score || 0,
        suggestions: atsResult.suggestions || [],
        keywords: atsResult.keywords || [],
        missingKeywords: atsResult.missingKeywords || []
      };
    }

    job.status = 'completed';
    job.progress = 100;
    job.completedAt = new Date();
    await job.save();

    console.log(`ATS job ${jobId} completed successfully`);
  } catch (error) {
    console.error(`Error processing ATS job ${jobId}:`, error);
    const job = await ATSJob.findById(jobId);
    if (job) {
      job.status = 'failed';
      job.error = error.message;
      await job.save();
    }
  }
};

export default router;

