import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { globalStyles } from '../../constants/styles';
import AnimatedButton from '../../components/AnimatedButton';
import { AuthContext } from '../../context/AuthContext';
import TextInput from '../../components/TextInput';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);

  const handleRegister = async () => {
    setError('');
    const result = await register(name, email, password);
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={globalStyles.container}
    >
      <Text style={globalStyles.title}>Register</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />

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
      <AnimatedButton title="Register" onPress={handleRegister} />

      <View style={styles.footer}>
        <Text>Already have an account? </Text>
        <Text
          style={styles.link}
          onPress={() => navigation.navigate('Login')}
        >
          Login
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  error: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  link: {
    color: 'blue',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
