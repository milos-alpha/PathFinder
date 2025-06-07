import React from 'react';
import { TextInput } from 'react-native';
import { colors, globalStyles } from '../constants/styles';

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
