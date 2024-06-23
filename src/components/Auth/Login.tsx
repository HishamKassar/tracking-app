import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { login } from '../../redux/slices/authSlice';
import { RootState, AppDispatch } from '../../redux/store';

const Login = ({ navigation }: { navigation: any }) => {
  const [username, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);

  const handleLogin = async () => {
    const resultAction = await dispatch(login({ username, password }));
    if (login.fulfilled.match(resultAction)) {
      const { role } = resultAction.payload;
      if (role === 'admin') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'AdminDashboard' }]
        });
      } else if (role === 'vendor') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'VendorDashboard' }]
        });
      }
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
      {auth.status === 'loading' && <Text>Loading...</Text>}
      {auth.error && <Text style={styles.error}>Error: {auth.error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
  error: {
    color: 'red',
  },
});

export default Login;
