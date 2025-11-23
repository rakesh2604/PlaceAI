# PlacedAI - AI-Powered Placement Preparation Platform

**PlacedAI** is a comprehensive SaaS platform designed to help Indian students crack campus placements through AI-powered mock interviews, ATS resume scoring, personalized job recommendations, and real-time feedback.

## 📋 Overview

PlacedAI democratizes access to quality placement preparation by providing students from any college (IIT, NIT, or Tier-3) with the same high-quality AI-powered tools. Our platform includes:

- **AI-Powered Mock Interviews**: Practice with AI that simulates real interview scenarios with video/audio recording
- **ATS Resume Scoring**: Optimize your resume for Applicant Tracking Systems with detailed feedback
- **Resume Builder**: Create professional resumes with AI-powered suggestions and templates
- **Resume Lab**: Upload and analyze existing resumes for improvements
- **Personalized Job Recommendations**: Get matched with roles that fit your profile and skills
- **Real-time AI Feedback**: Receive instant feedback on interview performance with detailed analytics
- **Admin Management System**: Comprehensive admin dashboard for platform management
- **Recruiter CRM**: Browse candidates, send opt-in requests, and manage job postings

## 🚀 Tech Stack

### Backend

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens), Google OAuth2
- **File Uploads**: Multer
- **Password Hashing**: Bcrypt.js
- **Email**: Nodemailer (SMTP)
- **WhatsApp**: Twilio
- **Payments**: Stripe
- **AI Integration**: OpenAI-compatible API
- **WebSockets**: Socket.IO (for real-time features)
- **PDF Processing**: pdf-parse, puppeteer
- **Resume Parsing**: Custom parsers for PDF, DOC, DOCX

### Frontend

- **Framework**: React 18 with Vite
- **Routing**: React Router v6
- **State Management**: Zustand
- **Styling**: TailwindCSS with custom theme
- **UI Components**: Custom component library (inspired by shadcn/ui patterns)
- **Animations**: Framer Motion
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Phone Input**: react-phone-number-input
- **Build Tool**: Vite 5

## ✨ Features

### User Authentication & Profile

- **Email OTP Authentication**: Secure login with one-time password sent via email
- **Google Sign-In**: OAuth2 authentication with Google
- **Profile Completion System**: Guided onboarding with resume upload and skill selection
- **Phone Verification**: International phone number support with validation
- **Role Selection**: Choose target job roles and required skills
- **Plan Management**: Free, Premium, and Enterprise tiers with usage limits

### Resume Features

- **Resume Upload**: Support for PDF, DOC, DOCX formats
- **Automatic Parsing**: Extract skills, experience, education automatically
- **Resume Builder**: Create resumes with multiple templates
- **ATS Scoring**: Get detailed ATS compatibility scores with improvement suggestions
- **Resume Templates**: Professional templates for different industries
- **Resume Export**: Generate PDF versions of resumes

### AI Interview System

- **Mock Interviews**: Practice interviews for specific job roles
- **Video/Audio Recording**: Record responses during interviews
- **Real-time Transcription**: Live transcript streaming during interviews
- **AI Scoring**: Get scored on communication, confidence, technical knowledge, and more
- **Detailed Feedback**: Receive strengths, improvements, and detailed analytics
- **Interview History**: Track all past interviews and performance trends
- **Shareable Results**: Share interview feedback with mentors and peers

### Job Recommendations

- **Personalized Matching**: AI-powered job recommendations based on profile
- **Job Applications**: Apply to jobs directly through the platform
- **Application Tracking**: Track all job applications in one place
- **Role-Based Matching**: Match based on selected role and skills

### Admin Panel

- **User Management**: View, block, and manage all users
- **Recruiter Management**: Approve/deny recruiter requests
- **Interview Analytics**: View all interviews and AI scores
- **Payment Tracking**: Monitor Stripe payments and subscriptions
- **Support Tickets**: Manage customer support tickets
- **Usage Statistics**: Track platform usage and metrics
- **Admin Creation**: Create new admin accounts with role-based access
- **Password Management**: Admins can reset their own passwords

