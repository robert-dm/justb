import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import MenuItem from '@/lib/models/MenuItem';
import Provider from '@/lib/models/Provider';
import { errorResponse } from '@/lib/auth';

// GET all menu items across all providers
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { available: true };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // If location provided, only show items from providers within delivery range
    if (lat && lng) {
      const providerPipeline: any[] = [
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)],
            },
            distanceField: 'distance',
            maxDistance: 50000, // 50km upper bound
            spherical: true,
            key: 'address.location',
            query: { active: true },
          },
        },
        {
          $match: {
            $expr: {
              $lte: [
                '$distance',
                { $multiply: [{ $ifNull: ['$deliveryRadius', 5] }, 1000] },
              ],
            },
          },
        },
        { $project: { _id: 1 } },
      ];

      const nearbyProviders = await Provider.aggregate(providerPipeline);
      const providerIds = nearbyProviders.map((p: { _id: string }) => p._id);

      query.providerId = { $in: providerIds };
    }

    const menuItems = await MenuItem.find(query)
      .populate('providerId', 'businessName rating address images deliveryFee serviceType')
      .sort('-createdAt')
      .limit(100);

    return Response.json({
      success: true,
      count: menuItems.length,
      menuItems,
    });
  } catch (error) {
    console.error('Get all menu items error:', error);
    return errorResponse('Error fetching menu items', 500);
  }
}
