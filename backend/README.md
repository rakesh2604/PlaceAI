# PlacedAI Backend

Backend API server for PlacedAI platform built with Node.js, Express, and MongoDB.

## Overview

The backend provides RESTful API endpoints for:
- Authentication (email OTP)
- User management
- Interview management
- Job recommendations
- Resume analysis and ATS scoring
- Billing and payments (Stripe)
- Admin operations
- Support and chat

## API Structure

All routes are mounted under `/api` prefix:

- `/api/health` - Health check endpoint
- `/api/auth` - Authentication routes
- `/api/user` - User management
- `/api/jobs` - Job management
- `/api/interview` - Interview management
- `/api/resume` - Resume analysis and ATS scoring
- `/api/billing` - Billing and payments
- `/api/admin` - Admin operations
- `/api/support` - Support tickets
- `/api/chat` - AI chat functionality

## Main Routes

### Authentication (`/api/auth`)
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP and get JWT token
- `POST /api/auth/recruiter/register` - Register recruiter
- `POST /api/auth/recruiter/login` - Login recruiter

### User (`/api/user`)
- `GET /api/user/me` - Get current user profile
- `PUT /api/user/basic` - Update basic info (phone, resume, etc.)
- `PUT /api/user/role-skills` - Update selected role and skills

### Jobs (`/api/jobs`)
- `GET /api/jobs/recommend` - Get recommended jobs for user
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs` - Create job (recruiter/admin)

### Interviews (`/api/interview`)
- `POST /api/interview/start` - Start new interview
- `POST /api/interview/upload-recording` - Upload interview recording
- `POST /api/interview/finish` - Finish interview and get AI scores
- `GET /api/interview/my` - Get user's interviews
- `GET /api/interview/:id` - Get interview details

### Resume (`/api/resume`)
- `POST /api/resume/ats-score` - Get ATS score for resume
- `POST /api/resume/analyze` - Analyze resume and get insights

### Billing (`/api/billing`)
- `GET /api/billing/plans` - Get available plans
- `POST /api/billing/create-checkout-session` - Create Stripe checkout
- `POST /api/billing/webhook` - Stripe webhook handler
- `GET /api/billing/history` - Get billing history

### Admin (`/api/admin`)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/recruiters` - Get all recruiters
- `PATCH /api/admin/recruiters/:id/status` - Update recruiter status
- `GET /api/admin/interviews` - Get all interviews
- `GET /api/admin/payments` - Get all payments
- `GET /api/admin/stats` - Get dashboard stats

## Health Check

The health check endpoint is critical for frontend connectivity:

```bash
GET /api/health
```

Returns:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

This endpoint is called by the frontend on auth screen mount to verify backend connectivity.

## Running the Backend

### Development

```bash
cd backend
npm install
npm run dev
```

Server runs on `http://localhost:5000`

### Production

```bash
cd backend
npm install
npm start
```

## Environment Variables

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/placedai
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Email (optional - works in mock mode)
EMAIL_FROM=noreply@placedai.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# WhatsApp (optional - works in mock mode)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# AI (optional - works in mock mode)
AI_API_BASE_URL=https://api.openai.com/v1
AI_API_KEY=your-openai-api-key

# Stripe (optional - works in mock mode)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

## Database

### MongoDB Connection

The backend connects to MongoDB using the `MONGO_URI` environment variable. Supports both local MongoDB and MongoDB Atlas.

### Models

- `User` - User accounts (candidates, recruiters, admins)
- `Job` - Job postings
- `Interview` - Interview sessions and results
- `OptIn` - Recruiter opt-in requests
- `Payment` - Payment records
- `Support` - Support tickets

### Migrations/Seeding

To seed the database with sample data:

```bash
npm run seed
```

This creates:
- Admin user: `admin@placedai.com`
- Sample recruiter and candidate accounts
- Sample jobs and interviews

## Services

The backend uses service modules for business logic:

- `emailService.js` - Email sending (Nodemailer)
- `whatsappService.js` - WhatsApp notifications (Twilio)
- `aiScoringService.js` - AI interview scoring
- `paymentService.js` - Stripe payment processing
- `resumeParser.js` - Resume parsing and analysis

All services work in "mock mode" if credentials are not provided, making development easier.

## Error Handling

- Network errors return appropriate HTTP status codes
- Validation errors return 400 with error details
- Authentication errors return 401
- Server errors return 500 with error messages (stack trace in development only)

## Security

- JWT tokens for authentication
- Password hashing with bcrypt
- Input validation with express-validator
- CORS configured for frontend origin
- File upload validation and size limits

