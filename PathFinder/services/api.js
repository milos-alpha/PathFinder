import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/config';

const api = axios.create({
  baseURL: BASE_URL, // Add your server address
});

// Add a request interceptor to include the token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token'); // Or your token storage method
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
  (response) => {
    // Log response for debugging (remove in production)
    if (__DEV__) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.status);
    }
    return response;
  },
  async (error) => {
    // Log error for debugging
    if (!__DEV__) {
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