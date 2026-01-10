import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from './db';
import User, { IUser } from './models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function generateToken(id: string): string {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '7d',
  });
}

export function verifyToken(token: string): { id: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    return decoded;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return null;
}

export async function getAuthUser(request: NextRequest): Promise<IUser | null> {
  const token = getTokenFromRequest(request);
  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return null;
  }

  await connectDB();
  const user = await User.findById(decoded.id);
  return user;
}

export function unauthorizedResponse(message: string = 'Not authorized to access this route') {
  return Response.json(
    { success: false, message },
    { status: 401 }
  );
}

export function forbiddenResponse(message: string = 'Not authorized to access this route') {
  return Response.json(
    { success: false, message },
    { status: 403 }
  );
}

export function errorResponse(message: string, status: number = 500) {
  return Response.json(
    { success: false, message },
    { status }
  );
}
