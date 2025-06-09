import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { globalStyles } from '../../constants/styles';
import { colors } from '../../constants/colors';
import BuildingCard from '../../components/BuildingCard';
import api from '../../services/api';
import LoadingIndicator from '../../components/LoadingIndicator';
import { Ionicons } from '@expo/vector-icons';

const BuildingsListScreen = ({ navigation }) => {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const response = await api.get('/admin/buildings');
        setBuildings(response.data);
      } catch (error) {
        console.error('Error fetching buildings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBuildings();
  }, []);

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <View style={globalStyles.container}>
      <FlatList
        data={buildings}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <BuildingCard
            building={item}
            onPress={() => navigation.navigate('QRCode', { buildingId: item._id })}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.noBuildings}>No buildings found</Text>
        }
      />
      
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddBuilding')}
      >
        <Ionicons name="add" size={30} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  noBuildings: {
    textAlign: 'center',
    marginTop: 20,
    color: colors.gray,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default BuildingsListScreen;
