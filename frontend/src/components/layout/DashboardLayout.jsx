import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import NavbarCandidate from './NavbarCandidate';
import Sidebar from './Sidebar';
import { useAuthStore } from '../../store/authStore';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, token } = useAuthStore();
  const location = useLocation();

  // Redirect to login if not authenticated
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Profile completion checks are now handled in individual pages with modal prompts
  // No aggressive redirects - users can browse dashboard freely

  return (
    <div className="min-h-screen bg-white dark:bg-[#000814]">
      <NavbarCandidate />
      <div className="flex">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

