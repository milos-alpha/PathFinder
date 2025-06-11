export const  BASE_URL = __DEV__
  ? 'http://192.168.179.241:5000/api'   // Development URL
  : 'https://your-production-api.com/api'; // Production URL

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