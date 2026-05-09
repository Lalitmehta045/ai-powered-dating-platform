import { baseApi } from './baseApi';
import type { User } from '../slices/authSlice';

interface UpdateProfilePayload {
  bio?: string;
  age?: number;
  interests?: string[];
  gender?: string;
  profileImage?: string; // Assume base64 or URL for now
  settings?: {
    notificationsEnabled: boolean;
  };
}

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    updateProfile: builder.mutation<{ success: boolean; data: { user: User } }, UpdateProfilePayload>({
      query: (data) => ({
        url: '/users/update',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    uploadPhoto: builder.mutation<{ success: boolean; data: { photos: string[] } }, FormData>({
      query: (formData) => ({
        url: '/users/upload-photo',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const { useUpdateProfileMutation, useUploadPhotoMutation } = profileApi;
