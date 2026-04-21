'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MapPin, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useGoogleMaps, useTranslation } from '@/hooks';
import { useCartStore } from '@/stores';
import { toast } from 'sonner';

interface ProviderFiltersProps {
  onUseLocation: () => void;
  isLoadingLocation?: boolean;
}

export function ProviderFilters({
  onUseLocation,
  isLoadingLocation,
}: ProviderFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded } = useGoogleMaps();
  const { t } = useTranslation();
  const setSearchAddress = useCartStore((s) => s.setSearchAddress);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/providers?${params.toString()}`);
    },
    [router, searchParams]
  );

  const toggleFilter = useCallback(
    (key: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (params.has(key)) {
        params.delete(key);
      } else {
        params.set(key, 'true');
      }
      router.push(`/providers?${params.toString()}`);
    },
    [router, searchParams]
  );

  // Initialize Google Places Autocomplete on the address input
  useEffect(() => {
    if (!isLoaded || !addressInputRef.current || autocompleteRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(
      addressInputRef.current,
      { fields: ['geometry', 'formatted_address'] }
    );

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.geometry?.location) {
        toast.error(t('providers', 'locationNotFound'));
        return;
      }

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const street = place.formatted_address || 'Selected location';

      setSearchAddress({ street, lat, lng });

      const params = new URLSearchParams(searchParams.toString());
      params.set('lat', lat.toString());
      params.set('lng', lng.toString());
      router.push(`/providers?${params.toString()}`);
      toast.success(t('providers', 'showingNear') + ' ' + street);
    });

    autocompleteRef.current = autocomplete;
  }, [isLoaded, router, searchParams]);

  return (
    <div className="space-y-4 rounded-lg bg-background-light p-6">
      {/* Search and Location */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={addressInputRef}
              placeholder={t('providers', 'addressPlaceholder')}
              className="bg-white pl-9"
            />
          </div>
          <Button
            variant="secondary"
            onClick={onUseLocation}
            disabled={isLoadingLocation}
          >
            {isLoadingLocation ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
            <span className="ml-2 hidden sm:inline">{t('providers', 'useMyLocation')}</span>
          </Button>
        </div>
      </div>

      {/* Filter Options */}
      <div className="flex flex-wrap items-center gap-6">
        <span className="font-medium text-text-dark">{t('providers', 'filters')}</span>

        {/* Delivery */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="delivery"
            checked={searchParams.has('delivery')}
            onCheckedChange={() => toggleFilter('delivery')}
          />
          <Label htmlFor="delivery" className="cursor-pointer text-sm">
            {t('providers', 'deliveryAvailable')}
          </Label>
        </div>

        {/* Pickup */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="pickup"
            checked={searchParams.has('pickup')}
            onCheckedChange={() => toggleFilter('pickup')}
          />
          <Label htmlFor="pickup" className="cursor-pointer text-sm">
            {t('providers', 'pickupAvailable')}
          </Label>
        </div>

        {/* Cuisine */}
        <Select
          value={searchParams.get('cuisine') || 'all'}
          onValueChange={(value) => updateFilter('cuisine', value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-40 bg-white">
            <SelectValue placeholder={t('providers', 'allCuisines')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('providers', 'allCuisines')}</SelectItem>
            <SelectItem value="traditional">{t('providers', 'traditional')}</SelectItem>
            <SelectItem value="continental">{t('providers', 'continental')}</SelectItem>
            <SelectItem value="vegan">{t('providers', 'vegan')}</SelectItem>
            <SelectItem value="gluten-free">{t('providers', 'glutenFree')}</SelectItem>
          </SelectContent>
        </Select>

        {/* Rating */}
        <Select
          value={searchParams.get('minRating') || 'all'}
          onValueChange={(value) => updateFilter('minRating', value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-32 bg-white">
            <SelectValue placeholder={t('providers', 'allRatings')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('providers', 'allRatings')}</SelectItem>
            <SelectItem value="4">{t('providers', 'fourPlusStars')}</SelectItem>
            <SelectItem value="4.5">{t('providers', 'fourFivePlusStars')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
