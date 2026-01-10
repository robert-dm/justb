import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { generateToken, errorResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, email, password, role, phone, address } = body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse('User already exists with this email', 400);
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'tourist',
      phone,
      address,
    });

    // Generate token
    const token = generateToken(user._id.toString());

    return Response.json(
      {
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          profileImage: user.profileImage,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);

    // Handle MongoDB duplicate key error
    if ((error as { code?: number }).code === 11000) {
      return errorResponse('User already exists with this email', 400);
    }

    // Handle validation errors
    if ((error as { name?: string }).name === 'ValidationError') {
      const validationError = error as { errors: Record<string, { message: string }> };
      const messages = Object.values(validationError.errors).map((err) => err.message);
      return errorResponse(messages.join(', '), 400);
    }

    return errorResponse('Error registering user', 500);
  }
}
