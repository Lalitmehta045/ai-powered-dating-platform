import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { logout } from '../slices/adminAuthSlice';

const getBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return url.endsWith('/api/v1') ? url.replace(/\/api\/v1$/, '') : url;
};

const baseQuery = fetchBaseQuery({ 
  baseUrl: getBaseUrl(),
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as any).adminAuth.token || localStorage.getItem('adminToken');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  if (result.error && result.error.status === 401) {
    // Force logout on unauthorized admin
    api.dispatch(logout());
    window.location.href = '/admin/login';
  }
  
  return result;
};

export const adminBaseApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['AdminAnalytics', 'AdminUsers'],
  endpoints: () => ({}),
});
