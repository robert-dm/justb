import { api } from './client';
import { PaymentIntentResponse, PaymentConfirmResponse, Booking } from '@/types';

interface SimulatePaymentResponse {
  success: boolean;
  message: string;
  bookings: Booking[];
}

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

  simulate: (params: { bookingId?: string; groupId?: string }) =>
    api.post<SimulatePaymentResponse>('/payments/simulate', params),
};
