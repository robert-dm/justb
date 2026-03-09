import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Booking from '@/lib/models/Booking';
import { getAuthUser, unauthorizedResponse, errorResponse } from '@/lib/auth';

// POST simulate payment for one or multiple bookings
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return unauthorizedResponse();
    }

    await connectDB();

    const body = await request.json();
    const { bookingId, groupId } = body;

    let bookings;

    if (groupId) {
      // Pay all bookings in a group
      bookings = await Booking.find({
        groupId,
        userId: user._id,
      });
      // Filter to only unpaid ones (but process all in the group)
      bookings = bookings.filter(
        (b) => !b.payment?.status || b.payment.status === 'pending'
      );
    } else if (bookingId) {
      const booking = await Booking.findOne({
        _id: bookingId,
        userId: user._id,
      });
      bookings = booking ? [booking] : [];
    } else {
      return errorResponse('bookingId or groupId is required', 400);
    }

    if (!bookings || bookings.length === 0) {
      return errorResponse('No pending bookings found', 404);
    }

    // Mark all as paid
    for (const booking of bookings) {
      booking.payment.method = 'card';
      booking.payment.status = 'completed';
      booking.payment.paidAt = new Date();
      booking.payment.stripePaymentIntentId = `sim_${Date.now()}_${booking._id}`;
      booking.status = 'confirmed';
      await booking.save();
    }

    return Response.json({
      success: true,
      message: `Payment simulated for ${bookings.length} booking(s)`,
      bookings,
    });
  } catch (error) {
    console.error('Simulate payment error:', error);
    return errorResponse('Error simulating payment', 500);
  }
}
