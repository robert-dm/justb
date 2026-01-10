import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Booking from '@/lib/models/Booking';
import Provider from '@/lib/models/Provider';
import { getAuthUser, unauthorizedResponse, forbiddenResponse, errorResponse } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET single booking
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return unauthorizedResponse();
    }

    await connectDB();

    const { id } = await params;
    const booking = await Booking.findById(id)
      .populate('userId', 'name email phone address')
      .populate('providerId', 'businessName images address');

    if (!booking) {
      return errorResponse('Booking not found', 404);
    }

    // Check authorization
    const bookingUserId = booking.userId._id || booking.userId;
    if (bookingUserId.toString() !== user._id.toString() && user.role !== 'admin') {
      const provider = await Provider.findOne({ userId: user._id });
      const bookingProviderId = booking.providerId._id || booking.providerId;
      if (!provider || bookingProviderId.toString() !== provider._id.toString()) {
        return forbiddenResponse('Not authorized to view this booking');
      }
    }

    return Response.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error('Get booking error:', error);
    return errorResponse('Error fetching booking', 500);
  }
}

// PUT update booking status
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return unauthorizedResponse();
    }

    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const booking = await Booking.findById(id);

    if (!booking) {
      return errorResponse('Booking not found', 404);
    }

    // Only provider or admin can update status
    const provider = await Provider.findOne({ userId: user._id });
    if (!provider && user.role !== 'admin') {
      return forbiddenResponse('Not authorized to update this booking');
    }

    if (provider && booking.providerId.toString() !== provider._id.toString()) {
      return forbiddenResponse('Not authorized to update this booking');
    }

    booking.status = status;
    await booking.save();

    return Response.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error('Update booking error:', error);
    return errorResponse('Error updating booking status', 500);
  }
}

// DELETE (cancel) booking
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return unauthorizedResponse();
    }

    await connectDB();

    const { id } = await params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return errorResponse('Booking not found', 404);
    }

    // Check authorization
    if (booking.userId.toString() !== user._id.toString() && user.role !== 'admin') {
      return forbiddenResponse('Not authorized to cancel this booking');
    }

    booking.status = 'cancelled';
    await booking.save();

    return Response.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    return errorResponse('Error cancelling booking', 500);
  }
}

// PATCH add review
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return unauthorizedResponse();
    }

    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const { rating, comment } = body;

    const booking = await Booking.findById(id);

    if (!booking) {
      return errorResponse('Booking not found', 404);
    }

    // Check authorization
    if (booking.userId.toString() !== user._id.toString()) {
      return forbiddenResponse('Not authorized to review this booking');
    }

    // Check if booking is completed
    if (booking.status !== 'completed' && booking.status !== 'delivered') {
      return errorResponse('Can only review completed bookings', 400);
    }

    booking.review = {
      rating,
      comment,
      createdAt: new Date(),
    };

    await booking.save();

    // Update provider rating
    const provider = await Provider.findById(booking.providerId);
    if (provider) {
      const allBookings = await Booking.find({
        providerId: provider._id,
        'review.rating': { $exists: true },
      });

      const totalRating = allBookings.reduce((sum, b) => sum + (b.review?.rating || 0), 0);
      const avgRating = totalRating / allBookings.length;

      provider.rating = {
        average: avgRating,
        count: allBookings.length,
      };

      await provider.save();
    }

    return Response.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error('Add review error:', error);
    return errorResponse('Error adding review', 500);
  }
}
