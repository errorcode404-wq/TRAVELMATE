import axios from 'axios';

let rawApiUrl = import.meta.env.VITE_API_URL || 'https://travelmate-1-yfdl.onrender.com';
if (!rawApiUrl.startsWith('http://') && !rawApiUrl.startsWith('https://')) {
  rawApiUrl = `https://${rawApiUrl}`;
}
const API_URL = rawApiUrl.endsWith('/api') || rawApiUrl.endsWith('/api/')
  ? rawApiUrl.replace(/\/$/, '')
  : `${rawApiUrl.replace(/\/$/, '')}/api`;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const extractError = (error) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.errors) {
    return error.response.data.errors.map(e => e.message || e).join(', ');
  }
  if (error.message) return error.message;
  return 'An unexpected error occurred';
};

export default api;
