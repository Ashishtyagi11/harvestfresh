import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('harvestfresh_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Global response error interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or unauthenticated
      localStorage.removeItem('harvestfresh_token');
      localStorage.removeItem('harvestfresh_user');
    }
    return Promise.reject(error);
  }
);

export default api;
