import axios from 'axios';

let rawBaseURL = import.meta.env.VITE_API_URL as string || 'https://vjhomefoods.onrender.com/api';
// Remove trailing slash if any
rawBaseURL = rawBaseURL.replace(/\/$/, '');
// Append /api if not already present
const baseURL = rawBaseURL.endsWith('/api') ? rawBaseURL : `${rawBaseURL}/api`;

const api = axios.create({
  baseURL
});

let onUnauthorized: (() => void) | null = null;

export const setUnauthorizedCallback = (cb: () => void) => {
  onUnauthorized = cb;
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vj_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('vj_token');
      localStorage.removeItem('vj_user');
      if (onUnauthorized) {
        onUnauthorized();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
