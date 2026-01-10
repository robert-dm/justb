'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { OrderSummary, PaymentForm } from '@/components/checkout';
import { bookingsApi } from '@/lib/api';
import { Booking } from '@/types';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking');

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBooking() {
      if (!bookingId) {
        setError('No booking ID provided');
        setIsLoading(false);
        return;
      }

      try {
        const response = await bookingsApi.getById(bookingId);
        setBooking(response.booking);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load booking');
      } finally {
        setIsLoading(false);
      }
    }

    fetchBooking();
  }, [bookingId]);

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-text-light">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-2xl font-bold text-destructive">Error</h1>
          <p className="mt-2 text-text-light">{error || 'Booking not found'}</p>
          <Link href="/providers">
            <Button className="mt-4">Browse Providers</Button>
          </Link>
        </div>
      </div>
    );
  }

  // If payment is already completed, redirect to bookings
  if (booking.payment.status === 'completed') {
    router.push('/bookings');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href={`/providers/${booking.providerId._id}`}>
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Provider
        </Button>
      </Link>

      <h1 className="mb-8 text-2xl font-bold">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Order Summary */}
        <div>
          <OrderSummary booking={booking} />
        </div>

        {/* Payment Form */}
        <div>
          <PaymentForm booking={booking} />
        </div>
      </div>
    </div>
  );
}
