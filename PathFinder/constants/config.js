export const BASE_URL = __DEV__ 
  ? 'http://192.168.39.241:5000/api'   // Development URL
  : 'https://your-production-api.com/api'; // Production URL

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  
  // User endpoints
  BUILDINGS: '/user/buildings',
  BUILDING_DETAILS: '/user/buildings',
  BUILDING_DIRECTIONS: '/user/buildings',
  SEARCH_BUILDINGS: '/user/buildings/search',
  
  // Admin endpoints
  ADMIN_BUILDINGS: '/admin/buildings',
  ADMIN_ADD_BUILDING: '/admin/buildings',
  ADMIN_BUILDING_QRCODE: '/admin/buildings',
};

export const LOCATION_CONFIG = {
  TIMEOUT: 15000,
  MAXIMUM_AGE: 10000,
  HIGH_ACCURACY: true,
};

export const MAP_CONFIG = {
  INITIAL_REGION: {
    latitude: 3.8480,   // Yaoundé coordinates as default
    longitude: 11.5021,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
};