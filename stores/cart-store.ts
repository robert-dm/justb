'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MenuItem, Provider, DeliveryType, DeliveryAddress } from '@/types';

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface DeliveryInfo {
  type: DeliveryType;
  date: string;
  time: string;
  address?: DeliveryAddress;
}

interface CartState {
  items: CartItem[];
  providerId: string | null;
  provider: Provider | null;
  deliveryInfo: DeliveryInfo | null;
}

interface CartActions {
  addItem: (item: MenuItem) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  setProvider: (provider: Provider) => void;
  setDeliveryInfo: (info: DeliveryInfo) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getDeliveryFee: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

type CartStore = CartState & CartActions;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // State
      items: [],
      providerId: null,
      provider: null,
      deliveryInfo: null,

      // Actions
      addItem: (item) => {
        const { items, providerId, provider } = get();

        // If cart has items from a different provider, clear it
        if (providerId && providerId !== item.providerId) {
          set({
            items: [],
            providerId: item.providerId,
            provider: null,
            deliveryInfo: null,
          });
        }

        const existingItem = items.find((i) => i.menuItemId === item._id);

        if (existingItem) {
          set({
            items: items.map((i) =>
              i.menuItemId === item._id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                menuItemId: item._id,
                name: item.name,
                price: item.price,
                quantity: 1,
                image: item.image,
              },
            ],
            providerId: item.providerId,
          });
        }
      },

      removeItem: (menuItemId) => {
        const { items } = get();
        const newItems = items.filter((i) => i.menuItemId !== menuItemId);

        if (newItems.length === 0) {
          set({
            items: [],
            providerId: null,
            provider: null,
            deliveryInfo: null,
          });
        } else {
          set({ items: newItems });
        }
      },

      updateQuantity: (menuItemId, quantity) => {
        const { items } = get();

        if (quantity <= 0) {
          get().removeItem(menuItemId);
          return;
        }

        set({
          items: items.map((i) =>
            i.menuItemId === menuItemId ? { ...i, quantity } : i
          ),
        });
      },

      setProvider: (provider) => {
        set({ provider, providerId: provider._id });
      },

      setDeliveryInfo: (info) => {
        set({ deliveryInfo: info });
      },

      clearCart: () => {
        set({
          items: [],
          providerId: null,
          provider: null,
          deliveryInfo: null,
        });
      },

      getSubtotal: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getDeliveryFee: () => {
        const { provider, deliveryInfo } = get();
        if (!provider || deliveryInfo?.type === 'pickup') return 0;
        return provider.deliveryFee;
      },

      getTotal: () => {
        return get().getSubtotal() + get().getDeliveryFee();
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        providerId: state.providerId,
        provider: state.provider,
        deliveryInfo: state.deliveryInfo,
      }),
    }
  )
);

// Selector hooks
export const useCartItems = () => useCartStore((state) => state.items);
export const useCartItemCount = () =>
  useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
export const useCartProvider = () => useCartStore((state) => state.provider);
