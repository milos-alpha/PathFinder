import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DirectionsScreen from '../screens/DirectionsScreen';
import BuildingsListScreen from '../screens/admin/BuildingsListScreen';
import AddBuildingScreen from '../screens/admin/AddBuildingScreen';
import QRCodeScreen from '../screens/admin/QRCodeScreen';
import { AuthContext } from '../context/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const AdminStack = createStackNavigator();

// Home Stack Navigator
function HomeNavigator() {
  return (
    <Stack.Navigator
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
      <Stack.Screen 
        name="HomeMain" 
        component={HomeScreen} 
        options={{ title: 'Home' }} 
      />
      <Stack.Screen 
        name="Directions" 
        component={DirectionsScreen} 
        options={{ title: 'Directions' }} 
      />
    </Stack.Navigator>
  );
}

// Search Stack Navigator
function SearchNavigator() {
  return (
    <Stack.Navigator
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
      <Stack.Screen 
        name="SearchMain" 
        component={SearchScreen} 
        options={{ title: 'Search' }} 
      />
      <Stack.Screen 
        name="Directions" 
        component={DirectionsScreen} 
        options={{ title: 'Directions' }} 
      />
    </Stack.Navigator>
  );
}

// Admin Stack Navigator
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
      <AdminStack.Screen 
        name="BuildingsList" 
        component={BuildingsListScreen} 
        options={{ title: 'Buildings' }} 
      />
      <AdminStack.Screen 
        name="AddBuilding" 
        component={AddBuildingScreen} 
        options={{ title: 'Add Building' }} 
      />
      <AdminStack.Screen 
        name="QRCode" 
        component={QRCodeScreen} 
        options={{ title: 'QR Code' }} 
      />
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
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeNavigator} />
      <Tab.Screen name="Search" component={SearchNavigator} />
      {isAdmin && <Tab.Screen name="Admin" component={AdminNavigator} />}
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}