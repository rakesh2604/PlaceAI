import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import PageTransition from '../components/layout/PageTransition';
import RecruiterLogin from '../pages/recruiter/Login';
import RecruiterRegister from '../pages/recruiter/Register';
import RecruiterDashboard from '../pages/recruiter/Dashboard';
import RecruiterJobs from '../pages/recruiter/Jobs';
import RecruiterCandidates from '../pages/recruiter/Candidates';
import RecruiterOptIns from '../pages/recruiter/OptIns';
import RecruiterBilling from '../pages/recruiter/Billing';

function RecruiterRoutes() {
  const { user, token } = useAuthStore();
  const location = useLocation();

  const ProtectedRoute = ({ children }) => {
    if (!token || !user || user.role !== 'recruiter') {
      return <Navigate to="/recruiter/login" replace />;
    }
    return children;
  };

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/login"
            element={
              token && user?.role === 'recruiter' ? (
                <Navigate to="/recruiter/dashboard" />
              ) : (
                <PageTransition>
                  <RecruiterLogin />
                </PageTransition>
              )
            }
          />
          <Route
            path="/register"
            element={
              token && user?.role === 'recruiter' ? (
                <Navigate to="/recruiter/dashboard" />
              ) : (
                <PageTransition>
                  <RecruiterRegister />
                </PageTransition>
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <RecruiterDashboard />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <RecruiterJobs />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidates"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <RecruiterCandidates />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/optins"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <RecruiterOptIns />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <RecruiterBilling />
                </PageTransition>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default RecruiterRoutes;

