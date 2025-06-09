import React from 'react';
import { StatusBar } from 'react-native';
import { ThemeProvider } from 'styled-components/native';
import { AuthProvider } from './context/AuthContext';
import AppNavigator from './navigation/AppNavigator';
import { colors } from './constants/colors';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from 'react-native';

export default function App() {
  const colorScheme = useColorScheme();

  const theme = {
    dark: colorScheme === 'dark',
    colors: {
      primary: colors.primary,
      secondary: colors.secondary,
      background: colorScheme === 'dark' ? colors.dark : colors.white,
      text: colorScheme === 'dark' ? colors.white : colors.gray,
      error: colors.warning,
      dark: colors.dark,
    },
  };

  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <StatusBar
            barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
            backgroundColor={colorScheme === 'dark' ? colors.dark : colors.white}
          />
          <AppNavigator />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
