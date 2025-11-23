import api from './api';

export const adminApi = {
  getUsers: (params) => api.get('/admin/users', { params }),
  getRecruiters: () => api.get('/admin/recruiters'),
  updateRecruiterStatus: (id, isApproved) => 
    api.patch(`/admin/recruiters/${id}/status`, { isApproved }),
  getInterviews: (params) => api.get('/admin/interviews', { params }),
  getPayments: () => api.get('/admin/payments'),
  getStats: () => api.get('/admin/stats'),
  createJob: (data) => api.post('/admin/jobs', data),
  blockUser: (id, isBlocked) => api.patch(`/admin/users/${id}/block`, { isBlocked }),
  getATSScores: () => api.get('/admin/ats-scores'),
  approvePremium: (id, isPremium) => api.patch(`/admin/users/${id}/premium`, { isPremium }),
  getSupportTickets: (params) => api.get('/admin/support-tickets', { params }),
  updateTicketStatus: (id, status, adminNotes) => 
    api.patch(`/admin/support-tickets/${id}/status`, { status, adminNotes }),
  getUsage: () => api.get('/admin/usage'),
  updateUserPlan: (id, planId) => api.patch(`/admin/users/${id}/plan`, { planId }),
  createAdmin: (data) => api.post('/admin/create', data),
  resetPassword: (oldPassword, newPassword) => 
    api.post('/admin/reset-password', { oldPassword, newPassword })
};

