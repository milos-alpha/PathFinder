import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current location first
        const location = await getCurrentLocation();
        setCurrentLocation({
          latitude: location.latitude,
          longitude: location.longitude,
        });

        // Then get building directions with current location
        const response = await api.get(`${BASE_URL}/user/buildings/${buildingId}/directions`, {
          params: {
            latitude: location.latitude.toString(),
            longitude: location.longitude.toString()
          }
        });
        
        // Set building data
        setBuilding(response.data.building);
        
        // Set directions data
        setDirections({
          origin: response.data.origin,
          destination: response.data.destination,
          distance: response.data.distance,
          duration: response.data.duration
        });
      } catch (err) {
        console.error('Error fetching directions:', err);
        let errorMessage = 'Could not get directions. Please try again.';
        
        if (err.message.includes('Permission to access location was denied')) {
          errorMessage = 'Location permission was denied. Please enable location services.';
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [buildingId]);

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
      <Text style={globalStyles.title}>Directions to {building.name || 'Unknown Building'}</Text>
      <Text style={styles.address}>{building.address || 'No address available'}</Text>
      
      <DirectionMap
        origin={currentLocation}
        destination={{
          latitude: directions.destination.latitude,
          longitude: directions.destination.longitude,
        }}
      />
      
      <View style={styles.directionsInfo}>
        {directions.distance !== null && directions.distance !== undefined && 
         directions.duration !== null && directions.duration !== undefined ? (
          <>
            <Text style={styles.directionsText}>
              Distance: {directions.distance.toFixed(2)} km
            </Text>
            <Text style={styles.directionsText}>
              Estimated Time: {Math.round(directions.duration)} mins
            </Text>
          </>
        ) : (
          <Text>Calculating route information...</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  address: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 15,
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
  directionsText: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: 'gray',
    marginTop: 8,
    fontStyle: 'italic',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default DirectionsScreen;