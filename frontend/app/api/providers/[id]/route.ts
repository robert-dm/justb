import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Provider from '@/lib/models/Provider';
import { getAuthUser, unauthorizedResponse, forbiddenResponse, errorResponse } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET single provider by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();

    const { id } = await params;
    const provider = await Provider.findById(id).populate('userId', 'name email phone');

    if (!provider) {
      return errorResponse('Provider not found', 404);
    }

    return Response.json({
      success: true,
      provider,
    });
  } catch (error) {
    console.error('Get provider error:', error);
    return errorResponse('Error fetching provider', 500);
  }
}

// PUT update provider
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return unauthorizedResponse();
    }

    await connectDB();

    const { id } = await params;
    let provider = await Provider.findById(id);

    if (!provider) {
      return errorResponse('Provider not found', 404);
    }

    // Check ownership
    if (provider.userId.toString() !== user._id.toString() && user.role !== 'admin') {
      return forbiddenResponse('Not authorized to update this provider');
    }

    const body = await request.json();
    provider = await Provider.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    return Response.json({
      success: true,
      provider,
    });
  } catch (error) {
    console.error('Update provider error:', error);
    return errorResponse('Error updating provider', 500);
  }
}

// DELETE provider
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return unauthorizedResponse();
    }

    await connectDB();

    const { id } = await params;
    const provider = await Provider.findById(id);

    if (!provider) {
      return errorResponse('Provider not found', 404);
    }

    // Check ownership
    if (provider.userId.toString() !== user._id.toString() && user.role !== 'admin') {
      return forbiddenResponse('Not authorized to delete this provider');
    }

    await provider.deleteOne();

    return Response.json({
      success: true,
      message: 'Provider deleted successfully',
    });
  } catch (error) {
    console.error('Delete provider error:', error);
    return errorResponse('Error deleting provider', 500);
  }
}
