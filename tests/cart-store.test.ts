import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '@/stores/cart-store';
import { MenuItem, Provider } from '@/types';

// Factory helpers
function makeMenuItem(overrides: Partial<MenuItem> = {}): MenuItem {
  return {
    _id: 'item-1',
    providerId: 'provider-1',
    name: 'Croissant',
    price: 5.0,
    category: 'continental',
    available: true,
    preparationTime: 10,
    allergens: [],
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

function makeProvider(overrides: Partial<Provider> = {}): Provider {
  return {
    _id: 'provider-1',
    userId: 'user-1',
    businessName: 'Test Bakery',
    description: 'A test bakery',
    cuisineTypes: ['continental'],
    deliveryOptions: { delivery: true, pickup: true },
    deliveryFee: 3.0,
    deliveryRadius: 5,
    deliveryTimeSlots: ['08:00'],
    operatingHours: {},
    address: { street: '123 Test St', city: 'Testville', coordinates: { lat: 0, lng: 0 } },
    rating: { average: 0, count: 0 },
    images: [],
    createdAt: '',
    updatedAt: '',
    ...overrides,
  } as Provider;
}

describe('Cart Store', () => {
  beforeEach(() => {
    // Reset cart between tests
    useCartStore.getState().clearCart();
  });

  describe('addItem', () => {
    it('adds a new item to an empty cart', () => {
      const store = useCartStore.getState();
      store.addItem(makeMenuItem());

      const { items, providerId } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0]).toMatchObject({
        menuItemId: 'item-1',
        name: 'Croissant',
        price: 5.0,
        quantity: 1,
      });
      expect(providerId).toBe('provider-1');
    });

    it('increments quantity when adding the same item twice', () => {
      const store = useCartStore.getState();
      const item = makeMenuItem();
      store.addItem(item);
      store.addItem(item);

      const { items } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(2);
    });

    it('adds multiple different items from the same provider', () => {
      const store = useCartStore.getState();
      store.addItem(makeMenuItem({ _id: 'item-1', name: 'Croissant', price: 5 }));
      store.addItem(makeMenuItem({ _id: 'item-2', name: 'Coffee', price: 3 }));

      const { items } = useCartStore.getState();
      expect(items).toHaveLength(2);
    });

    it('clears cart when adding item from a different provider', () => {
      const store = useCartStore.getState();
      store.addItem(makeMenuItem({ _id: 'item-1', providerId: 'provider-1' }));
      store.addItem(makeMenuItem({ _id: 'item-2', providerId: 'provider-2' }));

      const { items, providerId } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].menuItemId).toBe('item-2');
      expect(providerId).toBe('provider-2');
    });
  });

  describe('removeItem', () => {
    it('removes an item from the cart', () => {
      const store = useCartStore.getState();
      store.addItem(makeMenuItem({ _id: 'item-1' }));
      store.addItem(makeMenuItem({ _id: 'item-2', name: 'Coffee', price: 3 }));

      store.removeItem('item-1');

      const { items } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].menuItemId).toBe('item-2');
    });

    it('resets cart fully when removing the last item', () => {
      const store = useCartStore.getState();
      store.addItem(makeMenuItem());
      store.removeItem('item-1');

      const { items, providerId, provider, deliveryInfo } = useCartStore.getState();
      expect(items).toHaveLength(0);
      expect(providerId).toBeNull();
      expect(provider).toBeNull();
      expect(deliveryInfo).toBeNull();
    });
  });

  describe('updateQuantity', () => {
    it('updates item quantity', () => {
      const store = useCartStore.getState();
      store.addItem(makeMenuItem());
      store.updateQuantity('item-1', 5);

      expect(useCartStore.getState().items[0].quantity).toBe(5);
    });

    it('removes item when quantity set to 0', () => {
      const store = useCartStore.getState();
      store.addItem(makeMenuItem());
      store.updateQuantity('item-1', 0);

      expect(useCartStore.getState().items).toHaveLength(0);
    });

    it('removes item when quantity set to negative', () => {
      const store = useCartStore.getState();
      store.addItem(makeMenuItem());
      store.updateQuantity('item-1', -1);

      expect(useCartStore.getState().items).toHaveLength(0);
    });
  });

  describe('pricing calculations', () => {
    it('calculates subtotal from items', () => {
      const store = useCartStore.getState();
      store.addItem(makeMenuItem({ _id: 'item-1', price: 5 }));
      store.addItem(makeMenuItem({ _id: 'item-2', name: 'Coffee', price: 3 }));
      // Add another croissant for quantity 2
      store.addItem(makeMenuItem({ _id: 'item-1', price: 5 }));

      // 5*2 + 3*1 = 13
      expect(useCartStore.getState().getSubtotal()).toBe(13);
    });

    it('returns 0 delivery fee for pickup', () => {
      const store = useCartStore.getState();
      store.addItem(makeMenuItem());
      store.setProvider(makeProvider({ deliveryFee: 3 }));
      store.setDeliveryInfo({ type: 'pickup', date: '2026-03-10', time: '08:00' });

      expect(useCartStore.getState().getDeliveryFee()).toBe(0);
    });

    it('returns provider delivery fee for delivery type', () => {
      const store = useCartStore.getState();
      store.addItem(makeMenuItem());
      store.setProvider(makeProvider({ deliveryFee: 4.5 }));
      store.setDeliveryInfo({
        type: 'delivery',
        date: '2026-03-10',
        time: '08:00',
        address: { street: '123 St' },
      });

      expect(useCartStore.getState().getDeliveryFee()).toBe(4.5);
    });

    it('calculates total as subtotal + delivery fee', () => {
      const store = useCartStore.getState();
      store.addItem(makeMenuItem({ _id: 'item-1', price: 10 }));
      store.setProvider(makeProvider({ deliveryFee: 2 }));
      store.setDeliveryInfo({
        type: 'delivery',
        date: '2026-03-10',
        time: '08:00',
        address: { street: '123 St' },
      });

      expect(useCartStore.getState().getTotal()).toBe(12);
    });

    it('calculates item count as sum of quantities', () => {
      const store = useCartStore.getState();
      store.addItem(makeMenuItem({ _id: 'item-1', price: 5 }));
      store.addItem(makeMenuItem({ _id: 'item-1', price: 5 })); // qty 2
      store.addItem(makeMenuItem({ _id: 'item-2', name: 'Coffee', price: 3 })); // qty 1

      expect(useCartStore.getState().getItemCount()).toBe(3);
    });
  });

  describe('searchAddress', () => {
    it('stores search address', () => {
      const store = useCartStore.getState();
      store.setSearchAddress({ street: '456 Main St', lat: 40.7, lng: -74.0 });

      const { searchAddress } = useCartStore.getState();
      expect(searchAddress).toEqual({ street: '456 Main St', lat: 40.7, lng: -74.0 });
    });

    it('stores address with apt/floor/notes', () => {
      const store = useCartStore.getState();
      store.setSearchAddress({
        street: '456 Main St',
        lat: 40.7,
        lng: -74.0,
        apt: '4B',
        floor: '4',
        notes: 'Ring doorbell',
      });

      const { searchAddress } = useCartStore.getState();
      expect(searchAddress?.apt).toBe('4B');
      expect(searchAddress?.floor).toBe('4');
      expect(searchAddress?.notes).toBe('Ring doorbell');
    });
  });

  describe('clearCart', () => {
    it('resets all cart state', () => {
      const store = useCartStore.getState();
      store.addItem(makeMenuItem());
      store.setProvider(makeProvider());
      store.setDeliveryInfo({ type: 'delivery', date: '2026-03-10', time: '08:00' });

      store.clearCart();

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(0);
      expect(state.providerId).toBeNull();
      expect(state.provider).toBeNull();
      expect(state.deliveryInfo).toBeNull();
    });
  });
});
