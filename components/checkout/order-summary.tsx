'use client';

import { MapPin, Clock, Store, Truck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Booking } from '@/types';
import { formatCurrency } from '@/lib/utils/format';

interface OrderSummaryProps {
  booking: Booking;
}

export function OrderSummary({ booking }: OrderSummaryProps) {
  const provider = booking.providerId;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Provider Info */}
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
              {provider.address?.city}
            </p>
          </div>
        </div>

        <Separator />

        {/* Delivery Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {booking.deliveryType === 'delivery' ? (
                <>
                  <Truck className="mr-1 h-3 w-3" />
                  Delivery
                </>
              ) : (
                <>
                  <Store className="mr-1 h-3 w-3" />
                  Pickup
                </>
              )}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-sm text-text-light">
            <Clock className="h-4 w-4" />
            <span>
              {new Date(booking.deliveryDate).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}{' '}
              at {booking.deliveryTime}
            </span>
          </div>

          {booking.deliveryType === 'delivery' && booking.deliveryAddress && (
            <div className="flex items-start gap-2 text-sm text-text-light">
              <MapPin className="h-4 w-4 mt-0.5" />
              <span>{booking.deliveryAddress.street}</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Order Items */}
        <div className="space-y-2">
          <p className="font-medium">Items</p>
          {booking.items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span>
                {item.quantity}x {item.name}
              </span>
              <span>{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <Separator />

        {/* Pricing */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatCurrency(booking.pricing.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Delivery Fee</span>
            <span>{formatCurrency(booking.pricing.deliveryFee)}</span>
          </div>
          {booking.pricing.tax > 0 && (
            <div className="flex justify-between text-sm">
              <span>Tax</span>
              <span>{formatCurrency(booking.pricing.tax)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatCurrency(booking.pricing.total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
