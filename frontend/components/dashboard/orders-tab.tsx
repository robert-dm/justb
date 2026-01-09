'use client';

import { useState, useEffect } from 'react';
import { Loader2, Package, CheckCircle, Truck, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/booking';
import { bookingsApi } from '@/lib/api';
import { Booking, BookingStatus } from '@/types';
import { formatCurrency } from '@/lib/utils/format';

const statusFlow: BookingStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'on-the-way',
  'delivered',
  'completed',
];

const nextStatusLabel: Record<string, string> = {
  pending: 'Confirm',
  confirmed: 'Start Preparing',
  preparing: 'Out for Delivery',
  'on-the-way': 'Mark Delivered',
  delivered: 'Complete',
};

export function OrdersTab() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      const response = await bookingsApi.getProviderBookings();
      setBookings(response.bookings);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }

  const handleUpdateStatus = async (booking: Booking) => {
    const currentIndex = statusFlow.indexOf(booking.status);
    if (currentIndex === -1 || currentIndex >= statusFlow.length - 1) return;

    const nextStatus = statusFlow[currentIndex + 1];
    setUpdatingId(booking._id);

    try {
      const response = await bookingsApi.updateStatus(booking._id, nextStatus);
      setBookings((prev) =>
        prev.map((b) => (b._id === booking._id ? response.booking : b))
      );
      toast.success(`Order updated to ${nextStatus}`);
    } catch (error) {
      toast.error('Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const activeBookings = bookings.filter(
    (b) => !['completed', 'cancelled'].includes(b.status)
  );
  const pastBookings = bookings.filter((b) =>
    ['completed', 'cancelled'].includes(b.status)
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Active Orders */}
      <div>
        <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Active Orders ({activeBookings.length})
        </h3>

        {activeBookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-text-light">No active orders</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {activeBookings.map((booking) => (
              <Card key={booking._id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">
                        Order #{booking._id.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-sm text-text-light">
                        {new Date(booking.deliveryDate).toLocaleDateString()} at{' '}
                        {booking.deliveryTime}
                      </p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>

                  <Separator className="my-3" />

                  <div className="space-y-1 text-sm">
                    {booking.items.map((item, i) => (
                      <div key={i} className="flex justify-between">
                        <span>
                          {item.quantity}x {item.name}
                        </span>
                        <span>{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-3" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-light">
                        {booking.deliveryType === 'delivery' ? (
                          <>
                            <Truck className="mr-1 inline h-4 w-4" />
                            {booking.deliveryAddress?.street}
                          </>
                        ) : (
                          'Pickup'
                        )}
                      </p>
                      <p className="font-semibold">
                        Total: {formatCurrency(booking.pricing.total)}
                      </p>
                    </div>

                    {booking.status !== 'completed' &&
                      booking.status !== 'cancelled' && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(booking)}
                          disabled={updatingId === booking._id}
                        >
                          {updatingId === booking._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="mr-1 h-4 w-4" />
                              {nextStatusLabel[booking.status]}
                            </>
                          )}
                        </Button>
                      )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Past Orders */}
      {pastBookings.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold">
            Past Orders ({pastBookings.length})
          </h3>
          <div className="space-y-4">
            {pastBookings.slice(0, 10).map((booking) => (
              <Card key={booking._id} className="opacity-75">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        Order #{booking._id.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-sm text-text-light">
                        {new Date(booking.deliveryDate).toLocaleDateString()} -{' '}
                        {formatCurrency(booking.pricing.total)}
                      </p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
