import React from 'react';
import { StatusBar } from 'react-native';
import { ThemeProvider } from 'styled-components/native';
import { AuthProvider } from './context/AuthContext';
import AppNavigator from './navigation/AppNavigator';
import { colors } from './constants/colors';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const theme = {
  colors: {
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.white,
    text: colors.gray,
    error: colors.warning,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <StatusBar style="dark" />
          <AppNavigator />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
