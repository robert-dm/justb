import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import connectDB from '@/lib/db';
import Booking from '@/lib/models/Booking';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover',
});

export async function POST(request: NextRequest) {
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const body = await request.text();
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 });
  }

  await connectDB();

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      // Update booking status
      const booking = await Booking.findOne({
        'payment.stripePaymentIntentId': paymentIntent.id,
      });

      if (booking) {
        booking.payment.status = 'completed';
        booking.payment.paidAt = new Date();
        booking.status = 'confirmed';
        await booking.save();
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      // Update booking status
      const failedBooking = await Booking.findOne({
        'payment.stripePaymentIntentId': failedPayment.id,
      });

      if (failedBooking) {
        failedBooking.payment.status = 'failed';
        await failedBooking.save();
      }
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return Response.json({ received: true });
}
