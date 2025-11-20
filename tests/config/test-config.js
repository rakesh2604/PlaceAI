import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../backend/.env') });

export const TEST_CONFIG = {
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:5000/api',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret',
  TEST_EMAIL_CANDIDATE: 'test.candidate@test.com',
  TEST_EMAIL_RECRUITER: 'test.recruiter@test.com',
  TEST_EMAIL_ADMIN: 'test.admin@test.com',
  TEST_PASSWORD: 'test123456',
  TEST_PHONE: '+1234567890',
  TEST_NAME: 'Test User',
  TIMEOUT: 30000,
  POLL_INTERVAL: 1000,
  MAX_POLL_ATTEMPTS: 30
};

export const ROLES = {
  CANDIDATE: 'candidate',
  RECRUITER: 'recruiter',
  ADMIN: 'admin'
};

