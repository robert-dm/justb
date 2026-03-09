'use client';

import { useEffect, useState, useMemo } from 'react';
import { Loader2, ShoppingBag, CalendarDays, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { BookingCard } from '@/components/booking';
import { bookingsApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils/format';
import { Booking, BookingStatus } from '@/types';

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatDateHeading(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const today = formatDateKey(new Date());
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = formatDateKey(tomorrow);

  let label = '';
  if (dateStr === today) label = 'Today — ';
  else if (dateStr === tomorrowKey) label = 'Tomorrow — ';

  return (
    label +
    date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    })
  );
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const response = await bookingsApi.getUserBookings();
        setBookings(response.bookings);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load bookings');
      } finally {
        setIsLoading(false);
      }
    }

    fetchBookings();
  }, []);

  const handleBookingUpdate = (updatedBooking: Booking) => {
    setBookings((prev) =>
      prev.map((b) => (b._id === updatedBooking._id ? updatedBooking : b))
    );
  };

  const activeStatuses: BookingStatus[] = [
    'pending',
    'confirmed',
    'preparing',
    'on-the-way',
    'delivered',
  ];
  const completedStatuses: BookingStatus[] = ['completed', 'cancelled'];

  const activeBookings = bookings.filter((b) => activeStatuses.includes(b.status));
  const pastBookings = bookings.filter((b) => completedStatuses.includes(b.status));

  // Group active bookings by date for day-by-day view
  const activeByDate = useMemo(() => {
    const map: Record<string, Booking[]> = {};
    for (const b of activeBookings) {
      const key = formatDateKey(new Date(b.deliveryDate));
      if (!map[key]) map[key] = [];
      map[key].push(b);
    }
    // Sort each day by time
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => a.deliveryTime.localeCompare(b.deliveryTime));
    }
    return map;
  }, [activeBookings]);

  const sortedActiveDates = useMemo(
    () => Object.keys(activeByDate).sort(),
    [activeByDate]
  );

  // Detect multi-day groups and unpaid groups
  const { groupCounts, unpaidGroups } = useMemo(() => {
    const counts: Record<string, number> = {};
    const unpaid: Record<string, { total: number; count: number }> = {};

    for (const b of bookings) {
      if (b.groupId) {
        counts[b.groupId] = (counts[b.groupId] || 0) + 1;
        if (b.payment?.status !== 'completed') {
          if (!unpaid[b.groupId]) unpaid[b.groupId] = { total: 0, count: 0 };
          unpaid[b.groupId].total += b.pricing.total;
          unpaid[b.groupId].count += 1;
        }
      }
    }
    return { groupCounts: counts, unpaidGroups: unpaid };
  }, [bookings]);

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-text-light">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-2xl font-bold text-destructive">Error</h1>
          <p className="mt-2 text-text-light">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">My Orders</h1>

      {bookings.length === 0 ? (
        <div className="mx-auto max-w-md py-12 text-center">
          <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">No orders yet</h2>
          <p className="mt-2 text-text-light">
            Start exploring local breakfast providers and place your first order!
          </p>
          <Link href="/providers">
            <Button className="mt-6">Browse Providers</Button>
          </Link>
        </div>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="active">
              Active ({activeBookings.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {activeBookings.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-text-light">No active orders</p>
                <Link href="/providers">
                  <Button variant="outline" className="mt-4">
                    Place an Order
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Unpaid group banners */}
                {Object.entries(unpaidGroups).map(([gId, { total, count }]) => (
                  <Card key={gId} className="border-amber-200 bg-amber-50">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-amber-800">
                          {count}-day order pending payment
                        </p>
                        <p className="text-sm text-amber-600">
                          Total: {formatCurrency(total)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" asChild>
                          <Link href={`/checkout?group=${gId}`}>
                            <CreditCard className="mr-1 h-4 w-4" />
                            Pay all {count} days
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {sortedActiveDates.map((dateKey) => {
                  const dayBookings = activeByDate[dateKey];
                  return (
                    <div key={dateKey}>
                      {/* Day heading */}
                      <div className="flex items-center gap-2 mb-4">
                        <CalendarDays className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">
                          {formatDateHeading(dateKey)}
                        </h3>
                        <Badge variant="secondary" className="ml-auto">
                          {dayBookings.length} order{dayBookings.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>

                      {/* Bookings for this day */}
                      <div className="grid gap-4 md:grid-cols-2">
                        {dayBookings.map((booking) => (
                          <div key={booking._id} className="relative">
                            {booking.groupId && groupCounts[booking.groupId] > 1 && (
                              <div className="mb-1">
                                <Badge variant="outline" className="text-xs">
                                  Multi-day order ({groupCounts[booking.groupId]} days)
                                </Badge>
                              </div>
                            )}
                            <BookingCard
                              booking={booking}
                              onUpdate={handleBookingUpdate}
                              groupDayCount={
                                booking.groupId && unpaidGroups[booking.groupId]
                                  ? unpaidGroups[booking.groupId].count
                                  : undefined
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {pastBookings.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-text-light">No past orders</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {pastBookings.map((booking) => (
                  <BookingCard
                    key={booking._id}
                    booking={booking}
                    onUpdate={handleBookingUpdate}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
