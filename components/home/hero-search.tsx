'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGoogleMaps, useGeolocation, useTranslation } from '@/hooks';
import { useCartStore } from '@/stores';
import { toast } from 'sonner';

export function HeroSearch() {
  const router = useRouter();
  const { t } = useTranslation();
  const { isLoaded } = useGoogleMaps();
  const { getLocation, isLoading: isGettingLocation } = useGeolocation();
  const setSearchAddress = useCartStore((s) => s.setSearchAddress);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      fields: ['geometry', 'formatted_address'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.geometry?.location) {
        toast.error(t('heroSearch', 'addressNotFound'));
        return;
      }

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const street = place.formatted_address || 'Selected location';
      setSearchAddress({ street, lat, lng });
      router.push(`/providers?lat=${lat}&lng=${lng}`);
    });

    autocompleteRef.current = autocomplete;
  }, [isLoaded, router]);

  const handleUseMyLocation = async () => {
    const coords = await getLocation();
    if (coords) {
      // Reverse geocode to get a readable address
      if (isLoaded) {
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
      router.push(`/providers?lat=${coords.lat}&lng=${coords.lng}`);
    } else {
      toast.error(t('heroSearch', 'locationError'));
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <div className="flex gap-2 rounded-full bg-white p-2 shadow-lg">
        <input
          ref={inputRef}
          type="text"
          placeholder={t('heroSearch', 'placeholder')}
          className="flex-1 rounded-full px-6 py-3 text-base outline-none placeholder:text-text-light"
        />
        <Button
          size="lg"
          className="rounded-full px-8"
          onClick={() => {
            // If user typed but didn't select from autocomplete, trigger a search
            if (inputRef.current?.value) {
              toast.info(t('heroSearch', 'selectFromDropdown'));
            }
          }}
        >
          {t('heroSearch', 'search')}
        </Button>
      </div>

      <button
        onClick={handleUseMyLocation}
        disabled={isGettingLocation}
        className="inline-flex items-center gap-2 text-sm text-text-light hover:text-primary transition-colors"
      >
        {isGettingLocation ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MapPin className="h-4 w-4" />
        )}
        {t('heroSearch', 'useMyLocation')}
      </button>
    </div>
  );
}
