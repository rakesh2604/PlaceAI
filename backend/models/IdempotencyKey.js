import mongoose from 'mongoose';

const idempotencyKeySchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  method: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  statusCode: {
    type: Number,
    required: true
  },
  headers: {
    type: Map,
    of: String
  },
  responseBody: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Cleanup expired keys periodically
idempotencyKeySchema.index({ expiresAt: 1 });

const IdempotencyKey = mongoose.model('IdempotencyKey', idempotencyKeySchema);

export default IdempotencyKey;

