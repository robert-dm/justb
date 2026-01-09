'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuantityControl } from '@/components/menu';
import { useCartStore, useIsAuthenticated } from '@/stores';
import { bookingsApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils/format';
import { DeliveryType } from '@/types';

export function CartSidebar() {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const {
    items,
    provider,
    updateQuantity,
    removeItem,
    clearCart,
    getSubtotal,
    getDeliveryFee,
    getTotal,
    setDeliveryInfo,
    deliveryInfo,
  } = useCartStore();

  const [deliveryType, setDeliveryType] = useState<DeliveryType>(
    deliveryInfo?.type || 'delivery'
  );
  const [deliveryDate, setDeliveryDate] = useState(deliveryInfo?.date || '');
  const [deliveryTime, setDeliveryTime] = useState(deliveryInfo?.time || '');
  const [deliveryAddress, setDeliveryAddress] = useState(
    deliveryInfo?.address?.street || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get tomorrow's date as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const timeSlots = [
    '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
    '10:00', '10:30', '11:00', '11:30', '12:00',
  ];

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to continue');
      router.push('/login?redirect=/providers/' + provider?._id);
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!deliveryDate || !deliveryTime) {
      toast.error('Please select delivery date and time');
      return;
    }

    if (deliveryType === 'delivery' && !deliveryAddress) {
      toast.error('Please enter delivery address');
      return;
    }

    setIsSubmitting(true);

    try {
      // Save delivery info to store
      setDeliveryInfo({
        type: deliveryType,
        date: deliveryDate,
        time: deliveryTime,
        address: deliveryType === 'delivery' ? { street: deliveryAddress } : undefined,
      });

      // Create booking
      const response = await bookingsApi.create({
        providerId: provider!._id,
        items: items.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
        })),
        deliveryDate,
        deliveryTime,
        deliveryType,
        deliveryAddress:
          deliveryType === 'delivery' ? { street: deliveryAddress } : undefined,
        pricing: {
          subtotal: getSubtotal(),
          deliveryFee: getDeliveryFee(),
          tax: 0,
          total: getTotal(),
        },
      });

      toast.success('Order created! Redirecting to checkout...');
      router.push(`/checkout?booking=${response.booking._id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create order');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <Card className="sticky top-24">
        <CardContent className="py-12 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-text-light">Your cart is empty</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add items from the menu to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Your Order</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCart}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cart Items */}
        <div className="max-h-60 space-y-3 overflow-y-auto">
          {items.map((item) => (
            <div key={item.menuItemId} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-sm text-text-light">
                  {formatCurrency(item.price)} each
                </p>
              </div>
              <QuantityControl
                quantity={item.quantity}
                onIncrease={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                onDecrease={() => updateQuantity(item.menuItemId, item.quantity - 1)}
              />
            </div>
          ))}
        </div>

        <Separator />

        {/* Delivery Options */}
        <div className="space-y-3">
          <div>
            <Label>Delivery Type</Label>
            <Select
              value={deliveryType}
              onValueChange={(v: DeliveryType) => setDeliveryType(v)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {provider?.serviceType.delivery && (
                  <SelectItem value="delivery">Delivery</SelectItem>
                )}
                {provider?.serviceType.pickup && (
                  <SelectItem value="pickup">Pickup</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                min={minDate}
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Time</Label>
              <Select value={deliveryTime} onValueChange={setDeliveryTime}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {deliveryType === 'delivery' && (
            <div>
              <Label>Delivery Address</Label>
              <Input
                placeholder="Enter your address"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="mt-1"
              />
            </div>
          )}
        </div>

        <Separator />

        {/* Pricing */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatCurrency(getSubtotal())}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Delivery Fee</span>
            <span>{formatCurrency(getDeliveryFee())}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatCurrency(getTotal())}</span>
          </div>
        </div>

        {/* Checkout Button */}
        <Button
          className="w-full"
          size="lg"
          onClick={handleCheckout}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating order...
            </>
          ) : isAuthenticated ? (
            'Proceed to Checkout'
          ) : (
            'Login to Order'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
