export type UserRole = 'tourist' | 'provider' | 'admin';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  coordinates?: Coordinates;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: Address;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  phone?: string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  address?: Address;
}
