import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Share, Alert } from 'react-native';
import { globalStyles } from '../../constants/styles';
import QRCodeModal from '../../components/QRCodeModal';
import api from '../../services/api';
import AnimatedButton from '../../components/AnimatedButton';
import LoadingIndicator from '../../components/LoadingIndicator';

const QRCodeScreen = ({ route }) => {
  const { buildingId } = route.params;
  const [building, setBuilding] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBuildingData = async () => {
      try {
        const response = await api.get(`/admin/buildings/${buildingId}/qrcode`);
        const buildingData = response.data;
        
        setBuilding(buildingData.building);
        
        // Construct the correct QR code image URL
        if (buildingData.qrCodeUrl) {
          // Use the URL provided by the backend
          setQrCodeUrl(buildingData.qrCodeUrl);
        } else {
          setError('QR code not available for this building');
        }
      } catch (err) {
        console.error('Error fetching building data:', err);
        setError('Failed to load building data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBuildingData();
  }, [buildingId]);

  const handleShareQRCode = async () => {
    if (!qrCodeUrl) {
      Alert.alert('Error', 'No QR code available to share');
      return;
    }

    try {
      await Share.share({
        message: `QR Code for ${building?.name || 'Building'}`,
        url: qrCodeUrl,
      });
    } catch (error) {
      console.error('Error sharing QR code:', error);
      Alert.alert('Error', 'Failed to share QR code');
    }
  };

  const handleRetry = async () => {
    setLoading(true);
    setError(null);
    // Re-fetch data by re-triggering useEffect
    const response = await api.get(`/admin/buildings/${buildingId}/qrcode`);
    if (response.data) {
      setBuilding(response.data.building);
      setQrCodeUrl(response.data.qrCodeUrl || '');
    } else {
      setError('Failed to load data');
    }
    setLoading(false);
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return (
      <View style={globalStyles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <AnimatedButton
          title="Retry"
          onPress={handleRetry}
        />
      </View>
    );
  }

  if (!building) {
    return (
      <View style={globalStyles.container}>
        <Text style={styles.errorText}>Building not found</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>{building.name}</Text>
      <Text style={styles.address}>{building.address}</Text>
      <Text style={styles.detailText}>{building.description || 'No description available'}</Text>
      
      {qrCodeUrl ? (
        <>
          <Image
            source={{ uri: qrCodeUrl }}
            style={styles.qrCodePreview}
            resizeMode="contain"
            onError={(error) => {
              console.error('QR Code image failed to load:', error);
              setError('Failed to load QR code image');
            }}
          />
          
          <AnimatedButton
            title="View Full QR Code"
            onPress={() => setModalVisible(true)}
          />
          
          <AnimatedButton
            title="Share QR Code"
            onPress={handleShareQRCode}
            style={{ backgroundColor: 'green' }}
          />
        </>
      ) : (
        <Text style={styles.noQrText}>No QR Code available for this building</Text>
      )}
      
      <QRCodeModal
        visible={modalVisible}
        qrCodeUrl={qrCodeUrl}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  address: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 20,
  },
  qrCodePreview: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  noQrText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default QRCodeScreen;