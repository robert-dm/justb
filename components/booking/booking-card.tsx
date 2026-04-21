'use client';

import { useState } from 'react';
import { MapPin, Clock, Store, Truck, Star, X, Loader2, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from './status-badge';
import { ReviewDialog } from './review-dialog';
import { bookingsApi } from '@/lib/api';
import { Booking } from '@/types';
import { formatCurrency } from '@/lib/utils/format';
import { useTranslation } from '@/hooks';

interface BookingCardProps {
  booking: Booking;
  onUpdate?: (booking: Booking) => void;
  groupDayCount?: number;
}

export function BookingCard({ booking, onUpdate, groupDayCount }: BookingCardProps) {
  const { t } = useTranslation();
  const [isCancelling, setIsCancelling] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const provider = booking.providerId;

  const needsPayment = booking.payment?.status !== 'completed' && booking.status === 'pending';
  const canCancel = ['pending', 'confirmed'].includes(booking.status);
  const canReview = booking.status === 'completed' && !booking.review;

  const handleCancel = async () => {
    if (!confirm(t('booking', 'confirmCancel'))) {
      return;
    }

    setIsCancelling(true);
    try {
      const response = await bookingsApi.cancel(booking._id);
      toast.success(t('booking', 'orderCancelled'));
      onUpdate?.(response.booking);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('booking', 'failedToCancel'));
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReviewSubmit = (updatedBooking: Booking) => {
    setShowReviewDialog(false);
    onUpdate?.(updatedBooking);
  };

  return (
    <>
      <Card>
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {provider.images?.[0] ? (
                <img
                  src={provider.images[0]}
                  alt={provider.businessName}
                  className="h-12 w-12 rounded-lg object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                  <Store className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div>
                <p className="font-medium">{provider.businessName}</p>
                <p className="text-sm text-text-light">
                  {t('booking', 'orderNumber', { id: booking._id.slice(-6).toUpperCase() })}
                </p>
              </div>
            </div>
            <StatusBadge status={booking.status} />
          </div>

          <Separator className="my-4" />

          {/* Delivery Info */}
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2">
              {booking.deliveryType === 'delivery' ? (
                <Truck className="h-4 w-4 text-text-light" />
              ) : (
                <Store className="h-4 w-4 text-text-light" />
              )}
              <span className="capitalize">{booking.deliveryType}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-text-light" />
              <span>
                {new Date(booking.deliveryDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                at {booking.deliveryTime}
              </span>
            </div>

            {booking.deliveryType === 'delivery' && booking.deliveryAddress && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-text-light mt-0.5" />
                <span>{booking.deliveryAddress.street}</span>
              </div>
            )}
          </div>

          <Separator className="my-4" />

          {/* Items */}
          <div className="space-y-1">
            {booking.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>
                  {item.quantity}x {item.name}
                </span>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          {/* Total */}
          <div className="flex justify-between font-semibold">
            <span>{t('common', 'total')}</span>
            <span>{formatCurrency(booking.pricing.total)}</span>
          </div>

          {/* Review Section */}
          {booking.review && (
            <>
              <Separator className="my-4" />
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= booking.review!.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted'
                      }`}
                    />
                  ))}
                </div>
                {booking.review.comment && (
                  <p className="text-sm text-text-light">
                    &quot;{booking.review.comment}&quot;
                  </p>
                )}
              </div>
            </>
          )}

          {/* Payment required banner */}
          {needsPayment && (
            <>
              <Separator className="my-4" />
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-800">{t('booking', 'paymentPending')}</p>
                    <p className="text-xs text-amber-600">{t('booking', 'completePayment')}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/checkout?booking=${booking._id}`}>
                      <CreditCard className="mr-1 h-4 w-4" />
                      {t('booking', 'payThisDay', { total: formatCurrency(booking.pricing.total) })}
                    </Link>
                  </Button>
                  {booking.groupId && groupDayCount && groupDayCount > 1 && (
                    <Button size="sm" asChild>
                      <Link href={`/checkout?group=${booking.groupId}`}>
                        <CreditCard className="mr-1 h-4 w-4" />
                        {t('booking', 'payAllDays', { count: groupDayCount })}
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          {(canCancel || canReview) && (
            <>
              <Separator className="my-4" />
              <div className="flex gap-2">
                {canCancel && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={isCancelling}
                    className="text-destructive hover:text-destructive"
                  >
                    {isCancelling ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <X className="mr-1 h-4 w-4" />
                        {t('booking', 'cancelOrder')}
                      </>
                    )}
                  </Button>
                )}
                {canReview && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowReviewDialog(true)}
                  >
                    <Star className="mr-1 h-4 w-4" />
                    {t('booking', 'leaveReview')}
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ReviewDialog
        booking={booking}
        open={showReviewDialog}
        onClose={() => setShowReviewDialog(false)}
        onSubmit={handleReviewSubmit}
      />
    </>
  );
}
