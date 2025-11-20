import mongoose from 'mongoose';

const parsingJobSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['template', 'linkedin-zip', 'linkedin-url', 'pdf', 'docx'],
    required: true
  },
  filePath: String,
  fileUrl: String,
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
    parsedLayoutJson: mongoose.Schema.Types.Mixed,
    linkedInData: mongoose.Schema.Types.Mixed,
    parsedData: mongoose.Schema.Types.Mixed
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

parsingJobSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const ParsingJob = mongoose.model('ParsingJob', parsingJobSchema);
export default ParsingJob;

