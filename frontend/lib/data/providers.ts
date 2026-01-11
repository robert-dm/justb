import connectDB from '@/lib/db';
import Provider from '@/lib/models/Provider';
import MenuItem from '@/lib/models/MenuItem';
import '@/lib/models/User'; // Register User model for populate
import { IProvider } from '@/lib/models/Provider';
import { IMenuItem } from '@/lib/models/MenuItem';

export async function getProviderById(id: string): Promise<IProvider | null> {
  await connectDB();
  const provider = await Provider.findById(id).populate('userId', 'name email phone');
  return provider;
}

export async function getMenuItemsByProvider(providerId: string): Promise<IMenuItem[]> {
  await connectDB();
  const menuItems = await MenuItem.find({ providerId, available: true }).sort('-createdAt');
  return menuItems;
}

export async function getAllProviders(): Promise<IProvider[]> {
  await connectDB();
  const providers = await Provider.find({ active: true })
    .populate('userId', 'name email phone')
    .sort('-rating.average');
  return providers;
}
