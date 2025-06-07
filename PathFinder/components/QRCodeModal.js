import React from 'react';
import { Modal, View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../constants/colors';

const QRCodeModal = ({ visible, qrCodeUrl, onClose }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Building QR Code</Text>
          {qrCodeUrl ? (
            <Image source={{ uri: qrCodeUrl }} style={styles.qrCode} resizeMode="contain" />
          ) : (
            <Text>No QR Code available</Text>
          )}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: colors.dark,
  },
  qrCode: {
    width: 200,
    height: 200,
    marginBottom: 15,
  },
  closeButton: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default QRCodeModal;
