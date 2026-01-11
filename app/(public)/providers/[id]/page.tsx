import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProviderById, getMenuItemsByProvider } from '@/lib/data/providers';
import { ProviderDetailContent } from './provider-detail-content';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const provider = await getProviderById(id);
    if (!provider) {
      return { title: 'Provider Not Found' };
    }
    return {
      title: provider.businessName,
      description: provider.description,
    };
  } catch {
    return {
      title: 'Provider Not Found',
    };
  }
}

export default async function ProviderDetailPage({ params }: Props) {
  const { id } = await params;

  console.log('Loading provider with ID:', id);
  console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);

  try {
    const [provider, menuItems] = await Promise.all([
      getProviderById(id),
      getMenuItemsByProvider(id),
    ]);

    console.log('Provider found:', !!provider);

    if (!provider) {
      console.log('Provider not found, returning 404');
      notFound();
    }

    // Convert Mongoose documents to plain objects for client component
    const providerData = JSON.parse(JSON.stringify(provider));
    const menuItemsData = JSON.parse(JSON.stringify(menuItems));

    return (
      <ProviderDetailContent
        provider={providerData}
        menuItems={menuItemsData}
      />
    );
  } catch (error) {
    console.error('Error loading provider:', error);
    notFound();
  }
}
