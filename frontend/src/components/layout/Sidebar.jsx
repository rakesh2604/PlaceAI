import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Briefcase,
  FileCheck,
  Video,
  Settings,
  X,
  Menu
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const menuItems = [
  { icon: FileText, label: 'Resume Lab', path: '/dashboard/resume-lab' },
  { icon: FileCheck, label: 'Resume Builder', path: '/dashboard/resume-builder' },
  { icon: Briefcase, label: 'Job Listings', path: '/dashboard/jobs' },
  { icon: FileText, label: 'Applications', path: '/dashboard/applications' },
  { icon: Video, label: 'Mock Interviews', path: '/dashboard/mock-interviews' },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
];

// Add Dashboard link to logo click

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const { user } = useAuthStore();

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-20 left-4 z-50 p-2 rounded-lg bg-dark-800 dark:bg-dark-700 md:hidden"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static top-0 left-0 z-40
          w-64 bg-[#001D3D] border-r border-[#003566] 
          min-h-screen h-screen
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Logo/Brand */}
        <Link to="/dashboard" className="block p-6 border-b border-[#003566]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#F8F9FA]">PlacedAI</h2>
            </div>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            {user?.name || user?.email?.split('@')[0] || 'User'}
          </p>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
                           (item.path === '/dashboard' && location.pathname === '/dashboard');
            
            return (
              <Link 
                key={item.path} 
                to={item.path}
                onClick={() => setSidebarOpen(false)}
              >
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-1
                    ${isActive
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-[#CBD5E1] hover:bg-[#003566] hover:text-[#F8F9FA]'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium text-sm">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}

