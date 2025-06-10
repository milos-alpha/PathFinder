import React from 'react';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

const DirectionMap = ({ origin, destination }) => {
  if (!origin || !destination) return null;

  const coordinates = [
    {
      latitude: origin.latitude,
      longitude: origin.longitude,
    },
    {
      latitude: destination.latitude,
      longitude: destination.longitude,
    },
  ];

  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: (origin.latitude + destination.latitude) / 2,
        longitude: (origin.longitude + destination.longitude) / 2,
        latitudeDelta: Math.abs(origin.latitude - destination.latitude) * 2,
        longitudeDelta: Math.abs(origin.longitude - destination.longitude) * 2,
      }}
      showsUserLocation={true}
    >
      <Marker
        coordinate={origin}
        title="Your Location"
        pinColor={colors.primary}
      />
      <Marker
        coordinate={destination}
        title="Destination"
        pinColor={colors.secondary}
      />
      <Polyline
        coordinates={coordinates}
        strokeColor={colors.primary}
        strokeWidth={3}
      />
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginVertical: 10,
  },
});

export default DirectionMap;
