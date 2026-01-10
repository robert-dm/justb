import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Provider from '@/lib/models/Provider';
import { getAuthUser, unauthorizedResponse, errorResponse } from '@/lib/auth';

// GET provider's own profile
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return unauthorizedResponse();
    }

    await connectDB();

    const provider = await Provider.findOne({ userId: user._id });

    if (!provider) {
      return errorResponse('Provider profile not found', 404);
    }

    return Response.json({
      success: true,
      provider,
    });
  } catch (error) {
    console.error('Get my provider error:', error);
    return errorResponse('Error fetching provider profile', 500);
  }
}
