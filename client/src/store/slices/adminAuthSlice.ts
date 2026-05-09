import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AdminState {
  admin: any | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const getStoredAdmin = () => {
  try {
    const admin = localStorage.getItem('admin');
    return admin ? JSON.parse(admin) : null;
  } catch (error) {
    return null;
  }
};

const initialState: AdminState = {
  admin: getStoredAdmin(),
  token: localStorage.getItem('adminToken'),
  isAuthenticated: !!localStorage.getItem('adminToken'),
  isLoading: false,
  error: null,
};

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ admin: any; token: string }>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.admin = action.payload.admin;
      state.token = action.payload.token;
      state.error = null;
      localStorage.setItem('adminToken', action.payload.token);
      localStorage.setItem('admin', JSON.stringify(action.payload.admin));
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.admin = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      localStorage.removeItem('adminToken');
      localStorage.removeItem('admin');
    },
    updateAdmin: (state, action: PayloadAction<any>) => {
      state.admin = action.payload;
      localStorage.setItem('admin', JSON.stringify(action.payload));
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateAdmin } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;
