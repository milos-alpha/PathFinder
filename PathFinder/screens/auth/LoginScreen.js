import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { globalStyles } from '../../constants/styles';
import { colors } from '../../constants/colors';
import AnimatedButton from '../../components/AnimatedButton';
import { AuthContext } from '../../context/AuthContext';
import TextInput from '../../components/TextInput';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    setError('');
    const result = await login(email, password);
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={globalStyles.container}
    >
      <Text style={globalStyles.title}>Login</Text>
      
      {error ? <Text style={styles.error}>{error}</Text> : null}
      
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <AnimatedButton title="Login" onPress={handleLogin} />
      
      <View style={styles.footer}>
        <Text>Don't have an account? </Text>
        <Text
          style={styles.link}
          onPress={() => navigation.navigate('Register')}
        >
          Register
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  error: {
    color: colors.danger,
    marginBottom: 15,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  link: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
