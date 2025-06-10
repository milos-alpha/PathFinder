import * as Location from 'expo-location';
// import { Alert, Platform } from 'react-native';

export const getCurrentLocation = async () => {
  try {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to access location was denied');
    }

    let location = await Location.getCurrentPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error getting location:', error);
    throw error;
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