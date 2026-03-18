'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CreditCard, CheckCircle, Lock, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { paymentsApi } from '@/lib/api';
import { Booking } from '@/types';
import { formatCurrency } from '@/lib/utils/format';
import { useCartStore } from '@/stores';
import { useTranslation } from '@/hooks';

interface PaymentFormProps {
  booking?: Booking;
  bookings?: Booking[];
  groupId?: string;
}

export function PaymentForm({ booking, bookings, groupId }: PaymentFormProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const clearCart = useCartStore((state) => state.clearCart);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Form state (visual only)
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12/34');
  const [cvc, setCvc] = useState('123');
  const [cardName, setCardName] = useState('Test User');

  const allBookings = bookings || (booking ? [booking] : []);
  const totalAmount = allBookings.reduce((sum, b) => sum + b.pricing.total, 0);
  const isMultiDay = allBookings.length > 1;

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) {
      return digits.slice(0, 2) + '/' + digits.slice(2);
    }
    return digits;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic visual validation
    const cleanCard = cardNumber.replace(/\s/g, '');
    if (cleanCard.length < 16) {
      toast.error(t('checkout', 'invalidCard'));
      return;
    }
    if (expiry.length < 5) {
      toast.error(t('checkout', 'invalidExpiry'));
      return;
    }
    if (cvc.length < 3) {
      toast.error(t('checkout', 'invalidCvc'));
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate a short processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      await paymentsApi.simulate(
        groupId
          ? { groupId }
          : { bookingId: allBookings[0]._id }
      );

      setIsComplete(true);
      clearCart();
      toast.success(t('checkout', 'paymentSuccessful'));

      setTimeout(() => {
        router.push('/bookings');
      }, 2000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('checkout', 'paymentFailed'));
      setIsProcessing(false);
    }
  };

  if (isComplete) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h3 className="mt-4 text-xl font-semibold">{t('checkout', 'paymentSuccessful')}</h3>
          <p className="mt-2 text-text-light">
            {isMultiDay
              ? t('checkout', 'ordersConfirmed', { count: allBookings.length })
              : t('checkout', 'orderConfirmed')}{' '}
            {t('checkout', 'redirecting')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          {t('checkout', 'paymentDetails')}
        </CardTitle>
        <div className="flex items-center gap-1 text-xs text-text-light">
          <Lock className="h-3 w-3" />
          {t('checkout', 'simulatedPayment')}
        </div>
      </CardHeader>
      <CardContent>
        {/* Multi-day summary */}
        {isMultiDay && (
          <div className="mb-6 rounded-lg border bg-muted/30 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                {t('checkout', 'deliveryDays', { count: allBookings.length })}
              </span>
            </div>
            <div className="space-y-1">
              {allBookings.map((b) => (
                <div key={b._id} className="flex justify-between text-xs text-text-light">
                  <span>
                    {new Date(b.deliveryDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    at {b.deliveryTime}
                  </span>
                  <span>{formatCurrency(b.pricing.total)}</span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex justify-between text-sm font-semibold">
              <span>{t('common', 'total')}</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Card number */}
          <div>
            <Label htmlFor="card-number">{t('checkout', 'cardNumber')}</Label>
            <div className="relative mt-1">
              <Input
                id="card-number"
                placeholder="4242 4242 4242 4242"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                className="pl-10"
              />
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="card-name">{t('checkout', 'nameOnCard')}</Label>
            <Input
              id="card-name"
              placeholder="John Doe"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Expiry + CVC */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiry">{t('checkout', 'expiry')}</Label>
              <Input
                id="expiry"
                placeholder="12/34"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="cvc">{t('checkout', 'cvc')}</Label>
              <Input
                id="cvc"
                placeholder="123"
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="mt-1"
              />
            </div>
          </div>

          {/* Test card hint */}
          <div className="rounded-md bg-blue-50 p-3 text-xs text-blue-700">
            <p className="font-medium">{t('checkout', 'testMode')}</p>
            <p>{t('checkout', 'testModeDesc')}</p>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('checkout', 'processingPayment')}
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                {t('checkout', 'pay', { amount: formatCurrency(totalAmount) })}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
