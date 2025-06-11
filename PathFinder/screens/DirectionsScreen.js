/* eslint-disable no-undef */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { globalStyles } from '../constants/styles';
import DirectionMap from '../components/DirectionMap';
import api from '../services/api';
import { getCurrentLocation } from '../services/location';
import LoadingIndicator from '../components/LoadingIndicator';
import { BASE_URL } from '../constants/config';

const DirectionsScreen = ({ route }) => {
  const { buildingId } = route.params;
  const [building, setBuilding] = useState(null);
  const [directions, setDirections] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isTracking, setIsTracking] = useState(true);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  
  // Refs for cleanup
  const watchId = useRef(null);
  const updateInterval = useRef(null);

  // Function to fetch detailed route information
  const fetchDetailedRoute = useCallback(async (origin, destination) => {
    try {
      const response = await api.get(`${BASE_URL}/user/buildings/${buildingId}/detailed-route`, {
        params: {
          originLat: origin.latitude.toString(),
          originLng: origin.longitude.toString(),
          destLat: destination.latitude.toString(),
          destLng: destination.longitude.toString()
        }
      });
      
      if (response.data.route && response.data.route.coordinates) {
        setRouteCoordinates(response.data.route.coordinates);
      }
      
      return response.data;
    } catch (err) {
      console.error('Error fetching detailed route:', err);
      // Fallback to basic directions if detailed route fails
      return null;
    }
  }, [buildingId]);

  // Function to update directions with current location
  const updateDirections = useCallback(async (location) => {
    try {
      const response = await api.get(`${BASE_URL}/user/buildings/${buildingId}/directions`, {
        params: {
          latitude: location.latitude.toString(),
          longitude: location.longitude.toString()
        },
      });
      
      // Update directions data
      const newDirections = {
        origin: response.data.origin,
        destination: response.data.destination,
        distance: response.data.distance,
        duration: response.data.duration,
      };
      
      setDirections(newDirections);
      
      // Fetch detailed route if available
      if (newDirections.destination) {
        await fetchDetailedRoute(location, newDirections.destination);
      }
      
      setLastUpdateTime(new Date());
      
    } catch (err) {
      console.error('Error updating directions:', err);
      // Don't show error for updates, just log it
    }
  }, [buildingId, fetchDetailedRoute]);

  // Function to handle location updates
  const handleLocationUpdate = useCallback((location) => {
    const newLocation = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
    
    setCurrentLocation(newLocation);
    
    // Update directions if we have building data
    if (building && directions) {
      updateDirections(newLocation);
    }
  }, [building, directions, updateDirections]);

  // Function to start location tracking
  const startLocationTracking = useCallback(() => {
    if (navigator.geolocation) {
      watchId.current = navigator.geolocation.watchPosition(
        handleLocationUpdate,
        (error) => {
          console.error('Location tracking error:', error);
          setError('Location tracking failed. Please check your location settings.');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000, // Cache location for 5 seconds max
        }
      );
    }
  }, [handleLocationUpdate]);

  // Function to stop location tracking
  const stopLocationTracking = useCallback(() => {
    if (watchId.current) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    if (updateInterval.current) {
      clearInterval(updateInterval.current);
      updateInterval.current = null;
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Get current location first
        const location = await getCurrentLocation();
        const initialLocation = {
          latitude: location.latitude,
          longitude: location.longitude,
        };
        setCurrentLocation(initialLocation);

        // Get building directions with current location
        const response = await api.get(`${BASE_URL}/user/buildings/${buildingId}/directions`, {
          params: {
            latitude: location.latitude.toString(),
            longitude: location.longitude.toString()
          }
        });
        
        // Set building data
        setBuilding(response.data.building);
        
        // Set directions data
        const directionsData = {
          origin: response.data.origin,
          destination: response.data.destination,
          distance: response.data.distance,
          duration: response.data.duration
        };
        setDirections(directionsData);
        
        // Fetch detailed route
        if (directionsData.destination) {
          await fetchDetailedRoute(initialLocation, directionsData.destination);
        }
        
        setLastUpdateTime(new Date());
        
      } catch (err) {
        console.error('Error fetching initial data:', err);
        let errorMessage = 'Could not get directions. Please try again.';
        
        if (err.message.includes('Permission to access location was denied')) {
          errorMessage = 'Location permission was denied. Please enable location services.';
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [buildingId, fetchDetailedRoute]);

  // Start/stop location tracking
  useEffect(() => {
    if (!loading && !error && isTracking) {
      startLocationTracking();
      
      // Also set up periodic updates every 30 seconds as backup
      updateInterval.current = setInterval(() => {
        if (currentLocation && building) {
          updateDirections(currentLocation);
        }
      }, 30000);
    }

    // Cleanup function
    return () => {
      stopLocationTracking();
    };
  }, [loading, error, isTracking, building, startLocationTracking, currentLocation, updateDirections, stopLocationTracking]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      stopLocationTracking();
    };
  }, [stopLocationTracking]);

  if (loading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return (
      <View style={globalStyles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!building || !directions || !currentLocation) {
    return (
      <View style={globalStyles.container}>
        <Text>No data available</Text>
      </View>
    );
  }

  // Additional safety check for destination coordinates
  if (!directions.destination || 
      typeof directions.destination.latitude !== 'number' || 
      typeof directions.destination.longitude !== 'number') {
    return (
      <View style={globalStyles.container}>
        <Text style={styles.error}>Invalid destination coordinates</Text>
      </View>
    );
  }

  const formatLastUpdate = () => {
    if (!lastUpdateTime) return '';
    const now = new Date();
    const diffSeconds = Math.floor((now - lastUpdateTime) / 1000);
    
    if (diffSeconds < 60) {
      return `Updated ${diffSeconds}s ago`;
    } else {
      const diffMinutes = Math.floor(diffSeconds / 60);
      return `Updated ${diffMinutes}m ago`;
    }
  };

  return (
    <View style={globalStyles.container}>
      <View style={styles.header}>
        <Text style={globalStyles.title}>Directions to {building.name || 'Unknown Building'}</Text>
        <Text style={styles.address}>{building.address || 'No address available'}</Text>
        <View style={styles.trackingStatus}>
          <View style={[styles.trackingDot, { backgroundColor: isTracking ? '#4CAF50' : '#FF5722' }]} />
          <Text style={styles.trackingText}>
            {isTracking ? 'Live tracking' : 'Tracking paused'} • {formatLastUpdate()}
          </Text>
        </View>
      </View>
      
      <DirectionMap
        origin={currentLocation}
        destination={{
          latitude: directions.destination.latitude,
          longitude: directions.destination.longitude,
        }}
        routeCoordinates={routeCoordinates}
        isTracking={isTracking}
        showUserLocation={true}
        followUserLocation={true}
      />
      
      <View style={styles.directionsInfo}>
        {directions.distance !== null && directions.distance !== undefined && 
         directions.duration !== null && directions.duration !== undefined ? (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Distance:</Text>
              <Text style={styles.infoValue}>{directions.distance.toFixed(2)} km</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Estimated Time:</Text>
              <Text style={styles.infoValue}>{Math.round(directions.duration)} mins</Text>
            </View>
            {routeCoordinates.length > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Route Points:</Text>
                <Text style={styles.infoValue}>{routeCoordinates.length} waypoints</Text>
              </View>
            )}
          </>
        ) : (
          <Text style={styles.calculatingText}>Calculating route information...</Text>
        )}
        
        <Text style={styles.description}>
          Your location is being tracked in real-time for accurate directions.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 15,
  },
  address: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 10,
  },
  trackingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  trackingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  trackingText: {
    fontSize: 12,
    color: 'gray',
    fontStyle: 'italic',
  },
  directionsInfo: {
    marginTop: 15,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  calculatingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  description: {
    fontSize: 14,
    color: 'gray',
    marginTop: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default DirectionsScreen;