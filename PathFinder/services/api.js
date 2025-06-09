import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/config';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token from AsyncStorage:', error);
    }
    
    // Log request for debugging (remove in production)
    if (__DEV__) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
      if (config.data) {
        console.log('📦 Request Data:', config.data);
      }
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log response for debugging (remove in production)
    if (__DEV__) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.status);
    }
    return response;
  },
  async (error) => {
    // Log error for debugging
    if (__DEV__) {
      console.error('❌ API Error:', error.response?.status, error.response?.data || error.message);
    }
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (status === 401) {
        // Handle unauthorized access - clear token and redirect to login
        console.log('Unauthorized access - clearing token');
        try {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
          // You might want to dispatch a logout action here
          // or navigate to login screen
        } catch (storageError) {
          console.error('Error clearing storage:', storageError);
        }
      } else if (status === 403) {
        console.log('Forbidden access');
      } else if (status === 404) {
        console.log('Resource not found');
      } else if (status >= 500) {
        console.log('Server error');
      }
      
      // Return a more user-friendly error message
      const errorMessage = data?.error || data?.message || 'An error occurred';
      error.userFriendlyMessage = errorMessage;
    } else if (error.request) {
      // Network error
      console.log('Network error - no response received');
      error.userFriendlyMessage = 'Network error. Please check your internet connection.';
    } else {
      // Other error
      console.log('Request setup error:', error.message);
      error.userFriendlyMessage = 'An unexpected error occurred.';
    }
    
    return Promise.reject(error);
  }
);

export default api;