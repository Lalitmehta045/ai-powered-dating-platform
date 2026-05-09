import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './api/baseApi';
import { adminBaseApi } from './api/adminBaseApi';
import authReducer from './slices/authSlice';
import messageReducer from './slices/messageSlice';
import adminAuthReducer from './slices/adminAuthSlice';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    [adminBaseApi.reducerPath]: adminBaseApi.reducer,
    auth: authReducer,
    message: messageReducer,
    adminAuth: adminAuthReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware, adminBaseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
