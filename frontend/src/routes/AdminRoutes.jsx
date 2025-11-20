import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import PageTransition from '../components/layout/PageTransition';
import AdminLayout from '../components/layout/AdminLayout';
import AdminLogin from '../pages/admin/Login';
import AdminDashboard from '../pages/admin/Dashboard';
import AdminUsers from '../pages/admin/Users';
import AdminPayments from '../pages/admin/Payments';
import AdminATSScores from '../pages/admin/ATSScores';
import AdminInterviews from '../pages/admin/Interviews';
import AdminUsage from '../pages/admin/Usage';
import AdminSupport from '../pages/admin/Support';
import AdminSettings from '../pages/admin/Settings';
import AdminJobs from '../pages/admin/Jobs';

function AdminRoutes() {
  const { user, token } = useAuthStore();
  const location = useLocation();

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/login"
            element={
              token && user?.role === 'admin' ? (
                <Navigate to="/admin/dashboard" />
              ) : (
                <PageTransition>
                  <AdminLogin />
                </PageTransition>
              )
            }
          />
          <Route path="/*" element={<AdminLayout />}>
            <Route
              path="dashboard"
              element={
                <PageTransition>
                  <AdminDashboard />
                </PageTransition>
              }
            />
            <Route
              path="users"
              element={
                <PageTransition>
                  <AdminUsers />
                </PageTransition>
              }
            />
            <Route
              path="jobs"
              element={
                <PageTransition>
                  <AdminJobs />
                </PageTransition>
              }
            />
            <Route
              path="payments"
              element={
                <PageTransition>
                  <AdminPayments />
                </PageTransition>
              }
            />
            <Route
              path="ats-scores"
              element={
                <PageTransition>
                  <AdminATSScores />
                </PageTransition>
              }
            />
            <Route
              path="interviews"
              element={
                <PageTransition>
                  <AdminInterviews />
                </PageTransition>
              }
            />
            <Route
              path="usage"
              element={
                <PageTransition>
                  <AdminUsage />
                </PageTransition>
              }
            />
            <Route
              path="support"
              element={
                <PageTransition>
                  <AdminSupport />
                </PageTransition>
              }
            />
            <Route
              path="settings"
              element={
                <PageTransition>
                  <AdminSettings />
                </PageTransition>
              }
            />
            <Route
              path=""
              element={<Navigate to="/admin/dashboard" replace />}
            />
          </Route>
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default AdminRoutes;

