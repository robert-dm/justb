import { api } from './client';
import {
  MenuItemsResponse,
  MenuItemResponse,
  MenuItemFilters,
  CreateMenuItemData,
  UpdateMenuItemData,
} from '@/types';

export const menuItemsApi = {
  getAll: (filters?: MenuItemFilters) => {
    const params = new URLSearchParams();

    if (filters?.search) params.append('search', filters.search);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.minPrice !== undefined) params.append('minPrice', String(filters.minPrice));
    if (filters?.maxPrice !== undefined) params.append('maxPrice', String(filters.maxPrice));

    const queryString = params.toString();
    return api.get<MenuItemsResponse>(`/menu-items/all${queryString ? `?${queryString}` : ''}`);
  },

  getByProvider: (providerId: string, filters?: MenuItemFilters) => {
    const params = new URLSearchParams();

    if (filters?.search) params.append('search', filters.search);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.available !== undefined) params.append('available', String(filters.available));

    const queryString = params.toString();
    return api.get<MenuItemsResponse>(
      `/menu-items/provider/${providerId}${queryString ? `?${queryString}` : ''}`
    );
  },

  getById: (id: string) =>
    api.get<MenuItemResponse>(`/menu-items/${id}`),

  create: (providerId: string, data: CreateMenuItemData) =>
    api.post<MenuItemResponse>(`/menu-items/provider/${providerId}`, data),

  update: (id: string, data: UpdateMenuItemData) =>
    api.put<MenuItemResponse>(`/menu-items/${id}`, data),

  delete: (id: string) =>
    api.delete<{ success: boolean }>(`/menu-items/${id}`),

  toggleAvailability: (id: string) =>
    api.patch<MenuItemResponse>(`/menu-items/${id}/toggle-availability`),
};
