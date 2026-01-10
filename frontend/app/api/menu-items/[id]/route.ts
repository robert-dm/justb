import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import MenuItem from '@/lib/models/MenuItem';
import Provider from '@/lib/models/Provider';
import { getAuthUser, unauthorizedResponse, forbiddenResponse, errorResponse } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET single menu item
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();

    const { id } = await params;
    const menuItem = await MenuItem.findById(id).populate(
      'providerId',
      'businessName rating address'
    );

    if (!menuItem) {
      return errorResponse('Menu item not found', 404);
    }

    return Response.json({
      success: true,
      menuItem,
    });
  } catch (error) {
    console.error('Get menu item error:', error);
    return errorResponse('Error fetching menu item', 500);
  }
}

// PUT update menu item
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return unauthorizedResponse();
    }

    await connectDB();

    const { id } = await params;
    let menuItem = await MenuItem.findById(id);

    if (!menuItem) {
      return errorResponse('Menu item not found', 404);
    }

    // Verify ownership through provider
    const provider = await Provider.findById(menuItem.providerId);

    if (!provider) {
      return errorResponse('Provider not found', 404);
    }

    if (provider.userId.toString() !== user._id.toString() && user.role !== 'admin') {
      return forbiddenResponse('Not authorized to update this menu item');
    }

    const body = await request.json();
    // Prevent changing providerId
    delete body.providerId;

    menuItem = await MenuItem.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    return Response.json({
      success: true,
      menuItem,
    });
  } catch (error) {
    console.error('Update menu item error:', error);
    return errorResponse('Error updating menu item', 500);
  }
}

// DELETE menu item
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return unauthorizedResponse();
    }

    await connectDB();

    const { id } = await params;
    const menuItem = await MenuItem.findById(id);

    if (!menuItem) {
      return errorResponse('Menu item not found', 404);
    }

    // Verify ownership through provider
    const provider = await Provider.findById(menuItem.providerId);

    if (!provider) {
      return errorResponse('Provider not found', 404);
    }

    if (provider.userId.toString() !== user._id.toString() && user.role !== 'admin') {
      return forbiddenResponse('Not authorized to delete this menu item');
    }

    await menuItem.deleteOne();

    return Response.json({
      success: true,
      message: 'Menu item deleted successfully',
    });
  } catch (error) {
    console.error('Delete menu item error:', error);
    return errorResponse('Error deleting menu item', 500);
  }
}

// PATCH toggle availability
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return unauthorizedResponse();
    }

    await connectDB();

    const { id } = await params;
    const menuItem = await MenuItem.findById(id);

    if (!menuItem) {
      return errorResponse('Menu item not found', 404);
    }

    // Verify ownership
    const provider = await Provider.findById(menuItem.providerId);

    if (!provider) {
      return errorResponse('Provider not found', 404);
    }

    if (provider.userId.toString() !== user._id.toString() && user.role !== 'admin') {
      return forbiddenResponse('Not authorized to update this menu item');
    }

    menuItem.available = !menuItem.available;
    await menuItem.save();

    return Response.json({
      success: true,
      menuItem,
    });
  } catch (error) {
    console.error('Toggle availability error:', error);
    return errorResponse('Error toggling availability', 500);
  }
}
