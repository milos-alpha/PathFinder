    import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { globalStyles } from '../constants/styles';
import { AuthContext } from '../context/AuthContext';
import UserAvatar from '../components/UserAvatar';

const ProfileScreen = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <View style={globalStyles.container}>
      <View style={styles.profileHeader}>
        <UserAvatar name={user?.name || 'User'} size={80} />
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <Text style={styles.userRole}>Role: {user?.role}</Text>
      </View>
      
      <TouchableOpacity style={globalStyles.button} onPress={logout}>
        <Text style={globalStyles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  userEmail: {
    fontSize: 16,
    color: 'gray',
    marginTop: 5,
  },
  userRole: {
    fontSize: 16,
    marginTop: 5,
  },
});

export default ProfileScreen;
