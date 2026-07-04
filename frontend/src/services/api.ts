import axios from 'axios';

const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const baseURL = `http://${hostname}:5002/api`;

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
