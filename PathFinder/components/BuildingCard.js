import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, globalStyles } from '../constants/styles';

const BuildingCard = ({ building, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={globalStyles.card}>
      <Text style={styles.title}>{building.name}</Text>
      <Text style={styles.address}>{building.address}</Text>
      {building.description && (
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
