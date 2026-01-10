import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Booking from '@/lib/models/Booking';
import Provider from '@/lib/models/Provider';
import { getAuthUser, unauthorizedResponse, errorResponse } from '@/lib/auth';

// GET user's bookings or provider's bookings
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return unauthorizedResponse();
    }

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // 'user' or 'provider'

    if (type === 'provider') {
      // Get provider's bookings
      const provider = await Provider.findOne({ userId: user._id });
      if (!provider) {
        return errorResponse('Provider profile not found', 404);
      }

      const bookings = await Booking.find({ providerId: provider._id })
        .populate('userId', 'name email phone address')
        .sort('-deliveryDate');

      return Response.json({
        success: true,
        count: bookings.length,
        bookings,
      });
    }

    // Default: get user's bookings
    const bookings = await Booking.find({ userId: user._id })
      .populate('providerId', 'businessName images address')
      .sort('-createdAt');

    return Response.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    return errorResponse('Error fetching bookings', 500);
  }
}

// POST create new booking
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return unauthorizedResponse();
    }

    await connectDB();

    const body = await request.json();
    const bookingData = {
      ...body,
      userId: user._id,
    };

    // Verify provider exists
    const provider = await Provider.findById(bookingData.providerId);
    if (!provider) {
      return errorResponse('Provider not found', 404);
    }

    const booking = await Booking.create(bookingData);

    return Response.json(
      {
        success: true,
        booking,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create booking error:', error);
    return errorResponse('Error creating booking', 500);
  }
}
