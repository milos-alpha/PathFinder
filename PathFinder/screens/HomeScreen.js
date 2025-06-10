import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { globalStyles } from '../constants/styles';
import { AuthContext } from '../context/AuthContext';
import UserAvatar from '../components/UserAvatar';
import BuildingCard from '../components/BuildingCard';
import LoadingIndicator from '../components/LoadingIndicator';
import api from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { BASE_URL } from '../constants/config';

const HomeScreen = () => {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchBuildings = async () => {
    try {
      setError('');
      const response = await api.get(`${BASE_URL}/admin/buildings`);
      setBuildings(response.data);
    } catch (err) {
      console.error('Error fetching buildings:', err);
      setError('Failed to load buildings. Please try again.');
      // Show alert for better user experience
      Alert.alert(
        'Error',
        'Failed to load buildings. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBuildings();
  };

  const handleBuildingPress = (building) => {
    navigation.navigate('Search', {
      screen: 'Directions',
      params: { buildingId: building._id }
    });
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <ScrollView 
      style={globalStyles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={globalStyles.title}>{user?.name}</Text>
        </View>
        <UserAvatar name={user?.name || 'User'} />
      </View>
      
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{buildings.length}</Text>
          <Text style={styles.statLabel}>Buildings</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user?.role === 'admin' ? 'Admin' : 'User'}</Text>
          <Text style={styles.statLabel}>Role</Text>
        </View>
      </View>
      
      <Text style={styles.sectionTitle}>All Buildings</Text>
      
      {buildings.length > 0 ? (
        buildings.map((building) => (
          <BuildingCard
            key={building._id}
            building={building}
            onPress={() => handleBuildingPress(building)}
          />
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No buildings available</Text>
          <Text style={styles.emptySubtext}>
            {user?.role === 'admin' 
              ? 'Add some buildings from the Admin tab' 
              : 'Contact your administrator to add buildings'
            }
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34495e',
    marginBottom: 15,
    marginTop: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
  },
  statLabel: {
    fontSize: 14,
    color: 'gray',
    marginTop: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'gray',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default HomeScreen;