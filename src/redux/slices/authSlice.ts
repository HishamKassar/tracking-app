import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AuthService from '../../services/AuthService';

interface User {
  username: string;
  role: string;
  token: string;
}

interface AuthState {
  user: User | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }: { username: string; password: string }) => {
    const response = await AuthService.login(username, password);
    return { username: username, role: response.role, token: response.token };
  }
);

export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async () => {
    const user = await AuthService.getUser();
    return user;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.status = 'idle';
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(loadUser.fulfilled, (state, action: PayloadAction<User | null>) => {
        state.user = action.payload;
        state.status = 'idle';
      });
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
