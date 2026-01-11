'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ProviderFilters, ProviderGrid } from '@/components/providers';
import { useGeolocation } from '@/hooks';
import { providersApi } from '@/lib/api';
import { Provider, ProviderFilters as Filters } from '@/types';

export function ProvidersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getLocation, isLoading: isLoadingLocation } = useGeolocation();

  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resultsCount, setResultsCount] = useState(0);

  const loadProviders = useCallback(async () => {
    setIsLoading(true);
    try {
      const filters: Filters = {};

      const lat = searchParams.get('lat');
      const lng = searchParams.get('lng');
      if (lat && lng) {
        filters.lat = parseFloat(lat);
        filters.lng = parseFloat(lng);
        filters.radius = 25;
      }

      if (searchParams.has('delivery')) filters.delivery = true;
      if (searchParams.has('pickup')) filters.pickup = true;

      const cuisine = searchParams.get('cuisine');
      if (cuisine) filters.cuisine = cuisine;

      const minRating = searchParams.get('minRating');
      if (minRating) filters.minRating = parseFloat(minRating);

      const response = await providersApi.getAll(filters);
      setProviders(response.providers);
      setResultsCount(response.count);
    } catch (error) {
      toast.error('Failed to load providers');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  const handleUseLocation = async () => {
    const coords = await getLocation();
    if (coords) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('lat', coords.lat.toString());
      params.set('lng', coords.lng.toString());
      router.push(`/providers?${params.toString()}`);
      toast.success('Location updated');
    } else {
      toast.error('Could not get your location');
    }
  };

  return (
    <>
      {/* Filters Section */}
      <section className="bg-background-light py-6">
        <div className="container mx-auto px-6">
          <ProviderFilters
            onUseLocation={handleUseLocation}
            isLoadingLocation={isLoadingLocation}
          />
        </div>
      </section>

      {/* Results Section */}
      <section className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-dark">
            {searchParams.has('lat')
              ? 'Breakfast Providers Near You'
              : 'All Breakfast Providers'}
          </h1>
          <p className="text-text-light">
            {resultsCount} provider{resultsCount !== 1 ? 's' : ''} found
          </p>
        </div>

        <ProviderGrid providers={providers} isLoading={isLoading} />
      </section>
    </>
  );
}
