// src/utils/axiosConfig.ts
import axios from 'axios';


axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    const externalToken = localStorage.getItem('external_token');
    if (externalToken) {
      config.headers['X-External-Token'] = externalToken;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axios;
