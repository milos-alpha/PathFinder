import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/colors'
import { globalStyles } from '../constants/styles';

const BuildingCard = ({ building, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={globalStyles.card}>
      <Text style={styles.title}>{building?.name || 'Unnamed Building'}</Text>
      <Text style={styles.address}>{building?.address || 'Address not available'}</Text>
      {building?.description && (
        <Text style={styles.description}>{building.description}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 5,
  },
  address: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: colors.dark,
  },
});

export default BuildingCard;