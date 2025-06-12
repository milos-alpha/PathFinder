/* eslint-disable no-undef */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
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
  const [detailedSteps, setDetailedSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [nextInstruction, setNextInstruction] = useState('');
  const [distanceToNextStep, setDistanceToNextStep] = useState(0);
  const [showDetailedInstructions, setShowDetailedInstructions] = useState(false);
  const [routeProgress, setRouteProgress] = useState(0);
  
  // Refs for cleanup
  const watchId = useRef(null);
  const updateInterval = useRef(null);

  // Function to calculate distance between two points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // Distance in kilometers
    return d * 1000; // Return in meters
  };

  // Function to find current step based on user location
  const findCurrentStep = useCallback((userLocation, steps) => {
    if (!steps || steps.length === 0) return 0;
    
    let closestStepIndex = 0;
    let minDistance = Infinity;
    
    steps.forEach((step, index) => {
      if (step.startLocation) {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          step.startLocation.lat,
          step.startLocation.lng
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          closestStepIndex = index;
        }
      }
    });
    
    // If user is very close to destination, return last step
    if (steps.length > 0 && steps[steps.length - 1].endLocation) {
      const distanceToEnd = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        steps[steps.length - 1].endLocation.lat,
        steps[steps.length - 1].endLocation.lng
      );
      
      if (distanceToEnd < 50) { // Within 50 meters of destination
        return steps.length - 1;
      }
    }
    
    return closestStepIndex;
  }, []);

  // Function to calculate route progress
  const calculateRouteProgress = useCallback((userLocation, steps, currentStep) => {
    if (!steps || steps.length === 0) return 0;
    
    const totalSteps = steps.length;
    const completedSteps = currentStep;
    const baseProgress = (completedSteps / totalSteps) * 100;
    
    // Add partial progress for current step
    if (currentStep < steps.length && steps[currentStep].startLocation && steps[currentStep].endLocation) {
      const stepStart = steps[currentStep].startLocation;
      const stepEnd = steps[currentStep].endLocation;
      
      const totalStepDistance = calculateDistance(
        stepStart.lat, stepStart.lng,
        stepEnd.lat, stepEnd.lng
      );
      
      const completedStepDistance = calculateDistance(
        stepStart.lat, stepStart.lng,
        userLocation.latitude, userLocation.longitude
      );
      
      const stepProgress = Math.min(completedStepDistance / totalStepDistance, 1);
      const additionalProgress = (stepProgress / totalSteps) * 100;
      
      return Math.min(baseProgress + additionalProgress, 100);
    }
    
    return baseProgress;
  }, []);

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
      
      // Extract detailed navigation steps
      if (response.data.steps && Array.isArray(response.data.steps)) {
        setDetailedSteps(response.data.steps);
        
        // Find current step based on user location
        const currentStep = findCurrentStep(origin, response.data.steps);
        setCurrentStepIndex(currentStep);
        
        // Set next instruction
        if (currentStep < response.data.steps.length) {
          setNextInstruction(response.data.steps[currentStep].instructions);
          
          // Calculate distance to next step
          if (response.data.steps[currentStep].startLocation) {
            const distance = calculateDistance(
              origin.latitude,
              origin.longitude,
              response.data.steps[currentStep].startLocation.lat,
              response.data.steps[currentStep].startLocation.lng
            );
            setDistanceToNextStep(distance);
          }
        }
        
        // Calculate route progress
        const progress = calculateRouteProgress(origin, response.data.steps, currentStep);
        setRouteProgress(progress);
      }
      
      return response.data;
    } catch (err) {
      console.error('Error fetching detailed route:', err);
      // Fallback to basic directions if detailed route fails
      return null;
    }
  }, [buildingId, findCurrentStep, calculateRouteProgress]);

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
    
    // Update step tracking if we have detailed steps
    if (detailedSteps.length > 0) {
      const currentStep = findCurrentStep(newLocation, detailedSteps);
      setCurrentStepIndex(currentStep);
      
      // Update next instruction
      if (currentStep < detailedSteps.length) {
        setNextInstruction(detailedSteps[currentStep].instructions);
        
        // Calculate distance to next step
        if (detailedSteps[currentStep].startLocation) {
          const distance = calculateDistance(
            newLocation.latitude,
            newLocation.longitude,
            detailedSteps[currentStep].startLocation.lat,
            detailedSteps[currentStep].startLocation.lng
          );
          setDistanceToNextStep(distance);
        }
      }
      
      // Update route progress
      const progress = calculateRouteProgress(newLocation, detailedSteps, currentStep);
      setRouteProgress(progress);
    }
    
    // Update directions if we have building data
    if (building && directions) {
      updateDirections(newLocation);
    }
  }, [building, directions, detailedSteps, updateDirections, findCurrentStep, calculateRouteProgress]);

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
          maximumAge: 3000, // Cache location for 3 seconds max for more frequent updates
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
      
      // Set up more frequent updates every 15 seconds for better tracking
      updateInterval.current = setInterval(() => {
        if (currentLocation && building) {
          updateDirections(currentLocation);
        }
      }, 15000);
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

  const formatDistance = (meters) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    } else {
      return `${(meters / 1000).toFixed(1)}km`;
    }
  };

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
        
        {/* Route Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${routeProgress}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(routeProgress)}% Complete</Text>
        </View>
      </View>
      
      {/* Current Navigation Instruction */}
      {nextInstruction && (
        <View style={styles.currentInstruction}>
          <Text style={styles.instructionTitle}>Next Direction:</Text>
          <Text style={styles.instructionText}>{nextInstruction}</Text>
          {distanceToNextStep > 0 && (
            <Text style={styles.distanceText}>In {formatDistance(distanceToNextStep)}</Text>
          )}
        </View>
      )}
      
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
            {detailedSteps.length > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Navigation Steps:</Text>
                <Text style={styles.infoValue}>{currentStepIndex + 1} of {detailedSteps.length}</Text>
              </View>
            )}
          </>
        ) : (
          <Text style={styles.calculatingText}>Calculating route information...</Text>
        )}
        
        {/* Toggle Detailed Instructions */}
        {detailedSteps.length > 0 && (
          <TouchableOpacity 
            style={styles.toggleButton}
            onPress={() => setShowDetailedInstructions(!showDetailedInstructions)}
          >
            <Text style={styles.toggleButtonText}>
              {showDetailedInstructions ? 'Hide' : 'Show'} Detailed Instructions
            </Text>
          </TouchableOpacity>
        )}
        
        {/* Detailed Step-by-Step Instructions */}
        {showDetailedInstructions && detailedSteps.length > 0 && (
          <ScrollView style={styles.detailedInstructions} showsVerticalScrollIndicator={false}>
            <Text style={styles.detailedTitle}>Step-by-Step Directions:</Text>
            {detailedSteps.map((step, index) => (
              <View 
                key={index} 
                style={[
                  styles.stepContainer,
                  index === currentStepIndex && styles.currentStep,
                  index < currentStepIndex && styles.completedStep
                ]}
              >
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={[
                    styles.stepInstructions,
                    index === currentStepIndex && styles.currentStepText
                  ]}>
                    {step.instructions}
                  </Text>
                  {step.distance && (
                    <Text style={styles.stepDistance}>
                      {step.distance.text || formatDistance(step.distance.value || 0)}
                    </Text>
                  )}
                  {step.duration && (
                    <Text style={styles.stepDuration}>
                      {step.duration.text || `${Math.round((step.duration.value || 0) / 60)} min`}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        )}
        
        <Text style={styles.description}>
          Your location is being tracked in real-time for accurate turn-by-turn navigation.
          {detailedSteps.length > 0 && ' Follow the highlighted step above for your next move.'}
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
    marginBottom: 10,
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
  progressContainer: {
    marginBottom: 10,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  currentInstruction: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 5,
  },
  instructionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 5,
  },
  distanceText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
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
    maxHeight: 300,
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
  toggleButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  toggleButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  detailedInstructions: {
    maxHeight: 200,
    marginBottom: 10,
  },
  detailedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  currentStep: {
    backgroundColor: '#E8F5E8',
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  completedStep: {
    backgroundColor: '#F0F0F0',
    opacity: 0.7,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  stepContent: {
    flex: 1,
  },
  stepInstructions: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  currentStepText: {
    fontWeight: '600',
    color: '#2E7D32',
  },
  stepDistance: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  stepDuration: {
    fontSize: 12,
    color: '#666',
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