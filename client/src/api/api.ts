import axios from 'axios';

const api = axios.create({
  baseURL: '/',
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh and auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Only log out on 401 (unauthorized - invalid/expired token)
    // Do NOT log out on 403 (forbidden - valid token but insufficient permissions)
    if (error.response?.status === 401) {
      console.log('401 Unauthorized - logging out user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    // For 403 and other errors, just propagate the error without logging out
    return Promise.reject(error);
  }
);

export default api;