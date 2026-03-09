import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Mocks ──────────────────────────────────────────────────────────

const mockUser = { _id: 'user-1', role: 'tourist' };
const mockProvider = { _id: 'provider-1', userId: 'user-1' };

vi.mock('@/lib/db', () => ({ default: vi.fn() }));
vi.mock('@/lib/auth', () => ({
  getAuthUser: vi.fn(),
  unauthorizedResponse: () =>
    Response.json({ success: false, message: 'Unauthorized' }, { status: 401 }),
  forbiddenResponse: (msg?: string) =>
    Response.json({ success: false, message: msg || 'Forbidden' }, { status: 403 }),
  errorResponse: (msg: string, status: number) =>
    Response.json({ success: false, message: msg }, { status }),
}));

// Track saved documents so we can assert on them
const savedBookings: Record<string, unknown>[] = [];

function makeBookingDoc(data: Record<string, unknown>) {
  const doc = {
    _id: data._id || `booking-${Date.now()}`,
    ...data,
    save: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
      return Promise.resolve(this);
    }),
    toObject: function () {
      return { ...this };
    },
  };
  savedBookings.push(doc);
  return doc;
}

vi.mock('@/lib/models/Booking', () => {
  const model = {
    create: vi.fn(),
    find: vi.fn(),
    findById: vi.fn(),
    findOne: vi.fn(),
  };
  return { default: model };
});

vi.mock('@/lib/models/Provider', () => {
  const model = {
    findById: vi.fn(),
    findOne: vi.fn(),
  };
  return { default: model };
});

import { getAuthUser } from '@/lib/auth';
import Booking from '@/lib/models/Booking';
import Provider from '@/lib/models/Provider';

// ── Helpers ────────────────────────────────────────────────────────

function makeRequest(url: string, init?: RequestInit) {
  return new NextRequest(new URL(url, 'http://localhost:3002'), init);
}

const sampleBookingData = {
  providerId: 'provider-1',
  items: [{ menuItemId: 'menu-1', name: 'Croissant', price: 5, quantity: 2 }],
  deliveryDate: '2026-03-10',
  deliveryTime: '08:00',
  deliveryType: 'delivery',
  deliveryAddress: { street: '123 Test St' },
  pricing: { subtotal: 10, deliveryFee: 2, tax: 0, total: 12 },
};

// ── Tests ──────────────────────────────────────────────────────────

describe('POST /api/bookings — create single booking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    savedBookings.length = 0;
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);

    const { POST } = await import('@/app/api/bookings/route');
    const req = makeRequest('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(sampleBookingData),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 404 when provider does not exist', async () => {
    vi.mocked(getAuthUser).mockResolvedValue(mockUser as never);
    vi.mocked(Provider.findById).mockResolvedValue(null);

    const { POST } = await import('@/app/api/bookings/route');
    const req = makeRequest('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(sampleBookingData),
    });
    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it('creates a booking and returns 201', async () => {
    vi.mocked(getAuthUser).mockResolvedValue(mockUser as never);
    vi.mocked(Provider.findById).mockResolvedValue(mockProvider);

    const createdBooking = makeBookingDoc({
      _id: 'booking-new',
      ...sampleBookingData,
      userId: 'user-1',
      status: 'pending',
      payment: { method: 'card', status: 'pending' },
    });
    vi.mocked(Booking.create).mockResolvedValue(createdBooking as never);

    const { POST } = await import('@/app/api/bookings/route');
    const req = makeRequest('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(sampleBookingData),
    });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.booking._id).toBe('booking-new');
    expect(Booking.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-1', providerId: 'provider-1' })
    );
  });
});

