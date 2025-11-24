import api from './api';

export const authApi = {
  register: (name, email, password) => 
    api.post('/auth/register', { name, email, password }),
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  googleAuth: (credential) => 
    api.post('/auth/google', { credential }),
  adminLogin: (email, password) =>
    api.post('/auth/admin/login', { email, password })
};

export const userApi = {
  getMe: () => api.get('/user/me'),
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.patch('/user/profile', data),
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    return api.post('/user/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  updateBasic: (data) => {
    const formData = new FormData();
    if (data.phone) formData.append('phone', data.phone);
    if (data.languages) formData.append('languages', JSON.stringify(data.languages));
    if (data.ctc) formData.append('ctc', data.ctc);
    if (data.resume) formData.append('resume', data.resume);
    return api.put('/user/basic', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  updateRoleSkills: (roleId, skills) => api.put('/user/role-skills', { roleId, skills })
};

export const jobApi = {
  getRecommendations: () => api.get('/jobs/recommend'),
  getJob: (id) => api.get(`/jobs/${id}`),
  apply: (jobId) => api.post('/jobs/apply', { jobId }),
  getApplications: () => api.get('/jobs/applications')
};

export const interviewApi = {
  start: (jobId, detectedLanguage) => api.post('/interview/start', { jobId, detectedLanguage }),
  begin: (interviewId) => api.post('/interview/begin', { interviewId }),
  saveAnswer: (interviewId, questionId, transcript, timeTaken, language) => 
    api.post('/interview/save-answer', { interviewId, questionId, transcript, timeTaken, language }),
  nextQuestion: (interviewId) => api.post('/interview/next-question', { interviewId }),
  evaluate: (interviewId) => api.post('/interview/evaluate', { interviewId }),
  getEvaluationJob: (jobId) => api.get(`/interview/evaluation-job/${jobId}`),
  streamBehavior: (interviewId, questionId, metrics) => 
    api.post('/interview/behavior-stream', { interviewId, questionId, metrics }),
  uploadTranscriptChunk: (interviewId, questionId, offset, text) =>
    api.post('/interview/transcript-chunk', { interviewId, questionId, offset, text }),
  uploadRecording: (interviewId, file) => {
    const formData = new FormData();
    formData.append('interviewId', interviewId);
    formData.append('recording', file);
    return api.post('/interview/upload-recording', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  finish: (interviewId, answers) => api.post('/interview/finish', { interviewId, answers }),
  getMyInterviews: () => api.get('/interview/my'),
  getInterview: (id) => api.get(`/interview/${id}`),
  downloadPDF: (id) => api.get(`/interview/${id}/pdf`, { responseType: 'blob' })
};

export const optInApi = {
  getRequests: () => api.get('/optins/requests'),
  submit: (requestId, status, note) => api.post('/optins/submit', { requestId, status, note })
};

export const resumeApi = {
  getATSScore: (jobDescription, jobRole) => api.post('/resume/ats-score', { jobDescription, jobRole }),
  analyze: (jobRole) => api.post('/resume/analyze', { jobRole })
};

export const resumeBuilderApi = {
  getAll: () => api.get('/resume-builder/all'),
  getOne: (id) => api.get(`/resume-builder/${id}`),
  save: (data) => api.post('/resume-builder/save', data),
  delete: (id) => api.delete(`/resume-builder/${id}`),
  generatePDF: (id) => api.post(`/resume-builder/${id}/generate-pdf`),
  setActive: (id) => api.post(`/resume-builder/${id}/set-active`)
};

export const chatApi = {
  ask: (query, context) => api.post('/chat/ask', { query, context })
};

