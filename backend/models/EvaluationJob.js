import mongoose from 'mongoose';

const evaluationJobSchema = new mongoose.Schema({
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
    type: mongoose.Schema.Types.Mixed
  },
  error: {
    type: String
  },
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

evaluationJobSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const EvaluationJob = mongoose.model('EvaluationJob', evaluationJobSchema);
export default EvaluationJob;

