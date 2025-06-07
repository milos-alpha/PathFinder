import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { globalStyles } from '../constants/styles';
import { AuthContext } from '../context/AuthContext';
import UserAvatar from '../components/UserAvatar';
import BuildingCard from '../components/BuildingCard';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();

  // Sample buildings data - in a real app, you would fetch this from your backend
  const sampleBuildings = [
    {
      id: '1',
      name: 'Main Hall',
      address: '123 University Ave',
      description: 'The main building of the university',
    },
    {
      id: '2',
      name: 'Science Building',
      address: '456 College St',
      description: 'Home to all science departments',
    },
  ];

  return (
    <ScrollView style={globalStyles.container}>
      <View style={styles.header}>
        <Text style={globalStyles.title}>Welcome, {user?.name}</Text>
        <UserAvatar name={user?.name || 'User'} />
      </View>
      
      <Text style={styles.sectionTitle}>Featured Buildings</Text>
      {sampleBuildings.map((building) => (
        <BuildingCard
          key={building.id}
          building={building}
          onPress={() => navigation.navigate('Directions', { buildingId: building.id })}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'gray',
    marginBottom: 10,
  },
});

export default HomeScreen;
