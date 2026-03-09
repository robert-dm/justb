import { api } from './client';
import {
  BookingsResponse,
  BookingResponse,
  CreateBookingData,
  CreateBulkBookingData,
  BulkBookingResponse,
  AddReviewData,
  BookingStatus,
} from '@/types';

export const bookingsApi = {
  create: (data: CreateBookingData) =>
    api.post<BookingResponse>('/bookings', data),

  createBulk: (data: CreateBulkBookingData) =>
    api.post<BulkBookingResponse>('/bookings/bulk', data),

  getUserBookings: () =>
    api.get<BookingsResponse>('/bookings?type=user'),

  getProviderBookings: () =>
    api.get<BookingsResponse>('/bookings?type=provider'),

  getById: (id: string) =>
    api.get<BookingResponse>(`/bookings/${id}`),

  updateStatus: (id: string, status: BookingStatus) =>
    api.put<BookingResponse>(`/bookings/${id}`, { status }),

  cancel: (id: string) =>
    api.delete<BookingResponse>(`/bookings/${id}`),

  addReview: (id: string, data: AddReviewData) =>
    api.patch<BookingResponse>(`/bookings/${id}`, data),
};
