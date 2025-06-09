import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
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
        const buildingResponse = await api.get(`/user/buildings/${buildingId}`);
        setBuilding(buildingResponse.data);
        
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

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance.toFixed(2);
  };

  // Estimate walking time (average walking speed: 5 km/h)
  const calculateWalkingTime = (distance) => {
    const walkingSpeedKmH = 5;
    const timeInHours = distance / walkingSpeedKmH;
    const timeInMinutes = Math.round(timeInHours * 60);
    return timeInMinutes;
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

  if (!building || !currentLocation) {
    return (
      <View style={globalStyles.container}>
        <Text>No data available</Text>
      </View>
    );
  }

  const distance = calculateDistance(
    currentLocation.latitude,
    currentLocation.longitude,
    building.latitude,
    building.longitude
  );

  const walkingTime = calculateWalkingTime(parseFloat(distance));

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Directions to {building.name}</Text>
      <Text style={styles.address}>{building.address}</Text>
      
      <DirectionMap
        origin={currentLocation}
        destination={{
          latitude: building.latitude,
          longitude: building.longitude,
        }}
      />
      
      <View style={styles.directionsInfo}>
        <Text style={styles.directionsText}>
          Distance: {distance} km
        </Text>
        <Text style={styles.directionsText}>
          Estimated Walking Time: {walkingTime} mins
        </Text>
        {building.description && (
          <Text style={styles.description}>
            Description: {building.description}
          </Text>
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