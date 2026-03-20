import axios from 'axios';

const api = axios.create({ baseURL: 'https://gigshield1.onrender.com' });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const auth = {
  requestOtp: (phone) => api.post('/auth/request-otp', { phone }),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
};

export const worker = {
  getProfile: () => api.get('/worker/profile'),
  updateProfile: (data) => api.put('/worker/profile', data),
};

export const policy = {
  getQuotes: () => api.get('/policy/quotes'),
  getQuote: (plan) => api.get(`/policy/quote/${plan}`),
  create: (plan) => api.post('/policy/create', { plan }),
  getActive: () => api.get('/policy/active'),
  getHistory: () => api.get('/policy/history'),
};

export const claims = {
  getMyClaims: () => api.get('/claim/my-claims'),
  simulate: (triggerType = 'rain') => api.post('/claim/simulate', { triggerType }),
  manual: (data) => api.post('/claim/manual', data),
};

export const dashboard = {
  getSummary: () => api.get('/dashboard/summary'),
};

export default api;