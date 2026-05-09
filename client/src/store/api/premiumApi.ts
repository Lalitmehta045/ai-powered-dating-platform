import { baseApi } from './baseApi';

interface CreateOrderPayload {
  planId: string; // e.g., 'premium_monthly'
}

interface CreateOrderResponse {
  success: boolean;
  data: {
    orderId: string;
    amount: number;
    currency: string;
    keyId: string; // Razorpay public key
  };
}

interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface VerifyPaymentResponse {
  success: boolean;
  message: string;
}

export const premiumApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation<CreateOrderResponse, CreateOrderPayload>({
      query: (data) => ({
        url: '/payments/create-order',
        method: 'POST',
        body: data,
      }),
    }),
    verifyPayment: builder.mutation<VerifyPaymentResponse, VerifyPaymentPayload>({
      query: (data) => ({
        url: '/payments/verify',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'], // Upgrades them to premium in state
    }),
    activateBoost: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: '/users/boost',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const { 
  useCreateOrderMutation, 
  useVerifyPaymentMutation,
  useActivateBoostMutation
} = premiumApi;
