import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const response = await adminApi.getPayments();
      setPayments(response.data.payments || []);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-manrope font-bold text-dark-900 dark:text-dark-100 mb-2">
            Payment History
          </h1>
          <p className="text-dark-600 dark:text-dark-400">
            View all payment transactions
          </p>
        </div>

        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-200 dark:border-dark-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold">User</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Plan</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id} className="border-b border-dark-200 dark:border-dark-700 hover:bg-dark-50 dark:hover:bg-dark-800/50">
                    <td className="py-4 px-4 text-dark-900 dark:text-dark-100">
                      {payment.userId?.email || payment.recruiterId?.companyName || 'N/A'}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-dark-700 dark:text-dark-300 capitalize">{payment.planType || 'N/A'}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-dark-900 dark:text-dark-100">₹{payment.amount || 0}</span>
                    </td>
                    <td className="py-4 px-4">
                      {payment.status === 'completed' ? (
                        <Badge variant="success">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      ) : payment.status === 'pending' ? (
                        <Badge variant="warning">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      ) : (
                        <Badge variant="danger">
                          <XCircle className="w-3 h-3 mr-1" />
                          Failed
                        </Badge>
                      )}
                    </td>
                    <td className="py-4 px-4 text-sm text-dark-600 dark:text-dark-400">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

