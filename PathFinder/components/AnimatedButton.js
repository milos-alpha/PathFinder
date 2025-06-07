import React from 'react';
import { TouchableOpacity, Text, Animated, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

const AnimatedButton = ({ title, onPress, style, textStyle }) => {
  const scaleValue = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <TouchableOpacity
        style={[styles.button, style]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={[styles.buttonText, textStyle]}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AnimatedButton;