### Recruiter Features

- **Candidate Browsing**: Browse candidate profiles and interview results
- **Opt-In Requests**: Send connection requests to candidates
- **Job Posting**: Create and manage job listings
- **Payment Plans**: Subscribe to Basic, Premium, or Enterprise plans
- **Credit System**: Track opt-in requests and credits usage

## 📁 Project Structure

```
PlacedAI/
├── README.md                    # This file
├── package.json                 # Root package with unified scripts
├── .gitignore                   # Git ignore rules
│
├── backend/                     # Backend API server
│   ├── .env.example            # Backend environment variables template
│   ├── package.json
│   ├── server.js               # Express server entry point
│   │
│   ├── models/                 # Mongoose models
│   │   ├── User.js
│   │   ├── Job.js
│   │   ├── Interview.js
│   │   ├── Recruiter.js
│   │   ├── Payment.js
│   │   └── ...
│   │
│   ├── routes/                 # Express routes (all under /api prefix)
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── jobRoutes.js
│   │   ├── interviewRoutes.js
│   │   ├── adminRoutes.js
│   │   └── ...
│   │
│   ├── middleware/             # Express middleware
│   │   ├── auth.js            # JWT authentication
│   │   ├── idempotency.js     # Request idempotency
│   │   ├── usageCheck.js      # Usage limit checks
│   │   └── validateProfile.js # Profile validation
│   │
│   ├── services/              # Business logic services
│   │   ├── emailService.js    # Email sending (Nodemailer)
│   │   ├── whatsappService.js # WhatsApp (Twilio)
│   │   ├── paymentService.js  # Payments (Stripe)
│   │   └── aiScoringService.js # AI scoring
│   │
│   ├── src/                   # Additional source files
│   │   ├── ai/               # AI integration modules
│   │   │   ├── aiBrain.js
│   │   │   ├── interviewAI.js
│   │   │   ├── resumeAI.js
│   │   │   └── ...
│   │   └── config/           # Configuration files
│   │       └── plans.js      # Subscription plan definitions
│   │
│   ├── utils/                # Utility functions
│   │   ├── resumeParser.js   # Resume parsing logic
│   │   ├── linkedInParser.js # LinkedIn import
│   │   └── templateParser.js # Template parsing
│   │
│   ├── scripts/              # Utility scripts
│   │   └── seed.js          # Database seeding
│   │
│   └── uploads/              # File uploads directory
│       ├── resumes/         # User resumes
│       └── templates/       # Resume templates
│
└── frontend/                 # React frontend application
    ├── .env.example         # Frontend environment variables template
    ├── package.json
    ├── vite.config.js       # Vite configuration with proxy
    ├── tailwind.config.js   # TailwindCSS configuration
    ├── index.html           # HTML entry point
    │
    ├── public/              # Static assets
    │   └── videos/         # Video assets
    │
    └── src/                 # React source code
        ├── main.jsx        # React entry point
        ├── App.jsx         # Root component
        ├── index.css       # Global styles
        │
        ├── components/     # Reusable components
        │   ├── auth/      # Authentication components
        │   ├── layout/    # Layout components (Navbar, Sidebar, etc.)
        │   ├── ui/        # UI components (Button, Input, Card, etc.)
        │   ├── interview/ # Interview-related components
        │   └── resume/    # Resume-related components
        │
        ├── pages/          # Page components
        │   ├── Landing.jsx
        │   ├── candidate/  # Candidate pages
        │   ├── admin/      # Admin pages
        │   ├── recruiter/  # Recruiter pages
        │   └── auth/       # Auth pages
        │
        ├── routes/         # Route definitions
        │   ├── CandidateRoutes.jsx
        │   ├── AdminRoutes.jsx
        │   └── RecruiterRoutes.jsx
        │
        ├── services/       # API service layer
        │   ├── api.js      # Axios instance and interceptors
        │   ├── candidateApi.js
        │   ├── adminApi.js
        │   └── recruiterApi.js
        │
        ├── store/          # Zustand state stores
        │   ├── authStore.js
        │   ├── themeStore.js
        │   └── toastStore.js
        │
        └── utils/          # Utility functions
            ├── cn.js       # Class name utility
            ├── currencyFormatter.js
            ├── networkSimulator.js
            └── speechUtils.js
```

