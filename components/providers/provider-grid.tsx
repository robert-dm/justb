'use client';

import { Provider } from '@/types';
import { ProviderCard } from './provider-card';
import { SearchX } from 'lucide-react';
import { useTranslation } from '@/hooks';

interface ProviderGridProps {
  providers: Provider[];
  isLoading?: boolean;
}

export function ProviderGrid({ providers, isLoading }: ProviderGridProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-80 animate-pulse rounded-lg bg-muted"
          />
        ))}
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="py-16 text-center">
        <SearchX className="mx-auto h-16 w-16 text-muted-foreground" />
        <h3 className="mt-4 text-xl font-semibold">{t('providers', 'noProviders')}</h3>
        <p className="mt-2 text-text-light">
          {t('providers', 'tryAdjustingSearch')}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {providers.map((provider) => (
        <ProviderCard key={provider._id} provider={provider} />
      ))}
    </div>
  );
}
