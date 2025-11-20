import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import AdminSidebar from './AdminSidebar';
import ThemeToggle from '../ui/ThemeToggle';
import Button from '../ui/Button';
import { LogOut, Bell, Search } from 'lucide-react';

export default function AdminLayout() {
  const { user, token, logout } = useAuthStore();

  // Admin guard - redirect if not admin
  if (!token || !user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#000814] flex">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-50 border-b border-dark-200 dark:border-[#003566] bg-white dark:bg-[#001D3D]">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <Search className="w-5 h-5 text-dark-400 dark:text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="flex-1 bg-transparent border-none outline-none text-dark-900 dark:text-[#F8F9FA] placeholder:text-dark-400 dark:placeholder:text-[#94A3B8]"
                />
              </div>
              <div className="flex items-center gap-4">
                <button className="relative p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-[#003566] transition-colors">
                  <Bell className="w-5 h-5 text-dark-600 dark:text-[#CBD5E1]" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>
                <ThemeToggle />
                <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-dark-100 dark:bg-[#003566]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                    {user.email?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-dark-900 dark:text-[#F8F9FA]">
                      {user.email}
                    </p>
                    <p className="text-xs text-dark-500 dark:text-[#94A3B8]">Admin</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={logout} className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
