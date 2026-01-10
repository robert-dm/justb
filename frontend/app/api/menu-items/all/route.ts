import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import MenuItem from '@/lib/models/MenuItem';
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

    const menuItems = await MenuItem.find(query)
      .populate('providerId', 'businessName rating address')
      .sort('-createdAt')
      .limit(50);

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
