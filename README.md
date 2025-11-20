# PlacedAI - AI-Powered Placement Prep Platform

**PlacedAI** is an AI-powered placement preparation platform designed specifically for Indian students. We help students from any college crack campus placements through AI-powered mock interviews, ATS resume scoring, personalized job recommendations, and real-time feedback.

## Product Description

PlacedAI is a comprehensive SaaS platform that democratizes access to quality placement preparation. Whether you're from an IIT, NIT, or a Tier-3 college, PlacedAI provides you with the same high-quality AI-powered tools to prepare for placements.

### Key Features

- **AI-Powered Mock Interviews**: Practice with AI that simulates real interview scenarios
- **ATS Resume Scoring**: Optimize your resume for Applicant Tracking Systems
- **Resume Builder**: Create professional resumes with AI-powered suggestions
- **Personalized Job Suggestions**: Get matched with roles that fit your profile
- **Real-time AI Feedback**: Receive instant feedback on interview performance
- **Shareable Interview Feedback**: Share your progress with mentors and peers
- **Plans**: Free tier for basic features, Premium for advanced capabilities
- **Admin Panel**: Comprehensive admin dashboard for platform management

## Features

- **Candidate Onboarding**: Email OTP authentication, resume upload, profile completion
- **AI Interviews**: Video/audio recording with AI-powered scoring
- **Recruiter Panel**: Browse candidates, send opt-in requests, manage jobs
- **Admin Dashboard**: Manage users, recruiters, interviews, and payments
- **Notifications**: Email and WhatsApp integration
- **Resume Parsing**: Automatic extraction of skills and experience
- **Payments**: Stripe integration for recruiter plans

## Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Multer for file uploads
- Nodemailer for emails
- Twilio for WhatsApp
- Stripe for payments

### Frontend
- React + Vite
- React Router
- TailwindCSS
- Zustand for state management
- Axios for API calls
- Framer Motion for animations

## Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- Stripe account (for payments, optional)
- Twilio account (for WhatsApp, optional)
- SMTP email service (Gmail, SendGrid, etc., optional)

### Installation

1. **Install all dependencies** (root, backend, and frontend):
```bash
npm run install:all
```

Or install manually:
```bash
# Install root dependencies (concurrently)
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Configuration

#### Backend Environment Variables

Create `backend/.env` file:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/placedai
JWT_SECRET=your-super-secret-jwt-key-change-in-production
EMAIL_FROM=noreply@placedai.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

AI_API_BASE_URL=https://api.openai.com/v1
AI_API_KEY=your-openai-api-key

STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
FRONTEND_URL=http://localhost:5173
```

**Note**: All services (email, WhatsApp, AI, payments) work in mock mode if credentials are not provided.

#### Frontend Environment Variables

Create `frontend/.env.local` file:

**Development:**
```env
VITE_API_BASE_URL=/api
```

**Production:**
```env
VITE_API_BASE_URL=https://<BACKEND_DOMAIN>/api
```

The frontend uses relative paths (`/api`) which are proxied to the backend via Vite in development. In production, set `VITE_API_BASE_URL` to your production API URL.

### Running the Application

#### Single Command (Recommended)

Run both frontend and backend together from the root:

```bash
npm run dev
```

This will start:
- **Backend** on `http://localhost:5000`
- **Frontend** on `http://localhost:5173`

#### Individual Commands

If you prefer to run them separately:

**Backend only:**
```bash
cd backend
npm run dev
```

**Frontend only:**
```bash
cd frontend
npm run dev
```

### Database Seeding

To seed the database with sample data:

```bash
npm run seed
```

Or manually:
```bash
cd backend
npm run seed
```

This creates:
- Admin user: `admin@placedai.com` / `admin123`
- Recruiter: `recruiter@test.com` / `recruiter123`
- Candidate: `candidate@test.com` / `candidate123`
- Sample jobs

## Project Structure

