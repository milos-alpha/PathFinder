import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

const SearchBar = ({ onSearch, placeholder = 'Search...' }) => {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={handleSearch}
      />
      <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
        <Ionicons name="search" size={20} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: colors.white,
  },
  searchButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});

export default SearchBar;
