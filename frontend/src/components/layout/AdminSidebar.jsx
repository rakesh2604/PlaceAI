import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  FileText, 
  MessageSquare, 
  Settings,
  BarChart3,
  Shield,
  Briefcase,
  TrendingUp
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: Briefcase, label: 'Jobs', path: '/admin/jobs' },
  { icon: DollarSign, label: 'Payments', path: '/admin/payments' },
  { icon: FileText, label: 'ATS Scores', path: '/admin/ats-scores' },
  { icon: MessageSquare, label: 'Interviews', path: '/admin/interviews' },
  { icon: BarChart3, label: 'Usage', path: '/admin/usage' },
  { icon: Shield, label: 'Support', path: '/admin/support' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

export default function AdminSidebar() {
  const location = useLocation();
  const { user } = useAuthStore();

  return (
    <aside className="w-64 bg-[#001D3D] border-r border-[#003566] min-h-screen sticky top-0 flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-[#003566]">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#F8F9FA]">Admin Panel</h2>
          </div>
        </div>
        <p className="text-xs text-[#94A3B8] mt-1">
          {user?.email}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-[#CBD5E1] hover:bg-[#003566] hover:text-[#F8F9FA]'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium text-sm">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#003566]">
        <div className="p-3 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border border-cyan-500/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-cyan-400">System Status</span>
          </div>
          <p className="text-xs text-[#CBD5E1]">
            All systems operational
          </p>
        </div>
      </div>
    </aside>
  );
}
