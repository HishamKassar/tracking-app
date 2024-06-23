import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, PermissionsAndroid, Platform, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import ApiService from '../../services/ApiService';
import SocketService from '../../services/SocketService';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../redux/store';
import { logout as logoutAction } from '../../redux/slices/authSlice';
import AuthService from '../../services/AuthService';

interface Location {
    latitude: number;
    longitude: number;
}

interface Trip {
  id: string;
  vehicleId: string;
  vendorId: string;
  pickUpLocation: Location;
  dropOffLocation: Location;
  status: string;
}

const VendorDashboard = ({ navigation }: { navigation: any }) => {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState<boolean>(false);
  const [isTripActive, setIsTripActive] = useState<boolean>(false);
  const dispatch = useDispatch<AppDispatch>();

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setLocationPermissionGranted(true);
        } else {
          setLocationPermissionGranted(false);
        }
      } else {
        setLocationPermissionGranted(true);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const fetchTrip = async () => {
    try {
      const response = await ApiService.get('/trips/vendor');
      if (response.data) {
        const tripData = response.data;
        setTrip(tripData);
        if (tripData.status == "started") {
          SocketService.connect();
          Geolocation.getCurrentPosition(position => {
            SocketService.emit('updateLocation', {
              location: {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
              },
              vehicleId: tripData.vehicleId,
              tripId: tripData.id,
            });
          });

          setIsTripActive(true);
        } else {
          setIsTripActive(false);
        }
      } else {
        Alert.alert('No trip for today');
      }
    } catch (error) {
      console.error('Error fetching trip:', error);
    }
  };

  const startTrip = async () => {
    if (trip && locationPermissionGranted) {
      SocketService.connect();

      try {
        await ApiService.put(`/trips/status/${trip.id}`, { status: 'started' });
        setIsTripActive(true);

        Geolocation.getCurrentPosition(position => {
          SocketService.emit('updateLocation', {
            location: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            },
            vehicleId: trip.vehicleId,
            tripId: trip.id,
          });
        });

      } catch (error) {
        console.error('Error starting trip:', error);
      }

      const watchId = Geolocation.watchPosition(
        (position) => {
          SocketService.emit('updateLocation', {
            location: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            },
            vehicleId: trip.vehicleId,
            tripId: trip.id,
          });
        },
        (error) => console.log(error),
        { enableHighAccuracy: true, distanceFilter: 10 }
      );

      return () => {
        Geolocation.clearWatch(watchId);
        SocketService.disconnect();
      };
    }
  };

  const stopTrip = async () => {
    if (trip) {
      setIsTripActive(false);
      try {
        await ApiService.put(`/trips/status/${trip.id}`, { status: 'finished' });
        setTrip(null);
        SocketService.emit('updateFinishedStatus', {});
        SocketService.disconnect();
      } catch (error) {
        console.error('Error stopping trip:', error);
      }
    }
  };
  
  const logout = async () => {
    await AuthService.logout();
    dispatch(logoutAction());
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }]
    });
  };

  useEffect(() => {
    requestLocationPermission();
    fetchTrip();
  }, []);

  return (
    <View style={styles.container}>
      {(trip && trip.id) ? (
        <View>
          <Text style={{marginBottom: 10}}>Trip ID: {trip.id}</Text>
          <Text style={{marginBottom: 10}}>PickUp: {trip.pickUpLocation.longitude}, {trip.pickUpLocation.latitude}</Text>
          <Text style={{marginBottom: 15}}>DropOff: {trip.dropOffLocation.longitude}, {trip.dropOffLocation.latitude}</Text>
          {isTripActive ? (
            <Button title="Stop Trip" onPress={stopTrip} />
          ) : (
            <Button title="Start Trip" onPress={startTrip} />
          )}
        </View>
      ) : (
        <Text>No trip for today</Text>
      )}
      {!locationPermissionGranted && (
        <Text style={styles.error}>Location permission is required to use this feature.</Text>
      )}
      <View style={{height: 25}}></View>
      <Button title="Logout" onPress={logout} />
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
  error: {
    color: 'red',
  },
});

export default VendorDashboard;
