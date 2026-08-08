import { createSlice } from '@reduxjs/toolkit';

// Safe localStorage parsing to prevent app crashes on invalid JSON
const getInitialAuth = () => {
  try {
    const stored = localStorage.getItem('attendance_auth');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to parse auth data from localStorage:', error);
    localStorage.removeItem('attendance_auth');
    return null;
  }
};

const parsed = getInitialAuth();

const initialState = {
  user: parsed?.user || null,
  token: parsed?.token || null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem(
        'attendance_auth',
        JSON.stringify({ user: action.payload.user, token: action.payload.token })
      );
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('attendance_auth');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export const selectCurrentUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export default authSlice.reducer;