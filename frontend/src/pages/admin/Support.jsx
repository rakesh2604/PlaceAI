import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, CheckCircle2, Clock, XCircle, Search } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { useAuthStore } from '../../store/authStore';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ThemeToggle from '../../components/ui/ThemeToggle';
import Modal from '../../components/ui/Modal';
import { Link } from 'react-router-dom';

export default function AdminSupport() {
  const { logout } = useAuthStore();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    loadTickets();
  }, [filter]);

  const loadTickets = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await adminApi.getSupportTickets(params);
      setTickets(response.data.tickets || []);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (ticketId, status) => {
    try {
      await adminApi.updateTicketStatus(ticketId, status, adminNotes);
      setSelectedTicket(null);
      setAdminNotes('');
      loadTickets();
    } catch (error) {
      console.error('Error updating ticket:', error);
      alert('Failed to update ticket');
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      ticket.email?.toLowerCase().includes(searchLower) ||
      ticket.subject?.toLowerCase().includes(searchLower) ||
      ticket.message?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'in-progress':
        return <Clock className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900">
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 glass-strong border-b border-dark-200/50 dark:border-dark-700/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-6">
              <Link to="/admin/dashboard" className="text-2xl font-display font-bold gradient-text">
                Admin Panel
              </Link>
              <nav className="hidden md:flex items-center gap-4">
                <Link to="/admin/dashboard" className="text-dark-700 dark:text-dark-300 hover:text-primary-600 font-medium">Dashboard</Link>
                <Link to="/admin/users" className="text-dark-700 dark:text-dark-300 hover:text-primary-600 font-medium">Users</Link>
                <Link to="/admin/interviews" className="text-dark-700 dark:text-dark-300 hover:text-primary-600 font-medium">Interviews</Link>
                <Link to="/admin/payments" className="text-dark-700 dark:text-dark-300 hover:text-primary-600 font-medium">Payments</Link>
                <Link to="/admin/ats-scores" className="text-dark-700 dark:text-dark-300 hover:text-primary-600 font-medium">ATS Scores</Link>
                <Link to="/admin/usage" className="text-dark-700 dark:text-dark-300 hover:text-primary-600 font-medium">Usage</Link>
                <Link to="/admin/support" className="text-primary-600 dark:text-primary-400 font-medium">Support</Link>
                <Link to="/admin/settings" className="text-dark-700 dark:text-dark-300 hover:text-primary-600 font-medium">Settings</Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-manrope font-bold text-dark-900 dark:text-dark-100 mb-2">
            Support Tickets
          </h1>
          <p className="text-dark-600 dark:text-dark-400">
            Manage customer support requests
          </p>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={Search}
            />
          </div>
          <div className="flex gap-2">
            {['all', 'open', 'in-progress', 'resolved', 'closed'].map((status) => (
              <Button
                key={status}
                variant={filter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          {filteredTickets.length === 0 ? (
            <Card className="p-12 text-center">
              <MessageSquare className="w-16 h-16 mx-auto text-dark-400 mb-4" />
              <p className="text-dark-600 dark:text-dark-400">No tickets found</p>
            </Card>
          ) : (
            filteredTickets.map((ticket) => (
              <motion.div
                key={ticket._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge
                          variant={
                            ticket.status === 'resolved' || ticket.status === 'closed' ? 'success' :
                            ticket.status === 'in-progress' ? 'warning' : 'default'
                          }
                        >
                          {getStatusIcon(ticket.status)}
                          <span className="ml-1">{ticket.status}</span>
                        </Badge>
                        <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-100">
                          {ticket.subject}
                        </h3>
                      </div>
                      <p className="text-sm text-dark-600 dark:text-dark-400 mb-2">
                        From: {ticket.name} ({ticket.email})
                        {ticket.userId && ` • User ID: ${ticket.userId._id || ticket.userId}`}
                      </p>
                      <p className="text-dark-700 dark:text-dark-300 whitespace-pre-wrap">
                        {ticket.message}
                      </p>
                      {ticket.adminNotes && (
                        <div className="mt-3 p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                          <p className="text-sm font-semibold text-dark-900 dark:text-dark-100 mb-1">
                            Admin Notes:
                          </p>
                          <p className="text-sm text-dark-700 dark:text-dark-300">
                            {ticket.adminNotes}
                          </p>
                        </div>
                      )}
                      <p className="text-xs text-dark-500 dark:text-dark-500 mt-3">
                        Created: {new Date(ticket.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4 border-t border-dark-200 dark:border-dark-700">
                    {ticket.status !== 'in-progress' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setAdminNotes(ticket.adminNotes || '');
                        }}
                      >
                        Update Status
                      </Button>
                    )}
                    {ticket.status === 'open' && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(ticket._id, 'resolved')}
                      >
                        Mark Resolved
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Update Status Modal */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => {
          setSelectedTicket(null);
          setAdminNotes('');
        }}
        title="Update Ticket Status"
      >
        {selectedTicket && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                Status
              </label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800"
                value={selectedTicket.status}
                onChange={(e) => setSelectedTicket({ ...selectedTicket, status: e.target.value })}
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                Admin Notes
              </label>
              <textarea
                className="w-full px-4 py-2 rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800"
                rows="4"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about this ticket..."
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedTicket(null);
                  setAdminNotes('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleUpdateStatus(selectedTicket._id, selectedTicket.status)}
                className="flex-1"
              >
                Update
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