## 🔧 Environment Setup

### Prerequisites

- **Node.js**: v18 or higher
- **MongoDB**: Local installation or MongoDB Atlas account
- **npm** or **yarn**: Package manager
- **Git**: Version control

### Optional Services (Work in Mock Mode)

- **SMTP Email Service**: Gmail, SendGrid, or any SMTP provider (for OTP emails)
- **Twilio Account**: For WhatsApp notifications
- **OpenAI API Key**: For AI-powered features
- **Stripe Account**: For payment processing
- **Google OAuth**: For Google Sign-In

### Backend Environment Variables

1. Copy the environment template:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Edit `backend/.env` and configure the following:

   ```env
   # Server
   PORT=5000
   NODE_ENV=development

   # Database (Required)
   MONGO_URI=mongodb://localhost:27017/placedai
   # Or MongoDB Atlas:
   # MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/placedai

   # Authentication (Required)
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

   # Frontend URL (Required)
   FRONTEND_URL=http://localhost:5173

   # Email Service (Optional - works in mock mode)
   EMAIL_FROM=noreply@placedai.com
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password

   # WhatsApp Service (Optional - works in mock mode)
   TWILIO_ACCOUNT_SID=your-twilio-account-sid
   TWILIO_AUTH_TOKEN=your-twilio-auth-token
   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

   # AI Service (Optional - works in mock mode)
   AI_API_BASE_URL=https://api.openai.com/v1
   AI_API_KEY=your-openai-api-key

   # Stripe Payments (Optional - works in mock mode)
   STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
   STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
   ```

**Important Notes:**
- All services work in **mock mode** if credentials are not provided (perfect for development)
- In mock mode, OTPs are logged to console instead of being emailed
- Generate a strong JWT_SECRET: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- Never commit `.env` files to version control

### Frontend Environment Variables

1. Copy the environment template:
   ```bash
   cd frontend
   cp .env.example .env.local
   ```

2. Edit `frontend/.env.local`:

   **Development:**
   ```env
   VITE_API_BASE_URL=/api
   VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   ```

   **Production:**
   ```env
   VITE_API_BASE_URL=https://api.your-domain.com/api
   VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   ```

**Important Notes:**
- In development, use `/api` (relative path) - Vite proxy will forward to backend
- In production, set full backend URL
- All Vite env variables must be prefixed with `VITE_`

## 🚀 Installation & Running

### Quick Start (Recommended)

Install all dependencies and run both servers with one command:

```bash
# Install all dependencies (root, backend, frontend)
npm run install:all

# Run both backend and frontend together
npm run dev
```

This starts:
- **Backend** on `http://localhost:5000`
- **Frontend** on `http://localhost:5173`

### Manual Installation

