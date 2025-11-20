import mongoose from 'mongoose';

const judgeEvaluationSchema = new mongoose.Schema({
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview',
    required: true,
    index: true
  },
  judgeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  judgeName: String,
  judgeRole: {
    type: String,
    enum: ['hiring-manager', 'technical-lead', 'hr', 'peer', 'admin'],
    default: 'hiring-manager'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
    index: true
  },
  scores: {
    communication: Number,
    confidence: Number,
    technical: Number,
    overall: Number,
    culturalFit: Number,
    problemSolving: Number
  },
  feedback: {
    strengths: [String],
    improvements: [String],
    summary: String,
    detailedFeedback: mongoose.Schema.Types.Mixed,
    recommendation: {
      type: String,
      enum: ['strong-hire', 'hire', 'maybe', 'no-hire'],
      default: 'maybe'
    }
  },
  weight: {
    type: Number,
    default: 1.0,
    min: 0,
    max: 2.0
  },
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

judgeEvaluationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const JudgeEvaluation = mongoose.model('JudgeEvaluation', judgeEvaluationSchema);
export default JudgeEvaluation;

