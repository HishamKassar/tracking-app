import axios from 'axios';
import store from '../redux/store';
import AuthService from './AuthService';
import { logout } from '../redux/slices/authSlice';
import config from '../../config';

const ApiService = axios.create({
  baseURL: config.apiBaseURL,
});

ApiService.interceptors.request.use((config) => {
  const token = store.getState().auth.user?.token;
  if (token) {
    config.headers.Authorization = `${token}`;
  }
  return config;
});

ApiService.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      await AuthService.logout();
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export default ApiService;
