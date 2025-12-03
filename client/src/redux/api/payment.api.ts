import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface CreatePaymentIntentRequest {
  amount: number;
}

export interface CreatePaymentIntentResponse {
  success: boolean;
  client_secret: string;
  message: string;
}

import { CartItem, ShippingInfo } from '../../types/api-types';

export interface CreateZaloPayOrderRequest {
  amount: number;
  description: string;
  items: any[];
  app_user?: string;
  shippingInfo: ShippingInfo;
  subTotal: number;
  tax: number;
  shippingCharges: number;
  total: number;
  orderItems: CartItem[];
}

export interface CreateZaloPayOrderResponse {
  returncode: number;
  returnmessage: string;
  orderurl: string;
  zptranstoken: string;
}

export const paymentApi = createApi({
  reducerPath: 'paymentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/payments',
    credentials: 'include',
  }),
  endpoints: (builder) => ({
    // createPaymentIntent removed
    createZaloPayOrder: builder.mutation<CreateZaloPayOrderResponse, CreateZaloPayOrderRequest>({
      query: (orderData) => ({
        url: 'zalopay/create',
        method: 'POST',
        body: orderData,
      }),
    }),
    checkZaloPayStatus: builder.mutation<{ returncode: number, returnmessage: string }, { orderId: string }>({
      query: (data) => ({
        url: 'zalopay/check-status',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useCreateZaloPayOrderMutation,
  useCheckZaloPayStatusMutation,
} = paymentApi;
