import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import ApiService from '../../services/ApiService';
import SocketService from '../../services/SocketService';
import { updateVehicleLocation, setVehicleLocations } from '../../redux/slices/vehicleSlice';
import { RootState, AppDispatch } from '../../redux/store';
import AuthService from '../../services/AuthService';
import { logout as logoutAction } from '../../redux/slices/authSlice';

const AdminDashboard = ({ navigation }: { navigation: any }) => {
  const dispatch = useDispatch<AppDispatch>();
  const vehicleLocations = useSelector((state: RootState) => state.vehicles.locations);

  const logout = async () => {
    await AuthService.logout();
    dispatch(logoutAction());
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }]
    });
  };

  useEffect(() => {
    // Fetch initial vehicle locations
    const fetchVehicleLocations = async () => {
      try {
        const response = await ApiService.get('/vehicleLocations');
        dispatch(setVehicleLocations(response.data));
      } catch (error) {
        console.error('Error fetching vehicle locations:', error);
      }
    };

    fetchVehicleLocations();

    // Connect to Socket.IO and listen for location updates
    SocketService.connect();

    SocketService.on('locationUpdate', (location) => {
      dispatch(updateVehicleLocation(location));
    });

    return () => {
      SocketService.disconnect();
    };
  }, [dispatch]);

  return (
    <View style={styles.map}>
      <MapView
        style={styles.map}
        region={{
          latitude: 25.2048,
          longitude: 55.2708,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {vehicleLocations.map((location, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: location.currentLocation.latitude, longitude: location.currentLocation.longitude }}
            title={location.vehicleId}
          />
        ))}
        </MapView>
      <Button title="Logout" onPress={logout} />
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

export default AdminDashboard;
