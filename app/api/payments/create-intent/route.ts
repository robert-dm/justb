import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import connectDB from '@/lib/db';
import Booking from '@/lib/models/Booking';
import { getAuthUser, unauthorizedResponse, forbiddenResponse, errorResponse } from '@/lib/auth';

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
    const { amount, bookingId } = body;

    // Verify booking belongs to user
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return errorResponse('Booking not found', 404);
    }

    if (booking.userId.toString() !== user._id.toString()) {
      return forbiddenResponse('Not authorized');
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        bookingId: bookingId,
        userId: user._id.toString(),
      },
    });

    // Store payment intent ID in booking
    booking.payment.stripePaymentIntentId = paymentIntent.id;
    await booking.save();

    return Response.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    return errorResponse('Error creating payment intent', 500);
  }
}
