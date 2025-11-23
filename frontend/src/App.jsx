import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useThemeStore } from './store/themeStore';
import { useToastStore } from './store/toastStore';
import CandidateRoutes from './routes/CandidateRoutes';
import RecruiterRoutes from './routes/RecruiterRoutes';
import AdminRoutes from './routes/AdminRoutes';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { ToastContainer } from './components/ui/Toast';

function App() {
  const { theme } = useThemeStore();
  const { toasts, removeToast } = useToastStore();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/*" element={<CandidateRoutes />} />
        <Route path="/recruiter/*" element={<RecruiterRoutes />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ErrorBoundary>
  );
}

export default App;
