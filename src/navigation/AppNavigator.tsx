import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from '../components/Auth/Login';
import AdminDashboard from '../components/Admin/AdminDashboard';
import VendorDashboard from '../components/Vendor/VendorDashboard';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store';
import AuthService from '../services/AuthService';
import { setUser } from '../redux/slices/authSlice';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  
  useEffect(() => {
    const initializeUser = async () => {
      const user = await AuthService.getUser();
      if (user) {
        dispatch(setUser(user));
        if (user.role === 'admin') {
          setInitialRoute('AdminDashboard');
        } else if (user.role === 'vendor') {
          setInitialRoute('VendorDashboard');
        }
      } else {
        setInitialRoute('Login');
      }
    };
    initializeUser();
  }, [dispatch]);
  
  if (initialRoute === null) {
    return null; // Or show a loading spinner
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} options={{ headerTitle: 'Admin Dashboard' }} />
        <Stack.Screen name="VendorDashboard" component={VendorDashboard} options={{ headerTitle: 'Vendor Dashboard' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
