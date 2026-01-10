import { api } from './client';
import {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  UpdateProfileData,
  User,
  ApiResponse,
} from '@/types';

export const authApi = {
  register: (data: RegisterData) =>
    api.post<AuthResponse>('/auth/register', data),

  login: (credentials: LoginCredentials) =>
    api.post<AuthResponse>('/auth/login', credentials),

  getMe: () =>
    api.get<{ success: boolean; user: User }>('/auth/me'),

  getProfile: () =>
    api.get<{ success: boolean; user: User }>('/auth/me'),

  updateProfile: (data: UpdateProfileData) =>
    api.put<{ success: boolean; user: User }>('/auth/profile', data),
};
