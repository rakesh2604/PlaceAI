import mongoose from 'mongoose';

const recruiterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  companyName: {
    type: String,
    required: true
  },
  credits: {
    type: Number,
    default: 0
  },
  planType: {
    type: String,
    enum: ['free', 'basic', 'premium'],
    default: 'free'
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  billingHistory: [{
    stripeSessionId: String,
    stripeChargeId: String,
    amount: Number,
    currency: String,
    planType: String,
    createdAt: Date
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Recruiter = mongoose.model('Recruiter', recruiterSchema);
export default Recruiter;

