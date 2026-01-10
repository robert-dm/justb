import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Provider from '@/lib/models/Provider';
import { getAuthUser, unauthorizedResponse, errorResponse } from '@/lib/auth';

// GET all providers with search and filtering
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius');
    const cuisine = searchParams.get('cuisine');
    const delivery = searchParams.get('delivery');
    const pickup = searchParams.get('pickup');
    const minRating = searchParams.get('minRating');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { active: true };

    // Filter by cuisine
    if (cuisine) {
      query.cuisine = { $in: cuisine.split(',') };
    }

    // Filter by service type
    if (delivery === 'true') {
      query['serviceType.delivery'] = true;
    }
    if (pickup === 'true') {
      query['serviceType.pickup'] = true;
    }

    // Filter by minimum rating
    if (minRating) {
      query['rating.average'] = { $gte: parseFloat(minRating) };
    }

    // Geospatial query for nearby providers
    if (lat && lng) {
      const radiusInKm = radius ? parseFloat(radius) : 10;
      const radiusInMeters = radiusInKm * 1000;

      query['address.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: radiusInMeters,
        },
      };
    }

    const providers = await Provider.find(query)
      .populate('userId', 'name email phone')
      .sort('-rating.average');

    return Response.json({
      success: true,
      count: providers.length,
      providers,
    });
  } catch (error) {
    console.error('Get providers error:', error);
    return errorResponse('Error fetching providers', 500);
  }
}

// POST create provider profile
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return unauthorizedResponse();
    }

    await connectDB();

    const body = await request.json();
    const { businessName, description, address } = body;

    // Validate required fields
    if (!businessName || !description) {
      return errorResponse('Business name and description are required', 400);
    }

    if (!address || !address.street || !address.city || !address.zipCode || !address.country) {
      return errorResponse('Complete address is required (street, city, zip code, country)', 400);
    }

    if (!address.coordinates || !address.coordinates.lat || !address.coordinates.lng) {
      return errorResponse('Coordinates (latitude and longitude) are required', 400);
    }

    const providerData = {
      ...body,
      userId: user._id,
    };

    const provider = await Provider.create(providerData);

    return Response.json(
      {
        success: true,
        provider,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create provider error:', error);

    if ((error as { name?: string }).name === 'ValidationError') {
      const validationError = error as { errors: Record<string, { message: string }> };
      const messages = Object.values(validationError.errors).map((err) => err.message);
      return errorResponse(`Validation failed: ${messages.join(', ')}`, 400);
    }

    return errorResponse('Error creating provider', 500);
  }
}
