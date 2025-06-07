import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DirectionsScreen from '../screens/DirectionsScreen';
import BuildingsListScreen from '../screens/Admin/BuildingsListScreen';
import AddBuildingScreen from '../screens/Admin/AddBuildingScreen';
import QRCodeScreen from '../screens/Admin/QRCodeScreen';
import { AuthContext } from '../context/AuthContext';

const Tab = createBottomTabNavigator();
const AdminStack = createStackNavigator();

function AdminNavigator() {
  return (
    <AdminStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <AdminStack.Screen name="BuildingsList" component={BuildingsListScreen} options={{ title: 'Buildings' }} />
      <AdminStack.Screen name="AddBuilding" component={AddBuildingScreen} options={{ title: 'Add Building' }} />
      <AdminStack.Screen name="QRCode" component={QRCodeScreen} options={{ title: 'QR Code' }} />
    </AdminStack.Navigator>
  );
}

export default function MainStack() {
  const { isAdmin } = useContext(AuthContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Admin') {
            iconName = focused ? 'build' : 'build-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Search" component={SearchScreen} />
      {isAdmin && <Tab.Screen name="Admin" component={AdminNavigator} options={{ headerShown: false }} />}
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}