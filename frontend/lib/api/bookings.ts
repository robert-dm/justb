import { api } from './client';
import {
  BookingsResponse,
  BookingResponse,
  CreateBookingData,
  AddReviewData,
  BookingStatus,
} from '@/types';

export const bookingsApi = {
  create: (data: CreateBookingData) =>
    api.post<BookingResponse>('/bookings', data),

  getUserBookings: () =>
    api.get<BookingsResponse>('/bookings/user'),

  getProviderBookings: () =>
    api.get<BookingsResponse>('/bookings/provider'),

  getById: (id: string) =>
    api.get<BookingResponse>(`/bookings/${id}`),

  updateStatus: (id: string, status: BookingStatus) =>
    api.put<BookingResponse>(`/bookings/${id}/status`, { status }),

  cancel: (id: string) =>
    api.put<BookingResponse>(`/bookings/${id}/cancel`),

  addReview: (id: string, data: AddReviewData) =>
    api.post<BookingResponse>(`/bookings/${id}/review`, data),
};
