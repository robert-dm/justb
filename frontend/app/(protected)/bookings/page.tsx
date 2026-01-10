'use client';

import { useEffect, useState } from 'react';
import { Loader2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookingCard } from '@/components/booking';
import { bookingsApi } from '@/lib/api';
import { Booking, BookingStatus } from '@/types';

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

  const activeBookings = bookings.filter((b) =>
    activeStatuses.includes(b.status)
  );
  const pastBookings = bookings.filter((b) =>
    completedStatuses.includes(b.status)
  );

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
              <div className="grid gap-4 md:grid-cols-2">
                {activeBookings.map((booking) => (
                  <BookingCard
                    key={booking._id}
                    booking={booking}
                    onUpdate={handleBookingUpdate}
                  />
                ))}
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
