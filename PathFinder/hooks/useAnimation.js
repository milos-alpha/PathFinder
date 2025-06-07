import { useState, useEffect } from 'react';
import { Animated } from 'react-native';

export const useAnimation = (initialValue, toValue, duration = 300) => {
  const [animation] = useState(new Animated.Value(initialValue));

  useEffect(() => {
    Animated.timing(animation, {
      toValue,
      duration,
      useNativeDriver: true,
    }).start();
  }, [animation, duration, toValue]);

  return animation;
};
