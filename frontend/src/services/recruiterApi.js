import api from './api';

export const recruiterAuthApi = {
  register: (email, password, companyName) => 
    api.post('/auth/recruiter/register', { email, password, companyName }),
  login: (email, password) => 
    api.post('/auth/recruiter/login', { email, password })
};

export const recruiterApi = {
  getProfile: () => api.get('/recruiter/profile'),
  getJobs: () => api.get('/recruiter/jobs'),
  createJob: (data) => api.post('/recruiter/jobs', data),
  getCandidates: (filters) => api.get('/recruiter/candidates', { params: filters }),
  sendOptInRequest: (candidateId, jobId, message) => 
    api.post('/recruiter/optins/request', { candidateId, jobId, message }),
  getOptIns: () => api.get('/recruiter/optins'),
  getCandidateInterviews: (candidateId) => 
    api.get(`/recruiter/candidates/${candidateId}/interviews`)
};

export const billingApi = {
  getPlans: () => api.get('/billing/plans'),
  createCheckoutSession: (planId) => api.post('/billing/create-checkout-session', { planId }),
  getHistory: () => api.get('/billing/history')
};

