import { Coordinates } from './user';

export interface ProviderAddress {
  street: string;
  city: string;
  state?: string;
  zipCode: string;
  country: string;
  coordinates: Coordinates;
}

export interface ServiceType {
  delivery: boolean;
  pickup: boolean;
}

export interface DaySchedule {
  open?: string;
  close?: string;
  closed?: boolean;
}

export interface OperatingHours {
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
}

export interface DeliverySlot {
  time: string;
  maxOrders: number;
}

export interface Rating {
  average: number;
  count: number;
}

export interface Provider {
  _id: string;
  userId: string;
  businessName: string;
  description: string;
  cuisine: string[];
  serviceType: ServiceType;
  deliveryRadius: number;
  minimumOrder: number;
  deliveryFee: number;
  address: ProviderAddress;
  images: string[];
  operatingHours?: OperatingHours;
  deliverySlots: DeliverySlot[];
  rating: Rating;
  verified: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderFilters {
  lat?: number;
  lng?: number;
  radius?: number;
  cuisine?: string;
  delivery?: boolean;
  pickup?: boolean;
  minRating?: number;
}

export interface CreateProviderData {
  businessName: string;
  description: string;
  cuisine?: string[];
  serviceType?: ServiceType;
  deliveryRadius?: number;
  minimumOrder?: number;
  deliveryFee?: number;
  address: ProviderAddress;
  images?: string[];
  operatingHours?: OperatingHours;
  deliverySlots?: DeliverySlot[];
}

export interface UpdateProviderData extends Partial<CreateProviderData> {}
