/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Share } from 'react-native';
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

  useEffect(() => {
    const fetchBuilding = async () => {
      try {
        const response = await api.get(`/admin/buildings/${buildingId}/qrcode`);
        setBuilding(response.data);
        setQrCodeUrl(response.data.qrCode.imageUrl);
      } catch (error) {
        console.error('Error fetching QR code:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBuilding();
  }, [buildingId]);

  const handleShareQRCode = async () => {
    try {
      await Share.share({
        message: `QR Code for ${building.name}`,
        url: qrCodeUrl,
      });
    } catch (error) {
      console.error('Error sharing QR code:', error);
    }
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  if (!building) {
    return (
      <View style={globalStyles.container}>
        <Text>Building not found</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>{building.name}</Text>
      <Text style={styles.address}>{building.address}</Text>
      
      {qrCodeUrl ? (
        <>
          <Image
            source={{ uri: qrCodeUrl }}
            style={styles.qrCodePreview}
            resizeMode="contain"
            onPress={() => setModalVisible(true)}
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
        <Text>No QR Code available</Text>
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
});

export default QRCodeScreen;
