import mongoose from 'mongoose';

const atsJobSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    index: true
  },
  jobDescription: String,
  jobRole: String,
  type: {
    type: String,
    enum: ['score', 'rewrite'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
    index: true
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  result: {
    atsScore: Number,
    suggestions: [String],
    improvedResume: mongoose.Schema.Types.Mixed,
    keywords: [String],
    missingKeywords: [String]
  },
  error: String,
  startedAt: Date,
  completedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

atsJobSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const ATSJob = mongoose.model('ATSJob', atsJobSchema);
export default ATSJob;

