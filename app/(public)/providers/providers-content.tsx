'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MapIcon, UtensilsCrossed, Store, SearchX, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ProviderFilters, ProviderGrid, ProvidersMap } from '@/components/providers';
import { ProviderMenuSection } from '@/components/menu';
import { Button } from '@/components/ui/button';
import { useGeolocation, useGoogleMaps } from '@/hooks';
import { useCartStore } from '@/stores';
import { providersApi, menuItemsApi } from '@/lib/api';
import { Provider, MenuItem, ProviderFilters as Filters, MenuItemFilters } from '@/types';

type ViewMode = 'menu' | 'providers' | 'map';

export function ProvidersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getLocation, isLoading: isLoadingLocation } = useGeolocation();
  const { isLoaded: mapsLoaded } = useGoogleMaps();
  const setSearchAddress = useCartStore((s) => s.setSearchAddress);

  const [providers, setProviders] = useState<Provider[]>([]);
  const [menuItems, setMenuItems] = useState<(MenuItem & { providerId: Provider })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('menu');

  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const hasLocation = !!lat && !!lng;

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Build filters from URL params
      const providerFilters: Filters = {};
      const menuFilters: MenuItemFilters = {};

      if (lat && lng) {
        providerFilters.lat = parseFloat(lat);
        providerFilters.lng = parseFloat(lng);
        providerFilters.radius = 50;
        menuFilters.lat = parseFloat(lat);
        menuFilters.lng = parseFloat(lng);
      }

      if (searchParams.has('delivery')) providerFilters.delivery = true;
      if (searchParams.has('pickup')) providerFilters.pickup = true;

      const cuisine = searchParams.get('cuisine');
      if (cuisine) providerFilters.cuisine = cuisine;

      const minRating = searchParams.get('minRating');
      if (minRating) providerFilters.minRating = parseFloat(minRating);

      const category = searchParams.get('category');
      if (category) menuFilters.category = category as MenuItemFilters['category'];

      const search = searchParams.get('search');
      if (search) menuFilters.search = search;

      // Fetch both in parallel
      const [providersRes, menuRes] = await Promise.all([
        providersApi.getAll(providerFilters),
        menuItemsApi.getAll(menuFilters),
      ]);

      setProviders(providersRes.providers);
      setMenuItems(menuRes.menuItems as (MenuItem & { providerId: Provider })[]);
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, lat, lng]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUseLocation = async () => {
    const coords = await getLocation();
    if (coords) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('lat', coords.lat.toString());
      params.set('lng', coords.lng.toString());
      router.push(`/providers?${params.toString()}`);

      // Reverse geocode to get a readable address
      if (mapsLoaded) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode(
          { location: { lat: coords.lat, lng: coords.lng } },
          (results, status) => {
            const street =
              status === 'OK' && results?.[0]
                ? results[0].formatted_address
                : 'My location';
            setSearchAddress({ street, lat: coords.lat, lng: coords.lng });
          }
        );
      } else {
        setSearchAddress({ street: 'My location', lat: coords.lat, lng: coords.lng });
      }

      toast.success('Location updated');
    } else {
      toast.error('Could not get your location');
    }
  };

  // Group menu items by provider for a cleaner display
  const menuItemsByProvider = menuItems.reduce<
    Record<string, { provider: Provider; items: (MenuItem & { providerId: Provider })[] }>
  >((acc, item) => {
    const provider = item.providerId;
    if (!provider?._id) return acc;
    if (!acc[provider._id]) {
      acc[provider._id] = { provider, items: [] };
    }
    acc[provider._id].items.push(item);
    return acc;
  }, {});

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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-dark">
              {hasLocation
                ? 'Breakfast Available Near You'
                : 'Browse Breakfast Menu'}
            </h1>
            <p className="text-text-light">
              {viewMode === 'menu'
                ? `${menuItems.length} item${menuItems.length !== 1 ? 's' : ''} from ${Object.keys(menuItemsByProvider).length} provider${Object.keys(menuItemsByProvider).length !== 1 ? 's' : ''}`
                : `${providers.length} provider${providers.length !== 1 ? 's' : ''} found`}
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'menu' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('menu')}
            >
              <UtensilsCrossed className="h-4 w-4 mr-2" />
              Menu
            </Button>
            <Button
              variant={viewMode === 'providers' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('providers')}
            >
              <Store className="h-4 w-4 mr-2" />
              Providers
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('map')}
            >
              <MapIcon className="h-4 w-4 mr-2" />
              Map
            </Button>
          </div>
        </div>

        {/* View content */}
        {viewMode === 'menu' && (
          <MenuBrowseView
            menuItemsByProvider={menuItemsByProvider}
            isLoading={isLoading}
          />
        )}
        {viewMode === 'providers' && (
          <ProviderGrid providers={providers} isLoading={isLoading} />
        )}
        {viewMode === 'map' && (
          <ProvidersMap
            providers={providers}
            userLocation={
              hasLocation
                ? { lat: parseFloat(lat!), lng: parseFloat(lng!) }
                : undefined
            }
          />
        )}
      </section>
    </>
  );
}

function MenuBrowseView({
  menuItemsByProvider,
  isLoading,
}: {
  menuItemsByProvider: Record<
    string,
    { provider: Provider; items: (MenuItem & { providerId: Provider })[] }
  >;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-text-light">Loading menu items...</p>
        </div>
      </div>
    );
  }

  const providerGroups = Object.values(menuItemsByProvider);

  if (providerGroups.length === 0) {
    return (
      <div className="py-16 text-center">
        <SearchX className="mx-auto h-16 w-16 text-muted-foreground" />
        <h3 className="mt-4 text-xl font-semibold">No menu items found</h3>
        <p className="mt-2 text-text-light">
          Try adjusting your location or filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {providerGroups.map(({ provider, items }) => (
        <ProviderMenuSection
          key={provider._id}
          provider={provider}
          items={items}
        />
      ))}
    </div>
  );
}
