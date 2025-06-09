import * as Location from 'expo-location';
import { Alert, Platform } from 'react-native';

export const getCurrentLocation = async () => {
  try {
    // Check if location services are enabled
    const isLocationEnabled = await Location.hasServicesEnabledAsync();
    if (!isLocationEnabled) {
      Alert.alert(
        'Location Services Disabled',
        'Please enable location services to use this feature.',
        [{ text: 'OK' }]
      );
      throw new Error('Location services are disabled');
    }

    // Request permission
    let { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Denied',
        'Location permission is required to show directions. Please enable it in your device settings.',
        [{ text: 'OK' }]
      );
      throw new Error('Permission to access location was denied');
    }

    // Get current position with better accuracy
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
      timeout: 15000, // 15 seconds timeout
      maximumAge: 10000, // Accept cached location up to 10 seconds old
    });

    if (!location || !location.coords) {
      throw new Error('Unable to retrieve location coordinates');
    }

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      timestamp: location.timestamp,
    };
  } catch (error) {
    console.error('Error getting location:', error);
    
    // Provide more specific error messages
    if (error.code === 'E_LOCATION_TIMEOUT') {
      throw new Error('Location request timed out. Please try again.');
    } else if (error.code === 'E_LOCATION_UNAVAILABLE') {
      throw new Error('Location is temporarily unavailable. Please try again.');
    } else if (error.message.includes('denied')) {
      throw new Error('Location permission denied. Please enable it in settings.');
    } else {
      throw new Error(`Failed to get location: ${error.message}`);
    }
  }
};

export const watchLocation = async (callback, errorCallback) => {
  try {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to access location was denied');
    }

    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000, // Update every 5 seconds
        distanceInterval: 10, // Update every 10 meters
      },
      (location) => {
        callback({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
          timestamp: location.timestamp,
        });
      }
    );

    return subscription;
  } catch (error) {
    console.error('Error watching location:', error);
    if (errorCallback) {
      errorCallback(error);
    }
    throw error;
  }
};

export const getAddressFromCoordinates = async (latitude, longitude) => {
  try {
    const addresses = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (addresses && addresses.length > 0) {
      const address = addresses[0];
      return {
        formattedAddress: `${address.street || ''} ${address.name || ''}, ${address.city || ''}, ${address.region || ''} ${address.postalCode || ''}`.trim(),
        street: address.street,
        city: address.city,
        region: address.region,
        postalCode: address.postalCode,
        country: address.country,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting address from coordinates:', error);
    throw error;
  }
};