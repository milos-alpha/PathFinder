import axios from 'axios';
import { BASE_URL } from '../constants/config';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // eslint-disable-next-line no-undef
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access
      console.log('Unauthorized access - logging out');
      // You might want to logout the user here
    }
    return Promise.reject(error);
  }
);

export default api;
