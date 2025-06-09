import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { globalStyles } from '../constants/styles';

const BuildingCard = ({ building, onPress }) => {
  const formatCoordinates = (lat, lng) => {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  };

  return (
    <TouchableOpacity onPress={onPress} style={[globalStyles.card, styles.card]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{building.name}</Text>
          <View style={styles.locationBadge}>
            <Ionicons name="location-outline" size={12} color={colors.white} />
            <Text style={styles.badgeText}>Location</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.gray} />
      </View>
      
      <View style={styles.addressContainer}>
        <Ionicons name="home-outline" size={16} color={colors.gray} />
        <Text style={styles.address}>{building.address}</Text>
      </View>
      
      {building.description && (
        <View style={styles.descriptionContainer}>
          <Ionicons name="information-circle-outline" size={16} color={colors.gray} />
          <Text style={styles.description}>{building.description}</Text>
        </View>
      )}
      
      <View style={styles.coordinatesContainer}>
        <Ionicons name="navigate-outline" size={16} color={colors.primary} />
        <Text style={styles.coordinates}>
          {formatCoordinates(building.latitude, building.longitude)}
        </Text>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.tapHint}>Tap for directions</Text>
        <View style={styles.distancePlaceholder}>
          <Ionicons name="walk-outline" size={16} color={colors.secondary} />
          <Text style={styles.distanceText}>Get directions</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
    marginRight: 10,
    flex: 1,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  address: {
    fontSize: 14,
    color: colors.gray,
    marginLeft: 8,
    flex: 1,
  },
  descriptionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.dark,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  coordinatesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 6,
  },
  coordinates: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 8,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  tapHint: {
    fontSize: 12,
    color: colors.gray,
    fontStyle: 'italic',
  },
  distancePlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 12,
    color: colors.secondary,
    marginLeft: 4,
    fontWeight: '600',
  },
});

export default BuildingCard;