**Backend:**
```bash
cd backend
npm install
npm run dev  # Development with nodemon
# OR
npm start    # Production
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev    # Development server
# OR
npm run build  # Production build
npm run preview # Preview production build
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

This creates sample jobs and other test data.

## 🌐 API Configuration

### Development

- Frontend uses **relative paths** (`/api/*`) which are proxied by Vite
- Vite proxy configuration in `frontend/vite.config.js`:
  ```js
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
  ```
- No CORS issues since requests go through same origin

### Production

- Set `VITE_API_BASE_URL` to your production API URL
- Configure CORS on backend to allow your frontend domain
- Example: `VITE_API_BASE_URL=https://api.yourapp.com/api`

## 📡 API Endpoints

All backend routes are prefixed with `/api`:

### Authentication (`/api/auth`)
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP and get JWT
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/google` - Google OAuth authentication
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/recruiter/register` - Register recruiter
- `POST /api/auth/recruiter/login` - Login recruiter

### User Management (`/api/user`)
- `GET /api/user/me` - Get current user profile
- `GET /api/user/profile` - Get detailed profile
- `PATCH /api/user/profile` - Update profile
- `PUT /api/user/basic` - Update basic info (phone, resume, etc.)
- `PUT /api/user/role-skills` - Update selected role and skills
- `POST /api/user/resume` - Upload resume

### Jobs (`/api/jobs`)
- `GET /api/jobs/recommend` - Get personalized job recommendations
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs` - Create job (recruiter/admin)
- `POST /api/jobs/apply` - Apply to job
- `GET /api/jobs/applications` - Get user's applications

### Interviews (`/api/interview`)
- `POST /api/interview/start` - Start new interview
- `POST /api/interview/begin` - Begin interview session
- `POST /api/interview/save-answer` - Save answer to question
- `POST /api/interview/next-question` - Get next question
- `POST /api/interview/finish` - Finish interview and get AI scores
- `POST /api/interview/evaluate` - Evaluate completed interview
- `POST /api/interview/upload-recording` - Upload interview recording
- `GET /api/interview/my` - Get user's interviews
- `GET /api/interview/:id` - Get interview details

### Resume & ATS (`/api/resume`)
- `POST /api/resume/analyze` - Analyze resume and extract data
- `POST /api/resume/ats-score` - Get ATS compatibility score

### Admin (`/api/admin`)
- `POST /api/admin/create` - Create new admin (admin only)
- `POST /api/admin/reset-password` - Reset admin password
- `GET /api/admin/users` - Get all users
- `GET /api/admin/recruiters` - Get all recruiters
- `GET /api/admin/interviews` - Get all interviews
- `GET /api/admin/payments` - Get all payments
- `GET /api/admin/stats` - Get dashboard statistics
- `PATCH /api/admin/users/:id/block` - Block/unblock user
- `PATCH /api/admin/users/:id/premium` - Update premium status
- `PATCH /api/admin/users/:id/plan` - Update user plan

### Recruiter (`/api/recruiter`)
- `GET /api/recruiter/profile` - Get recruiter profile
- `GET /api/recruiter/jobs` - Get recruiter's jobs
- `POST /api/recruiter/jobs` - Create job
- `GET /api/recruiter/candidates` - Browse candidates
- `POST /api/recruiter/optins/request` - Send opt-in request
- `GET /api/recruiter/optins` - Get opt-in activity

### Billing (`/api/billing`)
- `GET /api/billing/plans` - Get available plans
- `POST /api/billing/create-checkout-session` - Create Stripe checkout
- `POST /api/billing/webhook` - Stripe webhook handler
- `GET /api/billing/history` - Get billing history

### Health Check
- `GET /api/health` - Health check endpoint

## 🚢 Deployment Guide

### Backend Deployment

1. **Set Environment Variables:**
   - Set all required environment variables in your hosting platform
   - Use production values for `MONGO_URI`, `JWT_SECRET`, etc.
   - Configure `FRONTEND_URL` to your production frontend URL

2. **Build & Start:**
   ```bash
   cd backend
   npm install --production
   npm start
   ```

3. **Recommended Hosting:**
   - **Railway**: Easy deployment with automatic environment variables
   - **Render**: Free tier available, automatic deploys from Git
   - **Heroku**: Traditional PaaS (paid plans available)
   - **DigitalOcean App Platform**: Simple deployments
   - **AWS Elastic Beanstalk**: Enterprise-grade hosting

4. **Process Manager (Optional):**
   ```bash
   # Install PM2
   npm install -g pm2

   # Start with PM2
   pm2 start server.js --name placedai-backend

   # Auto-restart on server reboot
   pm2 startup
   pm2 save
   ```

### Frontend Deployment

1. **Build Production Bundle:**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Set Environment Variables:**
   - Set `VITE_API_BASE_URL` to your production backend URL
   - Build must happen with correct env variables

3. **Deploy `dist/` folder:**
   - **Vercel**: Connect GitHub repo, auto-deploys on push
   - **Netlify**: Drag & drop `dist/` folder or connect repo
   - **Cloudflare Pages**: Fast CDN, free tier
   - **AWS S3 + CloudFront**: Static hosting with CDN
   - **GitHub Pages**: Free hosting for static sites

4. **Configure Routing:**
   - For SPAs, configure redirect rules:
     - **Vercel**: Create `vercel.json` with rewrites
     - **Netlify**: Create `netlify.toml` with redirects
     - **Nginx**: Configure try_files directive

### MongoDB Atlas Setup

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Create database user
4. Whitelist your IP address (or use `0.0.0.0/0` for all IPs)
5. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/placedai`
6. Set `MONGO_URI` in backend environment variables

### CORS Configuration

Backend CORS is configured in `backend/server.js`:

```js
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

Ensure `FRONTEND_URL` matches your production frontend domain.

### Stripe Webhook Setup

1. **Create Webhook Endpoint in Stripe Dashboard:**
   - URL: `https://your-backend.com/api/billing/webhook`
   - Events: `checkout.session.completed`

2. **Get Webhook Secret:**
   - Copy signing secret from Stripe Dashboard
   - Set as `STRIPE_WEBHOOK_SECRET` in backend env

3. **Local Testing (Optional):**
   ```bash
   # Install Stripe CLI
   stripe listen --forward-to localhost:5000/api/billing/webhook
   ```

## 🛠️ Development Workflow

### Running in Development

```bash
# From root directory
npm run dev
```

This runs:
- Backend with nodemon (auto-restart on file changes)
- Frontend with Vite (hot module replacement)

### Project Scripts

**Root:**
- `npm run dev` - Run both backend and frontend
- `npm run install:all` - Install dependencies for all packages
- `npm run build` - Build frontend for production
- `npm run seed` - Seed database with sample data

**Backend:**
- `npm run dev` - Development with nodemon
- `npm start` - Production mode
- `npm run seed` - Seed database

**Frontend:**
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run preview` - Preview production build

## 🔒 Security Notes

- **JWT Tokens**: 7-day expiration, stored in localStorage
- **Password Hashing**: Bcrypt with salt rounds
- **API Validation**: Express-validator for all inputs
- **CORS**: Configured for specific origins
- **Environment Variables**: Never committed to Git
- **File Uploads**: Validated file types and sizes
- **Rate Limiting**: Idempotency keys for duplicate request prevention
- **Role-Based Access**: Admin routes protected with middleware

## 📝 Important Notes

- **Mock Mode**: All services (email, WhatsApp, AI, payments) work without credentials in development
- **Health Check**: Frontend checks `/api/health` on auth screen mount
- **Relative Paths**: Frontend uses `/api/*` which works in both dev and production
- **File Storage**: Uploads stored locally (can be moved to S3/cloud storage)
- **AI Provider**: OpenAI-compatible API (can swap for other providers)
- **Database**: MongoDB with Mongoose ODM

## 🐛 Troubleshooting

### Backend Won't Start

- Check MongoDB connection: Ensure MongoDB is running or `MONGO_URI` is correct
- Verify `JWT_SECRET` is set
- Check port 5000 is available

### Frontend Can't Connect to Backend

- Ensure backend is running on port 5000
- Check `VITE_API_BASE_URL` is set to `/api` in development
- Verify Vite proxy is configured in `vite.config.js`
- Check browser console for CORS errors

### OTP Not Received

- Check email service configuration (or check console for mock OTP)
- Verify SMTP credentials are correct
- Check spam folder

### Build Errors

- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf frontend/node_modules/.vite`
- Check Node.js version (requires v18+)

## 📄 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ for Indian students preparing for placements**
