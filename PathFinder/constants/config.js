// Check if we're in development mode
const isDevelopment = __DEV__;

// Base URLs for different environments
const DEVELOPMENT_URL = 'http://192.168.225.241:5000/api';
const PRODUCTION_URL = 'https://backend-3utx.onrender.com/api';

export const BASE_URL = isDevelopment ? DEVELOPMENT_URL : PRODUCTION_URL;

// Alternative base URL for testing (you can switch between these)
export const ALTERNATIVE_BASE_URL = 'https://backend-3utx.onrender.com/api';

// API endpoints configuration
export const API_ENDPOINTS = {
  // Auth endpoints
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  USERS: '/auth/users',
  
  // Admin endpoints
  BUILDINGS: '/admin/buildings',
  BUILDING_QR: (id) => `/admin/buildings/${id}/qrcode`,
  
  // User endpoints
  SEARCH_BUILDINGS: '/user/buildings/search',
  BUILDING_DIRECTIONS: (buildingId) => `/user/buildings/${buildingId}/directions`,
  
  // Utility endpoints
  HEALTH: '/health',
  UPLOADS: '/uploads',
  DOWNLOAD: (filename) => `/download/${filename}`,
};

// Helper function to build full URLs
export const buildUrl = (endpoint) => {
  return `${BASE_URL}${endpoint}`;
};

// API configuration for requests
export const API_CONFIG = {
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Location configuration
export const LOCATION_CONFIG = {
  TIMEOUT: 15000,
  MAXIMUM_AGE: 10000,
  HIGH_ACCURACY: true,
};

// Map configuration
export const MAP_CONFIG = {
  INITIAL_REGION: {
    latitude: 3.8480,   // Yaoundé coordinates as default
    longitude: 11.5021,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
};

// Environment info for debugging
export const ENV_INFO = {
  isDevelopment,
  baseUrl: BASE_URL,
  timestamp: new Date().toISOString(),
};