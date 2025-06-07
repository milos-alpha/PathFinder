import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { globalStyles } from '../../constants/styles';
import AnimatedButton from '../../components/AnimatedButton';
import TextInput from '../../components/TextInput';
import api from '../../services/api';
import { getCurrentLocation } from '../../services/location';
import LoadingIndicator from '../../components/LoadingIndicator';

const AddBuildingScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUseCurrentLocation = async () => {
    try {
      setLoading(true);
      const location = await getCurrentLocation();
      setLatitude(location.latitude.toString());
      setLongitude(location.longitude.toString());
    } catch (err) {
      setError('Could not get current location. Please enable location services.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!name || !address || !latitude || !longitude) {
      setError('Please fill all required fields');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await api.post('/admin/buildings', {
        name,
        description,
        address,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      });
      
      navigation.navigate('QRCode', { buildingId: response.data.building._id });
    } catch (err) {
      console.error('Error adding building:', err);
      setError(err.response?.data?.error || 'Failed to add building');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <ScrollView style={globalStyles.container}>
      <Text style={globalStyles.title}>Add New Building</Text>
      
      {error ? <Text style={styles.error}>{error}</Text> : null}
      
      <TextInput
        placeholder="Building Name *"
        value={name}
        onChangeText={setName}
      />
      
      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      
      <TextInput
        placeholder="Address *"
        value={address}
        onChangeText={setAddress}
      />
      
      <View style={styles.locationContainer}>
        <TextInput
          placeholder="Latitude *"
          value={latitude}
          onChangeText={setLatitude}
          keyboardType="numeric"
          style={styles.locationInput}
        />
        
        <TextInput
          placeholder="Longitude *"
          value={longitude}
          onChangeText={setLongitude}
          keyboardType="numeric"
          style={styles.locationInput}
        />
      </View>
      
      <AnimatedButton
        title="Use Current Location"
        onPress={handleUseCurrentLocation}
        // eslint-disable-next-line react-native/no-inline-styles
        style={{ backgroundColor: 'green' }}
      />
      
      <AnimatedButton
        title="Add Building"
        onPress={handleSubmit}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  error: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locationInput: {
    width: '48%',
  },
});

export default AddBuildingScreen;
