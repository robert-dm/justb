import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import connectDB from '@/lib/db';
import Booking from '@/lib/models/Booking';
import { getAuthUser, unauthorizedResponse, errorResponse } from '@/lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover',
});

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return unauthorizedResponse();
    }

    await connectDB();

    const body = await request.json();
    const { paymentIntentId, bookingId } = body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update booking payment status
      const booking = await Booking.findById(bookingId);
      if (booking) {
        booking.payment.status = 'completed';
        booking.payment.paidAt = new Date();
        booking.status = 'confirmed';
        await booking.save();
      }

      return Response.json({
        success: true,
        message: 'Payment confirmed successfully',
        booking,
      });
    } else {
      return errorResponse(`Payment not successful. Status: ${paymentIntent.status}`, 400);
    }
  } catch (error) {
    console.error('Confirm payment error:', error);
    return errorResponse('Error confirming payment', 500);
  }
}