describe('GET /api/bookings — fetch user bookings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);

    const { GET } = await import('@/app/api/bookings/route');
    const req = makeRequest('/api/bookings?type=user');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns user bookings', async () => {
    vi.mocked(getAuthUser).mockResolvedValue(mockUser as never);

    const bookings = [
      makeBookingDoc({ _id: 'b1', userId: 'user-1', status: 'pending' }),
      makeBookingDoc({ _id: 'b2', userId: 'user-1', status: 'confirmed' }),
    ];

    const chainMock = {
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockResolvedValue(bookings),
    };
    vi.mocked(Booking.find).mockReturnValue(chainMock as never);

    const { GET } = await import('@/app/api/bookings/route');
    const req = makeRequest('/api/bookings?type=user');
    const res = await GET(req);
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(json.count).toBe(2);
    expect(json.bookings).toHaveLength(2);
  });

  it('filters by groupId when provided', async () => {
    vi.mocked(getAuthUser).mockResolvedValue(mockUser as never);

    const bookings = [
      makeBookingDoc({ _id: 'b1', groupId: 'group-1' }),
    ];
    const chainMock = {
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockResolvedValue(bookings),
    };
    vi.mocked(Booking.find).mockReturnValue(chainMock as never);

    const { GET } = await import('@/app/api/bookings/route');
    const req = makeRequest('/api/bookings?groupId=group-1');
    const res = await GET(req);
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(Booking.find).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-1', groupId: 'group-1' })
    );
    // When groupId is provided, sort by deliveryDate
    expect(chainMock.sort).toHaveBeenCalledWith('deliveryDate');
  });

  it('returns only paid bookings for providers', async () => {
    const providerUser = { _id: 'user-2', role: 'provider' };
    vi.mocked(getAuthUser).mockResolvedValue(providerUser as never);
    vi.mocked(Provider.findOne).mockResolvedValue(mockProvider);

    const chainMock = {
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockResolvedValue([]),
    };
    vi.mocked(Booking.find).mockReturnValue(chainMock as never);

    const { GET } = await import('@/app/api/bookings/route');
    const req = makeRequest('/api/bookings?type=provider');
    const res = await GET(req);
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(Booking.find).toHaveBeenCalledWith(
      expect.objectContaining({ 'payment.status': 'completed' })
    );
  });
});

