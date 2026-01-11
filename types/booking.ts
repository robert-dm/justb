import { Provider } from './provider';
import { Coordinates } from './user';

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'on-the-way'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'card' | 'cash';
export type DeliveryType = 'delivery' | 'pickup';
export type RecurringFrequency = 'daily' | 'weekdays' | 'weekends';

export interface BookingItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface DeliveryAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  coordinates?: Coordinates;
  notes?: string;
}

export interface Pricing {
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
}

export interface PaymentInfo {
  method: PaymentMethod;
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  paidAt?: string;
}

export interface RecurringSettings {
  enabled: boolean;
  frequency: RecurringFrequency;
  endDate?: string;
}

export interface Review {
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Booking {
  _id: string;
  userId: string;
  providerId: Provider;
  items: BookingItem[];
  deliveryDate: string;
  deliveryTime: string;
  deliveryType: DeliveryType;
  deliveryAddress?: DeliveryAddress;
  pricing: Pricing;
  payment: PaymentInfo;
  status: BookingStatus;
  specialInstructions?: string;
  recurring?: RecurringSettings;
  review?: Review;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingData {
  providerId: string;
  items: Omit<BookingItem, 'name' | 'price'>[];
  deliveryDate: string;
  deliveryTime: string;
  deliveryType: DeliveryType;
  deliveryAddress?: DeliveryAddress;
  pricing: Pricing;
  specialInstructions?: string;
  recurring?: RecurringSettings;
}

export interface AddReviewData {
  rating: number;
  comment?: string;
}
