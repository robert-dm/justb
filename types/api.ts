import { User } from './user';
import { Provider } from './provider';
import { MenuItem } from './menu-item';
import { Booking } from './booking';

// Generic API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

// Auth Responses
export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

// Provider Responses
export interface ProvidersResponse {
  success: boolean;
  providers: Provider[];
  count: number;
}

export interface ProviderResponse {
  success: boolean;
  provider: Provider;
}

// Menu Item Responses
export interface MenuItemsResponse {
  success: boolean;
  menuItems: MenuItem[];
  count: number;
}

export interface MenuItemResponse {
  success: boolean;
  menuItem: MenuItem;
}

// Booking Responses
export interface BookingsResponse {
  success: boolean;
  bookings: Booking[];
  count: number;
}

export interface BookingResponse {
  success: boolean;
  booking: Booking;
}

// Payment Responses
export interface PaymentIntentResponse {
  success: boolean;
  clientSecret: string;
  paymentIntentId: string;
}

export interface PaymentConfirmResponse {
  success: boolean;
  booking: Booking;
}

// Error Response
export interface ApiError {
  success: false;
  message: string;
  error?: string;
}
