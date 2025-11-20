import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  questions: [{
    id: String,
    text: String,
    category: String,
    timeLimit: Number, // seconds
    order: Number
  }],
  answers: [{
    questionId: String,
    answerText: String,
    transcript: String, // Speech-to-text transcript
    transcriptChunks: [{ // Real-time transcript chunks with offsets
      offset: Number, // Chunk offset ID for resume
      text: String,
      timestamp: Date,
      acknowledged: Boolean
    }],
    audioUrl: String, // Optional audio file
    audioChunks: [{ // Audio chunks for resume
      offset: Number,
      data: String, // Base64 encoded or URL
      timestamp: Date,
      acknowledged: Boolean
    }],
    timeTaken: Number, // seconds
    language: String, // Detected language
    timestamp: Date
  }],
  behaviorData: [{ // Real-time behavior metrics
    timestamp: Date,
    questionId: String,
    metrics: {
      fillerWords: Number,
      pauseCount: Number,
      speakingRate: Number, // words per minute
      confidence: Number, // 0-1
      energy: Number // 0-1
    }
  }],
  evaluationJobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EvaluationJob'
  },
  recordingUrl: String,
  detectedLanguage: {
    type: String,
    default: 'en' // Default to English
  },
  aiScores: {
    communication: Number,
    confidence: Number,
    technical: Number,
    overall: Number,
    fluency: Number,
    vocabularyStrength: Number,
    domainKnowledge: Number,
    fillerWordsCount: Number,
    grammarAccuracy: Number,
    multiLanguageCoherence: Number,
    strengths: [String],
    improvements: [String],
    summary: String,
    detailedFeedback: {
      communication: String,
      confidence: String,
      fluency: String,
      vocabulary: String,
      domainKnowledge: String,
      grammar: String
    }
  },
  status: {
    type: String,
    enum: ['pending', 'ongoing', 'completed', 'evaluated'],
    default: 'pending'
  },
  currentQuestionIndex: {
    type: Number,
    default: 0
  },
  startedAt: Date,
  completedAt: Date,
  evaluatedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

interviewSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Interview = mongoose.model('Interview', interviewSchema);
export default Interview;

