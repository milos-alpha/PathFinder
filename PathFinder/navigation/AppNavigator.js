import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import AuthStack from './AuthStack';
import MainStack from './MainStack';
import LoadingIndicator from '../components/LoadingIndicator';

export default function AppNavigator() {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}