```
PlacedAI/
├── package.json          # Root package.json with unified dev scripts
├── README.md
│
├── backend/
│   ├── models/          # Mongoose models
│   ├── routes/          # Express routes (all under /api prefix)
│   ├── services/        # Business logic (email, WhatsApp, AI, payments)
│   ├── middleware/      # Auth middleware
│   ├── utils/           # Utilities (resume parser)
│   ├── scripts/         # Seed scripts
│   ├── uploads/         # Uploaded files
│   ├── .env             # Backend environment variables
│   ├── package.json
│   └── server.js        # Entry point
│
└── frontend/
    ├── src/
    │   ├── components/  # Reusable components
    │   ├── pages/        # Page components
    │   ├── routes/       # Route definitions
    │   ├── services/     # API services (uses /api relative paths)
    │   ├── store/        # State management
    │   └── utils/        # Utilities
    ├── public/
    ├── .env.local        # Frontend environment variables (optional)
    ├── vite.config.js    # Vite config with proxy to backend
    └── package.json
```

## Development Workflow

### Unified Development

The project uses `concurrently` to run both servers together:

- **Root command**: `npm run dev` - Runs both frontend and backend
- **Proxy configuration**: Frontend requests to `/api/*` are automatically proxied to `http://localhost:5000/api/*`
- **No CORS issues**: All requests go through the same origin in development

### API Configuration

- **Development**: Frontend uses relative paths (`/api/*`) which are proxied by Vite
- **Production**: Set `VITE_API_BASE_URL` to your production API URL

### Backend Routes

All backend routes are prefixed with `/api`:

- `/api/auth/*` - Authentication
- `/api/user/*` - User management
- `/api/jobs/*` - Job management
- `/api/interview/*` - Interview management
- `/api/optins/*` - Opt-in requests
- `/api/recruiter/*` - Recruiter operations
- `/api/billing/*` - Billing and payments
- `/api/admin/*` - Admin operations

## API Endpoints

### Auth
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP and get JWT
- `POST /api/auth/recruiter/register` - Register recruiter
- `POST /api/auth/recruiter/login` - Login recruiter

### User
- `GET /api/user/me` - Get current user
- `PUT /api/user/basic` - Update basic info (phone, resume, etc.)
- `PUT /api/user/role-skills` - Update selected role and skills

### Jobs
- `GET /api/jobs/recommend` - Get recommended jobs
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs` - Create job (recruiter/admin)

### Interviews
- `POST /api/interview/start` - Start interview
- `POST /api/interview/upload-recording` - Upload recording
- `POST /api/interview/finish` - Finish interview and get AI scores
- `GET /api/interview/my` - Get user's interviews
- `GET /api/interview/:id` - Get interview details

### Opt-Ins
- `GET /api/optins/requests` - Get opt-in requests (candidate)
- `POST /api/optins/submit` - Submit opt-in response

### Recruiter
- `GET /api/recruiter/profile` - Get recruiter profile
- `GET /api/recruiter/jobs` - Get recruiter's jobs
- `POST /api/recruiter/jobs` - Create job
- `GET /api/recruiter/candidates` - Browse candidates
- `POST /api/recruiter/optins/request` - Send opt-in request
- `GET /api/recruiter/optins` - Get opt-in activity

### Billing
- `GET /api/billing/plans` - Get available plans
- `POST /api/billing/create-checkout-session` - Create Stripe checkout
- `POST /api/billing/webhook` - Stripe webhook handler
- `GET /api/billing/history` - Get billing history

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/recruiters` - Get all recruiters
- `PATCH /api/admin/recruiters/:id/status` - Update recruiter status
- `GET /api/admin/interviews` - Get all interviews
- `GET /api/admin/payments` - Get all payments
- `GET /api/admin/stats` - Get dashboard stats

## Stripe Webhook Setup

For local development, use Stripe CLI:

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli

2. Login:
```bash
stripe login
```

