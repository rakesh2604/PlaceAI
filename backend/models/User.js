import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['candidate', 'recruiter', 'admin'],
    default: 'candidate'
  },
  passwordHash: String, // For password storage
  googleId: String, // For Google OAuth
  otpHash: String, // Deprecated - kept for migration
  otpExpiry: Date, // Deprecated - kept for migration
  phone: String,
  phoneVerified: {
    type: Boolean,
    default: false
  },
  currency: {
    type: String,
    default: 'INR'
  },
  compensationPaise: {
    type: Number,
    default: 0
  },
  resume: {
    id: String,
    filename: String,
    size: Number,
    mimeType: String,
    uploadedAt: Date
  },
  resumeUrl: String,
  resumeParsed: {
    skills: [String],
    experienceYears: Number,
    currentRole: String,
    educationSummary: String
  },
  languages: [String],
  ctc: Number,
  selectedRoleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  selectedSkills: [String],
  // Plan and usage tracking
  planId: {
    type: String,
    default: 'free',
    enum: ['free', 'premium', 'enterprise']
  },
  planActiveUntil: {
    type: Date,
    default: null
  },
  usage: {
    aiInterviewsThisMonth: { type: Number, default: 0 },
    atsChecksThisMonth: { type: Number, default: 0 },
    resumeGenerationsThisMonth: { type: Number, default: 0 },
    usageMonth: { type: String, default: () => new Date().toISOString().slice(0, 7) } // YYYY-MM format
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  isPremium: {
    type: Boolean,
    default: false
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

userSchema.methods.compareOTP = async function(otp) {
  if (!this.otpHash || !this.otpExpiry) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[OTP Compare] Missing OTP hash or expiry');
    }
    return false;
  }
  if (new Date() > this.otpExpiry) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[OTP Compare] OTP expired. Expiry:', this.otpExpiry, 'Now:', new Date());
    }
    return false;
  }
  // Ensure OTP is a string for bcrypt comparison
  const otpString = String(otp).trim();
  const isValid = await bcrypt.compare(otpString, this.otpHash);
  if (!isValid && process.env.NODE_ENV === 'development') {
    console.log('[OTP Compare] OTP mismatch. Received:', otpString, 'Hash exists:', !!this.otpHash);
  }
  return isValid;
};

userSchema.methods.setOTP = async function(otp) {
  this.otpHash = await bcrypt.hash(otp, 10);
  this.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
};

userSchema.methods.comparePassword = async function(password) {
  if (!this.passwordHash) return false;
  return await bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.setPassword = async function(password) {
  if (password) {
    this.passwordHash = await bcrypt.hash(password, 10);
  }
};

const User = mongoose.model('User', userSchema);
export default User;

