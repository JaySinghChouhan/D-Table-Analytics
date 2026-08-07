import { createSlice } from '@reduxjs/toolkit';

const stored = localStorage.getItem('attendance_auth');
const parsed = stored ? JSON.parse(stored) : null;

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