3. Forward webhooks to local server:
```bash
stripe listen --forward-to localhost:5000/api/billing/webhook
```

4. Copy the webhook signing secret and add it to `backend/.env` as `STRIPE_WEBHOOK_SECRET`

## Production Build

### Build Frontend

```bash
npm run build
```

This builds the frontend to `frontend/dist/`.

### Production Environment Variables

- **Backend**: Set all required environment variables in production
- **Frontend**: Set `VITE_API_BASE_URL` to your production API URL (e.g., `https://api.yourapp.com/api`)

## Authentication Flow

PlacedAI uses **email-only authentication** with OTP verification:

1. User enters email on login/signup screen
2. System sends 6-digit OTP to email
3. User verifies OTP
4. On success, JWT token is created and user is redirected

**Health Check**: The auth screen performs a health check on mount by calling `/api/health`. The "Backend server is not reachable" message only appears if the health check fails (network/server error). Validation errors and other API errors show their actual error messages.

## Troubleshooting

### Backend Connection Issues

**Problem**: "Backend server is not reachable" appears even when backend is running.

**Solutions**:
1. Ensure backend is running on port 5000: `cd backend && npm run dev`
2. Check that `frontend/vite.config.js` has the proxy configured:
   ```js
   proxy: {
     '/api': 'http://localhost:5000'
   }
   ```
3. Verify `frontend/.env.local` has `VITE_API_BASE_URL=/api` (or is not set, defaults to `/api`)
4. Check browser console for network errors
5. Ensure no firewall is blocking localhost:5000

### Auth Not Working

**Problem**: Login/Signup shows errors.

**Solutions**:
1. Check backend logs for errors
2. Verify MongoDB is running and connected
3. Check email service configuration (or use mock mode in development)
4. In development, OTP is shown in console/alert if email service is not configured
5. Verify JWT_SECRET is set in backend/.env

### API Calls Failing

**Problem**: API requests return errors.

**Solutions**:
1. All API calls must use the `api` client from `frontend/src/services/api.js`
2. Never use hardcoded URLs like `http://localhost:5000`
3. In development, use relative paths (`/api/*`) which are proxied
4. In production, set `VITE_API_BASE_URL` environment variable

## Development Notes

- All services (email, WhatsApp, AI, payments) are abstracted and can work without credentials (mock mode)
- Resume parsing supports PDF, DOC, DOCX formats
- Interview recordings are stored locally (can be moved to S3/cloud storage)
- AI scoring uses OpenAI-compatible API (can be swapped for other providers)
- Frontend uses Vite proxy in development to avoid CORS issues
- All API calls use relative paths (`/api/*`) which work in both dev and production
- Health check endpoint: `GET /api/health` returns `{ status: "ok" }`

## Project Structure

```
PlacedAI/
├── README.md              # This file - comprehensive project documentation
├── package.json           # Root package.json with unified dev scripts
│
├── backend/
│   ├── README.md         # Backend-specific documentation
│   ├── models/           # Mongoose models
│   ├── routes/           # Express routes (all under /api prefix)
│   ├── services/         # Business logic (email, WhatsApp, AI, payments)
│   ├── middleware/       # Auth middleware
│   ├── utils/            # Utilities (resume parser)
│   ├── scripts/          # Seed scripts
│   ├── uploads/          # Uploaded files
│   ├── .env              # Backend environment variables
│   ├── package.json
│   └── server.js         # Entry point
│
└── frontend/
    ├── README.md         # Frontend-specific documentation
    ├── src/
    │   ├── components/   # Reusable components
    │   ├── pages/        # Page components
    │   ├── routes/       # Route definitions
    │   ├── services/     # API services (uses /api relative paths)
    │   ├── store/        # State management (Zustand)
    │   └── utils/        # Utilities
    ├── public/
    ├── .env.local        # Frontend environment variables
    ├── vite.config.js    # Vite config with proxy to backend
    └── package.json
```

## License

MIT
