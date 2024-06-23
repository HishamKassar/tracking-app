import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from './ApiService';

const AuthService = {
  login: async (username: string, password: string) => {
    const response = await ApiService.post('/auth/login', { username, password });
    const { role, token } = response.data;
    const user = { username, role, token };
    await AsyncStorage.setItem('user', JSON.stringify(user));
    return user;
  },
  logout: async () => {
    await AsyncStorage.removeItem('user');
  },
  getUser: async () => {
    const user = await AsyncStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

export default AuthService;
