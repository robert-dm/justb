'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Loader2, CreditCard, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { paymentsApi } from '@/lib/api';
import { Booking } from '@/types';
import { formatCurrency } from '@/lib/utils/format';
import { useCartStore } from '@/stores';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface PaymentFormProps {
  booking: Booking;
}

function CheckoutForm({ booking }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const clearCart = useCartStore((state) => state.clearCart);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/bookings`,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast.error(error.message || 'Payment failed');
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirm payment on backend
        await paymentsApi.confirm(paymentIntent.id, booking._id);

        setIsComplete(true);
        clearCart();
        toast.success('Payment successful!');

        // Redirect to bookings after short delay
        setTimeout(() => {
          router.push('/bookings');
        }, 2000);
      }
    } catch (error) {
      toast.error('Something went wrong with the payment');
      setIsProcessing(false);
    }
  };

  if (isComplete) {
    return (
      <div className="py-12 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        <h3 className="mt-4 text-xl font-semibold">Payment Successful!</h3>
        <p className="mt-2 text-text-light">
          Redirecting to your bookings...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay {formatCurrency(booking.pricing.total)}
          </>
        )}
      </Button>
    </form>
  );
}

export function PaymentForm({ booking }: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function createPaymentIntent() {
      try {
        const response = await paymentsApi.createIntent(
          booking._id,
          Math.round(booking.pricing.total * 100) // Amount in cents
        );
        setClientSecret(response.clientSecret);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize payment');
      } finally {
        setIsLoading(false);
      }
    }

    createPaymentIntent();
  }, [booking._id, booking.pricing.total]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-text-light">Initializing payment...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !clientSecret) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-destructive">{error || 'Failed to load payment form'}</p>
        </CardContent>
      </Card>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#FF5A5F',
        colorBackground: '#ffffff',
        colorText: '#484848',
        colorDanger: '#df1b41',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm booking={booking} />
        </Elements>
      </CardContent>
    </Card>
  );
}
