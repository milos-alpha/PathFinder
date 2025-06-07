import React, { useState} from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { globalStyles } from '../constants/styles';
import SearchBar from '../components/SearchBar';
import BuildingCard from '../components/BuildingCard';
import api from '../services/api';
import LoadingIndicator from '../components/LoadingIndicator';

const SearchScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (searchQuery) => {
    setQuery(searchQuery);
    if (!searchQuery.trim()) {
      setBuildings([]);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/user/buildings/search?query=${searchQuery}`);
      setBuildings(response.data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={globalStyles.container}>
      <SearchBar onSearch={handleSearch} />

      {loading ? (
        <LoadingIndicator />
      ) : buildings.length > 0 ? (
        <FlatList
          data={buildings}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <BuildingCard
              building={item}
              onPress={() =>
                navigation.navigate('Directions', { buildingId: item._id })
              }
            />
          )}
        />
      ) : (
        <Text style={styles.noResults}>
          {query ? 'No buildings found' : 'Search for buildings by name or address'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  noResults: {
    textAlign: 'center',
    marginTop: 20,
    color: 'gray',
  },
});

export default SearchScreen;
