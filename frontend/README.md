# PlacedAI Frontend

React-based frontend application for PlacedAI platform built with Vite, React Router, TailwindCSS, and Framer Motion.

## Overview

The frontend is a single-page application (SPA) with:
- Email-only authentication (OTP flow)
- Candidate dashboard and features
- Recruiter panel
- Admin dashboard
- Landing page and marketing pages
- Dark mode support

## Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable components
│   │   ├── layout/       # Layout components (Navbar, Footer, etc.)
│   │   ├── sections/     # Section components (MeetPlacedAI, etc.)
│   │   └── ui/           # UI components (Button, Input, Card, etc.)
│   ├── pages/            # Page components
│   │   ├── candidate/    # Candidate pages
│   │   ├── recruiter/    # Recruiter pages
│   │   └── admin/        # Admin pages
│   ├── routes/           # Route definitions
│   ├── services/         # API services
│   ├── store/            # State management (Zustand)
│   └── utils/            # Utilities
├── public/               # Static assets
├── .env.local            # Environment variables
└── vite.config.js        # Vite configuration
```

## Routes

### Candidate Routes (`/`)
- `/` - Landing page
- `/login` - Email login/signup
- `/verify-otp` - OTP verification
- `/onboarding` - Profile completion
- `/dashboard` - Candidate dashboard
- `/jobs` - Job recommendations
- `/interview/:id` - Interview flow
- `/resume` - Resume lab
- `/pricing` - Pricing page
- `/about` - About page

### Recruiter Routes (`/recruiter/*`)
- `/recruiter/login` - Recruiter login
- `/recruiter/register` - Recruiter registration
- `/recruiter/dashboard` - Recruiter dashboard
- `/recruiter/candidates` - Browse candidates
- `/recruiter/jobs` - Manage jobs
- `/recruiter/billing` - Billing and plans

### Admin Routes (`/admin/*`)
- `/admin/login` - Admin login
- `/admin/dashboard` - Admin dashboard
- `/admin/users` - User management
- `/admin/payments` - Payment management
- `/admin/interviews` - Interview management

## API Client

All API calls use the centralized API client at `src/services/api.js`:

```javascript
import api from './services/api';

// Health check
import { testConnection } from './services/api';

// Auth API
import { authApi } from './services/candidateApi';
```

**Important**: Never use hardcoded URLs like `http://localhost:5000`. Always use the `api` client or service functions.

### API Client Configuration

- Base URL: Set via `VITE_API_BASE_URL` environment variable (defaults to `/api`)
- Development: Uses Vite proxy to forward `/api/*` to `http://localhost:5000/api/*`
- Production: Set `VITE_API_BASE_URL` to your production API URL

### Health Check

The auth screen (`OnboardingEmail.jsx`) performs a health check on mount:

```javascript
import { testConnection } from '../../services/api';

// On mount
const result = await testConnection();
if (!result.connected && result.isNetworkError) {
  // Show "Backend server is not reachable"
}
```

The "Backend server is not reachable" message **only** appears when:
- Health check fails (network error, server error)
- NOT for validation errors, wrong OTP, etc.

## Authentication Flow

1. User enters email on `/login` (OnboardingEmail component)
2. Component calls `/api/auth/send-otp` via `authApi.sendOTP(email)`
3. User is redirected to `/verify-otp` with email in state
4. User enters OTP
5. Component calls `/api/auth/verify-otp` via `authApi.verifyOTP(email, otp)`
6. On success, JWT token is stored and user is redirected

## Theme Configuration

The app supports light and dark modes. Theme is managed via Zustand store (`store/themeStore.js`).

### Dark Mode Background

The landing page and key sections use a consistent dark mode background:
- `dark:from-dark-900 dark:via-dark-800 dark:to-dark-900` - Deep gradient
- Subtle radial gradients and grid patterns for texture

### Changing Theme

Theme toggle is available in the navbar. Theme preference is persisted in localStorage.

## State Management

Uses Zustand for state management:

- `authStore.js` - Authentication state (user, token)
- `themeStore.js` - Theme state (light/dark)

## Styling

- **TailwindCSS** for utility-first styling
- **Custom theme colors** defined in `tailwind.config.js`
- **Framer Motion** for animations
- **Glassmorphism effects** for modern UI

## Environment Variables

Create `frontend/.env.local`:

**Development:**
```env
VITE_API_BASE_URL=/api
```

**Production:**
```env
VITE_API_BASE_URL=https://<BACKEND_DOMAIN>/api
```

## Running the Frontend

### Development

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

### Production Build

```bash
cd frontend
npm run build
```

Build output is in `frontend/dist/`

## Vite Proxy Configuration

The `vite.config.js` includes a proxy for development:

```javascript
server: {
  proxy: {
    '/api': 'http://localhost:5000'
  }
}
```

This forwards all `/api/*` requests to the backend during development, avoiding CORS issues.

## Key Components

### MeetPlacedAI

The "Meet PlacedAI" section on the landing page:
- Clean grid layout with 6 feature cards
- No circular/orb background (removed as per requirements)
- Hover effects and animations
- Responsive design

### About Page

Complete About page with sections:
- Who we are
- Our mission
- Our story
- Our work culture
- What we believe in

## Troubleshooting

### "Backend server is not reachable" appears incorrectly

1. Check that backend is running on port 5000
2. Verify `vite.config.js` has proxy configured
3. Check browser console for network errors
4. Ensure health check endpoint `/api/health` is accessible

### API calls failing

1. Ensure all API calls use the `api` client from `services/api.js`
2. Never use hardcoded URLs
3. Check `VITE_API_BASE_URL` environment variable
4. In development, verify Vite proxy is working

### Dark mode not working

1. Check `themeStore.js` is properly initialized
2. Verify Tailwind dark mode classes are applied
3. Check browser console for errors

