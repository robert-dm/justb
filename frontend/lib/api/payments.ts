import { api } from './client';
import { PaymentIntentResponse, PaymentConfirmResponse } from '@/types';

export const paymentsApi = {
  createIntent: (bookingId: string, amount: number) =>
    api.post<PaymentIntentResponse>('/payments/create-intent', {
      bookingId,
      amount,
    }),

  confirm: (paymentIntentId: string, bookingId: string) =>
    api.post<PaymentConfirmResponse>('/payments/confirm', {
      paymentIntentId,
      bookingId,
    }),
};
