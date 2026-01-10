import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import MenuItem from '@/lib/models/MenuItem';
import Provider from '@/lib/models/Provider';
import { getAuthUser, unauthorizedResponse, forbiddenResponse, errorResponse } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ providerId: string }>;
}

// GET all menu items for a provider
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();

    const { providerId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const available = searchParams.get('available');
    const search = searchParams.get('search');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { providerId };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by availability
    if (available !== null) {
      query.available = available === 'true';
    }

    // Text search on name and description
    if (search) {
      query.$text = { $search: search };
    }

    const menuItems = await MenuItem.find(query).sort('-createdAt');

    return Response.json({
      success: true,
      count: menuItems.length,
      menuItems,
    });
  } catch (error) {
    console.error('Get menu items error:', error);
    return errorResponse('Error fetching menu items', 500);
  }
}

// POST create menu item for provider
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return unauthorizedResponse();
    }

    await connectDB();

    const { providerId } = await params;

    // Verify provider exists and user owns it
    const provider = await Provider.findById(providerId);

    if (!provider) {
      return errorResponse('Provider not found', 404);
    }

    if (provider.userId.toString() !== user._id.toString() && user.role !== 'admin') {
      return forbiddenResponse('Not authorized to add menu items to this provider');
    }

    const body = await request.json();
    const menuItemData = {
      ...body,
      providerId,
    };

    const menuItem = await MenuItem.create(menuItemData);

    return Response.json(
      {
        success: true,
        menuItem,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create menu item error:', error);

    if ((error as { name?: string }).name === 'ValidationError') {
      const validationError = error as { errors: Record<string, { message: string }> };
      const messages = Object.values(validationError.errors).map((err) => err.message);
      return errorResponse(`Validation failed: ${messages.join(', ')}`, 400);
    }

    return errorResponse('Error creating menu item', 500);
  }
}
