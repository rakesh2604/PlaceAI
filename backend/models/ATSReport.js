import mongoose from 'mongoose';

const atsReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    default: null
  },
  originalPdfUrl: String,
  extractedText: String,
  jobDescription: String, // Optional - if ATS check is for specific job
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  breakdown: {
    keywords: {
      score: Number,
      matched: [String],
      missing: [String],
      suggestions: [String]
    },
    formatting: {
      score: Number,
      issues: [String],
      suggestions: [String]
    },
    content: {
      score: Number,
      strengths: [String],
      weaknesses: [String],
      suggestions: [String]
    },
    structure: {
      score: Number,
      issues: [String],
      suggestions: [String]
    }
  },
  recommendations: [{
    type: {
      type: String,
      enum: ['critical', 'important', 'optional']
    },
    category: String,
    title: String,
    description: String,
    priority: Number
  }],
  strengths: [String],
  weaknesses: [String],
  keywordsAnalysis: {
    found: [String],
    missing: [String],
    relevant: [String],
    irrelevant: [String]
  },
  pdfUrl: String, // Generated report PDF
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

atsReportSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const ATSReport = mongoose.model('ATSReport', atsReportSchema);
export default ATSReport;

