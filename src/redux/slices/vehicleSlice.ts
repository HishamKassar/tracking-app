import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CurrentLocation {
  latitude: number;
  longitude: number;
}

interface Location {
  tripId: string;
  vehicleId: string;
  vendorId: string;
  currentLocation: CurrentLocation;
  status: string;
  updatedAt: Date;
}

interface VehicleState {
  locations: Location[];
}

const initialState: VehicleState = {
  locations: [],
};

const vehicleSlice = createSlice({
  name: 'vehicles',
  initialState,
  reducers: {
    setVehicleLocations(state, action: PayloadAction<Location[]>) {
      state.locations = action.payload;
    },
    updateVehicleLocation(state, action: PayloadAction<Location>) {
      const updatedLocation = action.payload;
      const index = state.locations.findIndex(location => location.vehicleId === updatedLocation.vehicleId);
      if (index !== -1) {
        state.locations[index] = updatedLocation;
      } else {
        state.locations.push(updatedLocation);
      }
    },
  },
});

export const { setVehicleLocations, updateVehicleLocation } = vehicleSlice.actions;
export default vehicleSlice.reducer;
