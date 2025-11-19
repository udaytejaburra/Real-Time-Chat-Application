// axiosInterceptor.js
import axios from 'axios';

axios.interceptors.request.use(config => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});





axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jwtToken');
      alert('Session expired. Please log in again.');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);
