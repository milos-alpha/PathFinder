import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { globalStyles } from '../constants/styles';
import DirectionMap from '../components/DirectionMap';
import api from '../services/api';
import { getCurrentLocation } from '../services/location';
import LoadingIndicator from '../components/LoadingIndicator';

const DirectionsScreen = ({ route }) => {
  const { buildingId } = route.params;
  const [building, setBuilding] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get building details
        const buildingResponse = await api.get(`/user/buildings/${buildingId}/directions`);
        setBuilding(buildingResponse.data.building);
        
        // Get current location
        const location = await getCurrentLocation();
        setCurrentLocation({
          latitude: location.latitude,
          longitude: location.longitude,
        });
      } catch (err) {
        console.error('Error fetching directions:', err);
        setError('Could not get directions. Please try again.');
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

  if (!building || !currentLocation) {
    return (
      <View style={globalStyles.container}>
        <Text>No data available</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Directions to {building.name}</Text>
      <Text style={styles.address}>{building.address}</Text>
      
      <DirectionMap
        origin={currentLocation}
        destination={{
          latitude: building.destination.latitude,
          longitude: building.destination.longitude,
        }}
      />
      
      <View style={styles.directionsInfo}>
        <Text style={styles.directionsText}>
          Distance: {building.distance} km
        </Text>
        <Text style={styles.directionsText}>
          Estimated Time: {building.duration} mins
        </Text>
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
  },
  directionsText: {
    fontSize: 16,
    marginBottom: 5,
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
});

export default DirectionsScreen;
