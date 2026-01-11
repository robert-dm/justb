import { api } from './client';
import {
  ProvidersResponse,
  ProviderResponse,
  ProviderFilters,
  CreateProviderData,
  UpdateProviderData,
} from '@/types';

export const providersApi = {
  getAll: (filters?: ProviderFilters) => {
    const params = new URLSearchParams();

    if (filters?.lat !== undefined) params.append('lat', String(filters.lat));
    if (filters?.lng !== undefined) params.append('lng', String(filters.lng));
    if (filters?.radius !== undefined) params.append('radius', String(filters.radius));
    if (filters?.cuisine) params.append('cuisine', filters.cuisine);
    if (filters?.delivery !== undefined) params.append('delivery', String(filters.delivery));
    if (filters?.pickup !== undefined) params.append('pickup', String(filters.pickup));
    if (filters?.minRating !== undefined) params.append('minRating', String(filters.minRating));

    const queryString = params.toString();
    return api.get<ProvidersResponse>(`/providers${queryString ? `?${queryString}` : ''}`);
  },

  getById: (id: string) =>
    api.get<ProviderResponse>(`/providers/${id}`),

  getMyProfile: () =>
    api.get<ProviderResponse>('/providers/my-profile'),

  create: (data: CreateProviderData) =>
    api.post<ProviderResponse>('/providers', data),

  update: (id: string, data: UpdateProviderData) =>
    api.put<ProviderResponse>(`/providers/${id}`, data),

  delete: (id: string) =>
    api.delete<{ success: boolean }>(`/providers/${id}`),
};
