import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { providersApi, menuItemsApi } from '@/lib/api';
import { ProviderDetailContent } from './provider-detail-content';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const response = await providersApi.getById(id);
    return {
      title: response.provider.businessName,
      description: response.provider.description,
    };
  } catch {
    return {
      title: 'Provider Not Found',
    };
  }
}

export default async function ProviderDetailPage({ params }: Props) {
  const { id } = await params;

  try {
    const [providerResponse, menuResponse] = await Promise.all([
      providersApi.getById(id),
      menuItemsApi.getByProvider(id),
    ]);

    return (
      <ProviderDetailContent
        provider={providerResponse.provider}
        menuItems={menuResponse.menuItems}
      />
    );
  } catch (error) {
    notFound();
  }
}
