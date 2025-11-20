# PlacedAI End-to-End Test Suite

Comprehensive test suite for the PlacedAI MERN application covering all major modules and edge cases.

## Setup

1. Install test dependencies:
```bash
cd tests
npm install
```

2. Ensure backend and frontend are running:
```bash
# From project root
npm run dev
```

3. Configure test environment variables in `tests/config/test-config.js` or set:
- `API_BASE_URL` (default: http://localhost:5000/api)
- `FRONTEND_URL` (default: http://localhost:5173)
- `JWT_SECRET` (should match backend)
- `STRIPE_WEBHOOK_SECRET` (for payment tests)

## Running Tests

### Run all tests:
```bash
npm run verify-all
```

Or from project root:
```bash
npm run verify-all
```

### Run individual test suite:
```bash
node -e "import('./suites/auth.test.js').then(m => m.runAuthTests().then(console.log))"
```

## Test Coverage

### ✅ Automated Tests

1. **Authentication** (9 tests)
   - Signup with OTP
   - Login with OTP
   - Role isolation (candidate, recruiter, admin)
   - Token expiry handling
   - Invalid token rejection

2. **Resume Builder** (11 tests)
   - CRUD operations
   - PDF file upload
   - LinkedIn ZIP import
   - Template import
   - ATS scoring
   - PDF export
   - Large payload handling

3. **AI Interview Engine** (10 tests)
   - Interview start/begin
   - Answer saving
   - Transcript chunk upload
   - WebSocket connection
   - Behavior streaming
   - Evaluation job polling

4. **Judge Panel** (6 tests)
   - Individual judge evaluations
   - Aggregated evaluations
   - Weighted scoring
   - Role-based access

5. **Recruiter CRM** (9 tests)
   - Recruiter login
   - Job creation
   - Candidate browsing
   - Opt-in requests
   - Interview access

6. **Admin Panel** (11 tests)
   - User management
   - Recruiter approval
   - Interview management
   - Payment tracking
   - Dashboard stats
   - Usage analytics

7. **Payment System** (7 tests)
   - Checkout session creation
   - Stripe webhook signature verification
   - Billing history
   - Invalid signature rejection

8. **Routing/UI** (6 tests)
   - Page navigation
   - Protected routes
   - 404 handling
   - Route redirects

9. **Job Queue** (5 tests)
   - Parsing job polling
   - Render job polling
   - ATS job polling
   - Progress tracking
   - Concurrent jobs

10. **Edge Cases** (10 tests)
    - Token expiry
    - Network dropout simulation
    - Large payloads (10k+ chars)
    - Invalid inputs
    - Injection attacks
    - Concurrent requests

## Test Results

Tests output results in a formatted table showing:
- Module name
- Test name
- Pass/Fail status
- Duration
- Error messages (if any)

A summary report is generated at the end showing:
- Module coverage statistics
- Overall pass/fail rates
- Covered features
- Manual tests required

## Manual Tests Required

The following areas require manual testing:

- Visual UI/UX testing
- Cross-browser compatibility
- Mobile responsiveness
- Accessibility testing
- Performance testing
- Security penetration testing
- Email delivery verification
- WhatsApp integration
- Real Stripe payment flow
- Large file uploads (>10MB)
- WebSocket reconnection
- Multi-language support
- Load/stress testing

## Troubleshooting

### Tests failing with connection errors:
- Ensure backend is running on port 5000
- Ensure frontend is running on port 5173
- Check MongoDB connection

### Authentication tests failing:
- Check JWT_SECRET matches backend
- Verify OTP email service is configured (or using mock mode)

### WebSocket tests failing:
- Ensure Socket.IO server is running
- Check CORS configuration

### Payment tests failing:
- Stripe webhook secret may not be configured
- Tests will pass with mock mode

## Test Structure

```
tests/
├── config/
│   └── test-config.js       # Test configuration
├── utils/
│   ├── api-client.js         # API client for making requests
│   └── test-helpers.js       # Helper functions
├── suites/
│   ├── auth.test.js          # Authentication tests
│   ├── resume-builder.test.js # Resume builder tests
│   ├── interview.test.js     # Interview engine tests
│   ├── judge-panel.test.js   # Judge panel tests
│   ├── recruiter-crm.test.js # Recruiter CRM tests
│   ├── admin-panel.test.js   # Admin panel tests
│   ├── payment.test.js       # Payment system tests
│   ├── routing-ui.test.js    # Routing/UI tests
│   ├── job-queue.test.js     # Job queue tests
│   └── edge-cases.test.js   # Edge case tests
├── test-runner.js            # Main test runner
└── package.json              # Test dependencies
```

## Notes

- Tests use mock data and may require database seeding
- Some tests may fail if services (email, WhatsApp, Stripe) are not configured
- Tests are designed to be idempotent and can be run multiple times
- Test data is cleaned up automatically or uses unique identifiers