describe('POST /api/bookings/bulk — multi-day bookings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    savedBookings.length = 0;
  });

  it('creates bookings for each day with shared groupId', async () => {
    vi.mocked(getAuthUser).mockResolvedValue(mockUser as never);
    vi.mocked(Provider.findById).mockResolvedValue(mockProvider);

    let callCount = 0;
    vi.mocked(Booking.create).mockImplementation(() => {
      callCount++;
      return Promise.resolve(
        makeBookingDoc({ _id: `booking-${callCount}`, status: 'pending' })
      ) as never;
    });

    const { POST } = await import('@/app/api/bookings/bulk/route');
    const req = makeRequest('/api/bookings/bulk', {
      method: 'POST',
      body: JSON.stringify({
        providerId: 'provider-1',
        items: [{ menuItemId: 'menu-1', name: 'Croissant', price: 5, quantity: 1 }],
        days: [
          { date: '2026-03-10', time: '08:00' },
          { date: '2026-03-11', time: '08:30' },
          { date: '2026-03-12', time: '09:00' },
        ],
        deliveryType: 'delivery',
        deliveryAddress: { street: '123 Test St' },
        pricing: { subtotal: 5, deliveryFee: 2, tax: 0, total: 7 },
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.bookings).toHaveLength(3);
    expect(json.groupId).toBeDefined();
    expect(Booking.create).toHaveBeenCalledTimes(3);

    // Each call should have different deliveryDate/Time but same groupId
    const calls = vi.mocked(Booking.create).mock.calls;
    const groupIds = calls.map((c) => (c[0] as Record<string, unknown>).groupId);
    expect(new Set(groupIds).size).toBe(1); // all same groupId
  });

  it('rejects when days array is empty', async () => {
    vi.mocked(getAuthUser).mockResolvedValue(mockUser as never);

    const { POST } = await import('@/app/api/bookings/bulk/route');
    const req = makeRequest('/api/bookings/bulk', {
      method: 'POST',
      body: JSON.stringify({ ...sampleBookingData, days: [] }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('rejects when more than 14 days', async () => {
    vi.mocked(getAuthUser).mockResolvedValue(mockUser as never);

    const days = Array.from({ length: 15 }, (_, i) => ({
      date: `2026-03-${String(10 + i).padStart(2, '0')}`,
      time: '08:00',
    }));

    const { POST } = await import('@/app/api/bookings/bulk/route');
    const req = makeRequest('/api/bookings/bulk', {
      method: 'POST',
      body: JSON.stringify({ ...sampleBookingData, days }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

describe('POST /api/payments/simulate — payment simulation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('simulates payment for a single booking', async () => {
    vi.mocked(getAuthUser).mockResolvedValue(mockUser as never);

    const booking = makeBookingDoc({
      _id: 'booking-1',
      userId: 'user-1',
      status: 'pending',
      payment: { method: 'card', status: 'pending' },
    });
    vi.mocked(Booking.findOne).mockResolvedValue(booking);

    const { POST } = await import('@/app/api/payments/simulate/route');
    const req = makeRequest('/api/payments/simulate', {
      method: 'POST',
      body: JSON.stringify({ bookingId: 'booking-1' }),
    });
    const res = await POST(req);
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(booking.payment.status).toBe('completed');
    expect(booking.status).toBe('confirmed');
    expect(booking.save).toHaveBeenCalled();
  });

  it('simulates payment for all bookings in a group', async () => {
    vi.mocked(getAuthUser).mockResolvedValue(mockUser as never);

    const bookings = [
      makeBookingDoc({
        _id: 'b1',
        groupId: 'group-1',
        userId: 'user-1',
        status: 'pending',
        payment: { method: 'card', status: 'pending' },
      }),
      makeBookingDoc({
        _id: 'b2',
        groupId: 'group-1',
        userId: 'user-1',
        status: 'pending',
        payment: { method: 'card', status: 'pending' },
      }),
    ];
    vi.mocked(Booking.find).mockResolvedValue(bookings as never);

    const { POST } = await import('@/app/api/payments/simulate/route');
    const req = makeRequest('/api/payments/simulate', {
      method: 'POST',
      body: JSON.stringify({ groupId: 'group-1' }),
    });
    const res = await POST(req);
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(json.message).toContain('2 booking(s)');
    expect(bookings[0].payment.status).toBe('completed');
    expect(bookings[1].payment.status).toBe('completed');
    expect(bookings[0].status).toBe('confirmed');
    expect(bookings[1].status).toBe('confirmed');
  });

  it('skips already-paid bookings in a group', async () => {
    vi.mocked(getAuthUser).mockResolvedValue(mockUser as never);

    const bookings = [
      makeBookingDoc({
        _id: 'b1',
        groupId: 'group-1',
        userId: 'user-1',
        status: 'confirmed',
        payment: { method: 'card', status: 'completed' },
      }),
      makeBookingDoc({
        _id: 'b2',
        groupId: 'group-1',
        userId: 'user-1',
        status: 'pending',
        payment: { method: 'card', status: 'pending' },
      }),
    ];
    vi.mocked(Booking.find).mockResolvedValue(bookings as never);

    const { POST } = await import('@/app/api/payments/simulate/route');
    const req = makeRequest('/api/payments/simulate', {
      method: 'POST',
      body: JSON.stringify({ groupId: 'group-1' }),
    });
    const res = await POST(req);
    const json = await res.json();

    expect(json.message).toContain('1 booking(s)');
    // Only the pending one should be saved
    expect(bookings[1].save).toHaveBeenCalled();
  });

  it('returns 400 when no bookingId or groupId provided', async () => {
    vi.mocked(getAuthUser).mockResolvedValue(mockUser as never);

    const { POST } = await import('@/app/api/payments/simulate/route');
    const req = makeRequest('/api/payments/simulate', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

describe('Booking status workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provider can update booking status', async () => {
    const providerUser = { _id: 'provider-user-1', role: 'provider' };
    vi.mocked(getAuthUser).mockResolvedValue(providerUser as never);
    vi.mocked(Provider.findOne).mockResolvedValue(mockProvider);

    const booking = makeBookingDoc({
      _id: 'booking-1',
      providerId: 'provider-1',
      userId: 'user-1',
      status: 'confirmed',
    });
    vi.mocked(Booking.findById).mockResolvedValue(booking);

    const { PUT } = await import('@/app/api/bookings/[id]/route');
    const req = makeRequest('/api/bookings/booking-1', {
      method: 'PUT',
      body: JSON.stringify({ status: 'preparing' }),
    });
    const res = await PUT(req, { params: Promise.resolve({ id: 'booking-1' }) });
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(booking.status).toBe('preparing');
    expect(booking.save).toHaveBeenCalled();
  });

  it('tourist cannot update booking status', async () => {
    vi.mocked(getAuthUser).mockResolvedValue(mockUser as never);
    vi.mocked(Provider.findOne).mockResolvedValue(null);

    const booking = makeBookingDoc({
      _id: 'booking-1',
      providerId: 'provider-1',
      userId: 'user-1',
      status: 'confirmed',
    });
    vi.mocked(Booking.findById).mockResolvedValue(booking);

    const { PUT } = await import('@/app/api/bookings/[id]/route');
    const req = makeRequest('/api/bookings/booking-1', {
      method: 'PUT',
      body: JSON.stringify({ status: 'preparing' }),
    });
    const res = await PUT(req, { params: Promise.resolve({ id: 'booking-1' }) });

    expect(res.status).toBe(403);
  });

  it('user can cancel their own booking', async () => {
    vi.mocked(getAuthUser).mockResolvedValue(mockUser as never);

    const booking = makeBookingDoc({
      _id: 'booking-1',
      providerId: 'provider-1',
      userId: { toString: () => 'user-1' },
      status: 'pending',
    });
    vi.mocked(Booking.findById).mockResolvedValue(booking);

    const { DELETE } = await import('@/app/api/bookings/[id]/route');
    const req = makeRequest('/api/bookings/booking-1', { method: 'DELETE' });
    const res = await DELETE(req, { params: Promise.resolve({ id: 'booking-1' }) });
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(booking.status).toBe('cancelled');
  });

  it('user cannot cancel another user booking', async () => {
    vi.mocked(getAuthUser).mockResolvedValue(mockUser as never);

    const booking = makeBookingDoc({
      _id: 'booking-1',
      providerId: 'provider-1',
      userId: { toString: () => 'user-OTHER' },
      status: 'pending',
    });
    vi.mocked(Booking.findById).mockResolvedValue(booking);

    const { DELETE } = await import('@/app/api/bookings/[id]/route');
    const req = makeRequest('/api/bookings/booking-1', { method: 'DELETE' });
    const res = await DELETE(req, { params: Promise.resolve({ id: 'booking-1' }) });

    expect(res.status).toBe(403);
  });
});

describe('Review flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('user can review a completed booking', async () => {
    vi.mocked(getAuthUser).mockResolvedValue(mockUser as never);

    const booking = makeBookingDoc({
      _id: 'booking-1',
      providerId: 'provider-1',
      userId: { toString: () => 'user-1' },
      status: 'completed',
    });
    vi.mocked(Booking.findById).mockResolvedValue(booking);

    const provider = {
      _id: 'provider-1',
      rating: { average: 0, count: 0 },
      save: vi.fn(),
    };
    vi.mocked(Provider.findById).mockResolvedValue(provider);
    // Mock find for recalculating average
    vi.mocked(Booking.find).mockResolvedValue([
      { review: { rating: 4 } },
      { review: { rating: 5 } },
    ] as never);

    const { PATCH } = await import('@/app/api/bookings/[id]/route');
    const req = makeRequest('/api/bookings/booking-1', {
      method: 'PATCH',
      body: JSON.stringify({ rating: 5, comment: 'Great breakfast!' }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: 'booking-1' }) });
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(booking.review.rating).toBe(5);
    expect(booking.review.comment).toBe('Great breakfast!');
    expect(provider.save).toHaveBeenCalled();
    expect(provider.rating.average).toBe(4.5);
    expect(provider.rating.count).toBe(2);
  });

  it('rejects review on pending booking', async () => {
    vi.mocked(getAuthUser).mockResolvedValue(mockUser as never);

    const booking = makeBookingDoc({
      _id: 'booking-1',
      userId: { toString: () => 'user-1' },
      status: 'pending',
    });
    vi.mocked(Booking.findById).mockResolvedValue(booking);

    const { PATCH } = await import('@/app/api/bookings/[id]/route');
    const req = makeRequest('/api/bookings/booking-1', {
      method: 'PATCH',
      body: JSON.stringify({ rating: 5 }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: 'booking-1' }) });

    expect(res.status).toBe(400);
  });
});
