import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../constants/colors';

const UserAvatar = ({ name, onPress, size = 40 }) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={[
          styles.container,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      >
        <Text style={[styles.text, { fontSize: size * 0.4 }]}>{initials}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default UserAvatar;
