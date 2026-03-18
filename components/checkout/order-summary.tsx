'use client';

import { MapPin, Clock, Store, Truck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Booking } from '@/types';
import { formatCurrency } from '@/lib/utils/format';
import { useTranslation } from '@/hooks';

interface OrderSummaryProps {
  booking: Booking;
  compact?: boolean;
}

export function OrderSummary({ booking, compact }: OrderSummaryProps) {
  const { t } = useTranslation();
  const provider = booking.providerId;

  if (compact) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {provider.images?.[0] ? (
                <img
                  src={provider.images[0]}
                  alt={provider.businessName}
                  className="h-8 w-8 rounded object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                  <Store className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium">{provider.businessName}</p>
                <div className="flex items-center gap-2 text-xs text-text-light">
                  <Clock className="h-3 w-3" />
                  <span>
                    {new Date(booking.deliveryDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    at {booking.deliveryTime}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">{formatCurrency(booking.pricing.total)}</p>
              <p className="text-xs text-text-light">
                {booking.items.length} {booking.items.length !== 1 ? t('common', 'items') : t('common', 'item')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('checkout', 'orderSummary')}</CardTitle>
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
                  {t('common', 'delivery')}
                </>
              ) : (
                <>
                  <Store className="mr-1 h-3 w-3" />
                  {t('common', 'pickup')}
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
          <p className="font-medium">{t('common', 'items')}</p>
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
            <span>{t('common', 'subtotal')}</span>
            <span>{formatCurrency(booking.pricing.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>{t('common', 'deliveryFee')}</span>
            <span>{formatCurrency(booking.pricing.deliveryFee)}</span>
          </div>
          {booking.pricing.tax > 0 && (
            <div className="flex justify-between text-sm">
              <span>{t('common', 'tax')}</span>
              <span>{formatCurrency(booking.pricing.tax)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>{t('common', 'total')}</span>
            <span>{formatCurrency(booking.pricing.total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
