import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import NavbarCandidate from '../components/layout/NavbarCandidate';
import PageTransition from '../components/layout/PageTransition';
import Landing from '../pages/Landing';
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
import OnboardingOtp from '../pages/candidate/OnboardingOtp';
import OnboardingDetails from '../pages/candidate/OnboardingDetails';
import JobRecommendations from '../pages/candidate/JobRecommendations';
import SelectRoleSkills from '../pages/candidate/SelectRoleSkills';
import InterviewIntro from '../pages/candidate/InterviewIntro';
import InterviewLive from '../pages/candidate/InterviewLive';
import InterviewLiveNew from '../pages/candidate/InterviewLiveNew';
import InterviewResult from '../pages/candidate/InterviewResult';
import Dashboard from '../pages/candidate/Dashboard';
import DashboardInterviews from '../pages/candidate/DashboardInterviews';
import DashboardOptIns from '../pages/candidate/DashboardOptIns';
import ResumeLab from '../pages/candidate/ResumeLab';
import ResumeBuilder from '../pages/candidate/ResumeBuilder';
import Pricing from '../pages/Pricing';
import PricingSuccess from '../pages/PricingSuccess';
import PricingFailed from '../pages/PricingFailed';
import About from '../pages/About';
import Contact from '../pages/Contact';
import Usage from '../pages/candidate/Usage';
import Terms from '../pages/Terms';
import Privacy from '../pages/Privacy';
import Refund from '../pages/Refund';
import Cookies from '../pages/Cookies';
import Careers from '../pages/Careers';
import Blog from '../pages/Blog';
import NotFound from '../pages/NotFound';
import AllTest from '../pages/allTest';

function CandidateRoutes() {
  const { user, token } = useAuthStore();
  const location = useLocation();

  const ProtectedRoute = ({ children }) => {
    if (!token || !user) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  const showNavbar = 
    location.pathname !== '/' && 
    location.pathname !== '/verify-otp' && 
    location.pathname !== '/login' &&
    location.pathname !== '/signup';

  return (
    <div className="min-h-screen">
      {showNavbar && <NavbarCandidate />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <PageTransition>
                {token && user ? <Navigate to="/dashboard" replace /> : <Landing />}
              </PageTransition>
            }
          />
          <Route
            path="/login"
            element={
              <PageTransition>
                {token && user ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <LoginPage />
                )}
              </PageTransition>
            }
          />
          <Route
            path="/signup"
            element={
              <PageTransition>
                {token && user ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <SignupPage />
                )}
              </PageTransition>
            }
          />
          <Route
            path="/verify-otp"
            element={
              <PageTransition>
                <OnboardingOtp />
              </PageTransition>
            }
          />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <OnboardingDetails />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <JobRecommendations />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/select-role"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <SelectRoleSkills />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview/intro"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <InterviewIntro />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview/live"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <InterviewLive />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview/live-new"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <InterviewLiveNew />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview/result/:id"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <InterviewResult />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <Dashboard />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/interviews"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <DashboardInterviews />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/optins"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <DashboardOptIns />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/resume-lab"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <ResumeLab />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/resume-builder"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <ResumeBuilder />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pricing"
            element={
              <PageTransition>
                <Pricing />
              </PageTransition>
            }
          />
          <Route
            path="/pricing/success"
            element={
              <PageTransition>
                <PricingSuccess />
              </PageTransition>
            }
          />
          <Route
            path="/pricing/failed"
            element={
              <PageTransition>
                <PricingFailed />
              </PageTransition>
            }
          />
          <Route
            path="/about"
            element={
              <PageTransition>
                <About />
              </PageTransition>
            }
          />
          <Route
            path="/contact"
            element={
              <PageTransition>
                <Contact />
              </PageTransition>
            }
          />
          <Route
            path="/usage"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <Usage />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/terms"
            element={
              <PageTransition>
                <Terms />
              </PageTransition>
            }
          />
          <Route
            path="/privacy"
            element={
              <PageTransition>
                <Privacy />
              </PageTransition>
            }
          />
          <Route
            path="/refund"
            element={
              <PageTransition>
                <Refund />
              </PageTransition>
            }
          />
          <Route
            path="/cookies"
            element={
              <PageTransition>
                <Cookies />
              </PageTransition>
            }
          />
          <Route
            path="/careers"
            element={
              <PageTransition>
                <Careers />
              </PageTransition>
            }
          />
          <Route
            path="/blog"
            element={
              <PageTransition>
                <Blog />
              </PageTransition>
            }
          />
          <Route
            path="/allTest"
            element={
              <PageTransition>
                <AllTest />
              </PageTransition>
            }
          />
          <Route
            path="*"
            element={
              <PageTransition>
                <NotFound />
              </PageTransition>
            }
          />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default CandidateRoutes;

