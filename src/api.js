import axios from 'axios';

const API = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export default API;