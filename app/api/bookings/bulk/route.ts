import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Booking from '@/lib/models/Booking';
import Provider from '@/lib/models/Provider';
import { getAuthUser, unauthorizedResponse, errorResponse } from '@/lib/auth';

// POST create multiple bookings for consecutive days
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return unauthorizedResponse();
    }

    await connectDB();

    const body = await request.json();
    const { providerId, items, days, deliveryType, deliveryAddress, pricing, specialInstructions } = body;

    if (!days || !Array.isArray(days) || days.length === 0) {
      return errorResponse('At least one delivery day is required', 400);
    }

    if (days.length > 14) {
      return errorResponse('Maximum 14 consecutive days allowed', 400);
    }

    // Verify provider exists
    const provider = await Provider.findById(providerId);
    if (!provider) {
      return errorResponse('Provider not found', 404);
    }

    // Generate a group ID to link all bookings
    const groupId = new mongoose.Types.ObjectId().toString();

    const bookings = [];
    for (const day of days) {
      const booking = await Booking.create({
        userId: user._id,
        providerId,
        items: items.map((item: Record<string, unknown>) => ({ ...item })),
        deliveryDate: day.date,
        deliveryTime: day.time,
        deliveryType,
        deliveryAddress: deliveryAddress ? { ...deliveryAddress } : undefined,
        pricing: { ...pricing },
        specialInstructions,
        groupId,
      });
      bookings.push(booking);
    }

    return Response.json(
      {
        success: true,
        bookings,
        groupId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create bulk bookings error:', error);
    return errorResponse('Error creating bookings', 500);
  }
}
