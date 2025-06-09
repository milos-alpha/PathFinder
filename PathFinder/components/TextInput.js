import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { globalStyles } from '../constants/styles';

const CustomTextInput = ({ style, ...props }) => {
  return (
    <TextInput
      style={[globalStyles.input, style]}
      placeholderTextColor={colors.gray}
      {...props}
    />
  );
};

export default CustomTextInput;
