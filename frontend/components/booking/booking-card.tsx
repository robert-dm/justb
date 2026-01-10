'use client';

import { useState } from 'react';
import { MapPin, Clock, Store, Truck, Star, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from './status-badge';
import { ReviewDialog } from './review-dialog';
import { bookingsApi } from '@/lib/api';
import { Booking } from '@/types';
import { formatCurrency } from '@/lib/utils/format';

interface BookingCardProps {
  booking: Booking;
  onUpdate?: (booking: Booking) => void;
}

export function BookingCard({ booking, onUpdate }: BookingCardProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const provider = booking.providerId;

  const canCancel = ['pending', 'confirmed'].includes(booking.status);
  const canReview = booking.status === 'completed' && !booking.review;

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    setIsCancelling(true);
    try {
      const response = await bookingsApi.cancel(booking._id);
      toast.success('Order cancelled successfully');
      onUpdate?.(response.booking);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to cancel order');
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
                  Order #{booking._id.slice(-6).toUpperCase()}
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
            <span>Total</span>
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
                        Cancel Order
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
                    Leave Review
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
