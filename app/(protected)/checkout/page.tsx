'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { OrderSummary, PaymentForm } from '@/components/checkout';
import { bookingsApi } from '@/lib/api';
import { useTranslation } from '@/hooks';
import { Booking } from '@/types';

export default function CheckoutPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking');
  const groupId = searchParams.get('group');

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBookings() {
      if (!bookingId && !groupId) {
        setError(t('checkout', 'noBookingId'));
        setIsLoading(false);
        return;
      }

      try {
        if (groupId) {
          const response = await bookingsApi.getByGroup(groupId);
          const groupBookings = response.bookings.sort(
            (a: Booking, b: Booking) => a.deliveryDate.localeCompare(b.deliveryDate)
          );
          if (groupBookings.length === 0) {
            setError(t('checkout', 'noBookingsForGroup'));
          } else {
            setBookings(groupBookings);
          }
        } else if (bookingId) {
          const response = await bookingsApi.getById(bookingId);
          setBookings([response.booking]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t('checkout', 'failedToLoadBooking'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchBookings();
  }, [bookingId, groupId]);

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-text-light">{t('checkout', 'loadingCheckout')}</p>
        </div>
      </div>
    );
  }

  if (error || bookings.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-2xl font-bold text-destructive">{t('common', 'error')}</h1>
          <p className="mt-2 text-text-light">{error || t('checkout', 'bookingNotFound')}</p>
          <Link href="/providers">
            <Button className="mt-4">{t('common', 'browseProviders')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  // If all bookings are already paid, redirect
  const allPaid = bookings.every((b) => b.payment?.status === 'completed');
  if (allPaid) {
    router.push('/bookings');
    return null;
  }

  const firstBooking = bookings[0];
  const isMultiDay = bookings.length > 1;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/providers">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('checkout', 'backToProviders')}
        </Button>
      </Link>

      <h1 className="mb-8 text-2xl font-bold">
        {isMultiDay ? t('checkout', 'titleMultiDay', { count: bookings.length }) : t('checkout', 'title')}
      </h1>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Order Summary */}
        <div className="space-y-4">
          {isMultiDay ? (
            bookings.map((b) => (
              <OrderSummary key={b._id} booking={b} compact={isMultiDay} />
            ))
          ) : (
            <OrderSummary booking={firstBooking} />
          )}
        </div>

        {/* Payment */}
        <div>
          <PaymentForm
            booking={isMultiDay ? undefined : firstBooking}
            bookings={isMultiDay ? bookings : undefined}
            groupId={groupId || undefined}
          />
        </div>
      </div>
    </div>
  );
}
