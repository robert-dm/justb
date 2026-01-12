'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2, MapPin, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useGoogleMaps } from '@/hooks';
import { toast } from 'sonner';

export interface AddressWithCoordinates {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  coordinates?: { lat: number; lng: number };
}

interface AddressMapPickerProps {
  value: AddressWithCoordinates;
  onChange: (address: AddressWithCoordinates) => void;
  disabled?: boolean;
  className?: string;
  defaultCenter?: { lat: number; lng: number };
  defaultZoom?: number;
}

// Default to San Francisco as fallback
const DEFAULT_CENTER = { lat: 37.7749, lng: -122.4194 };
const DEFAULT_ZOOM = 13;

/**
 * Parses Google Maps address components into our address structure
 */
function parseAddressComponents(
  components: google.maps.GeocoderAddressComponent[]
): Partial<AddressWithCoordinates> {
  const address: Partial<AddressWithCoordinates> = {};

  components.forEach((component) => {
    const types = component.types;

    if (types.includes('street_number')) {
      address.street = component.long_name;
    } else if (types.includes('route')) {
      address.street = address.street
        ? `${address.street} ${component.long_name}`
        : component.long_name;
    } else if (types.includes('locality')) {
      address.city = component.long_name;
    } else if (types.includes('administrative_area_level_1')) {
      address.state = component.short_name;
    } else if (types.includes('postal_code')) {
      address.zipCode = component.long_name;
    } else if (types.includes('country')) {
      address.country = component.long_name;
    }
  });

  return address;
}

export function AddressMapPicker({
  value,
  onChange,
  disabled = false,
  className = '',
  defaultCenter,
  defaultZoom = DEFAULT_ZOOM,
}: AddressMapPickerProps) {
  const { isLoaded, loadError } = useGoogleMaps();

  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  /**
   * Reverse geocode coordinates to get address
   */
  const reverseGeocode = useCallback(
    async (lat: number, lng: number): Promise<Partial<AddressWithCoordinates> | null> => {
      if (!window.google?.maps) return null;

      setIsGeocoding(true);

      try {
        const geocoder = new google.maps.Geocoder();
        const result = await geocoder.geocode({ location: { lat, lng } });

        if (result.results[0]) {
          const parsedAddress = parseAddressComponents(result.results[0].address_components);
          return parsedAddress;
        }

        return null;
      } catch (error) {
        console.error('Reverse geocoding error:', error);
        toast.error('Failed to get address for this location');
        return null;
      } finally {
        setIsGeocoding(false);
      }
    },
    []
  );

  /**
   * Update marker position and optionally reverse geocode
   */
  const updateMarkerPosition = useCallback(
    async (lat: number, lng: number, shouldGeocode = true) => {
      if (!marker || !map) return;

      const position = { lat, lng };
      marker.setPosition(position);
      map.panTo(position);

      if (shouldGeocode) {
        const addressData = await reverseGeocode(lat, lng);
        if (addressData) {
          onChange({
            ...addressData,
            coordinates: { lat, lng },
          });
        } else {
          // Still update coordinates even if geocoding fails
          onChange({
            ...value,
            coordinates: { lat, lng },
          });
        }
      }
    },
    [marker, map, reverseGeocode, onChange, value]
  );

  /**
   * Handle map click
   */
  const handleMapClick = useCallback(
    (event: google.maps.MapMouseEvent) => {
      if (disabled || !event.latLng) return;

      const lat = event.latLng.lat();
      const lng = event.latLng.lng();

      updateMarkerPosition(lat, lng, true);
    },
    [disabled, updateMarkerPosition]
  );

  /**
   * Handle autocomplete place selection
   */
  const handlePlaceSelect = useCallback(() => {
    if (!autocomplete || disabled) return;

    const place = autocomplete.getPlace();

    if (!place.geometry?.location) {
      toast.error('No location data found for this place');
      return;
    }

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    // Parse address from place
    const addressData = place.address_components
      ? parseAddressComponents(place.address_components)
      : {};

    onChange({
      ...addressData,
      coordinates: { lat, lng },
    });

    // Update map and marker
    updateMarkerPosition(lat, lng, false);
  }, [autocomplete, disabled, onChange, updateMarkerPosition]);

  /**
   * Initialize map
   */
  useEffect(() => {
    if (!isLoaded || !mapRef.current || map) return;

    // Determine center, ensuring we have valid coordinates
    let center = DEFAULT_CENTER;

    if (value.coordinates?.lat && value.coordinates?.lng &&
        typeof value.coordinates.lat === 'number' &&
        typeof value.coordinates.lng === 'number' &&
        !isNaN(value.coordinates.lat) &&
        !isNaN(value.coordinates.lng)) {
      center = value.coordinates;
    } else if (defaultCenter?.lat && defaultCenter?.lng &&
               typeof defaultCenter.lat === 'number' &&
               typeof defaultCenter.lng === 'number' &&
               !isNaN(defaultCenter.lat) &&
               !isNaN(defaultCenter.lng)) {
      center = defaultCenter;
    }

    const newMap = new google.maps.Map(mapRef.current, {
      center,
      zoom: defaultZoom,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    });

    const newMarker = new google.maps.Marker({
      map: newMap,
      position: center,
      draggable: !disabled,
      title: 'Drag to adjust location',
    });

    // Add click listener to map
    newMap.addListener('click', handleMapClick);

    // Add drag listener to marker
    newMarker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
      if (!event.latLng) return;
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      updateMarkerPosition(lat, lng, true);
    });

    setMap(newMap);
    setMarker(newMarker);
  }, [isLoaded, map, value.coordinates, defaultCenter, defaultZoom, disabled, handleMapClick, updateMarkerPosition]);

  /**
   * Initialize autocomplete
   */
  useEffect(() => {
    if (!isLoaded || !searchInputRef.current || autocomplete) return;

    const newAutocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
      fields: ['address_components', 'geometry', 'name'],
    });

    newAutocomplete.addListener('place_changed', handlePlaceSelect);

    setAutocomplete(newAutocomplete);
  }, [isLoaded, autocomplete, handlePlaceSelect]);

  /**
   * Update marker when value changes externally
   */
  useEffect(() => {
    if (!marker || !map || !value.coordinates) return;

    const { lat, lng } = value.coordinates;

    // Only update if we have valid coordinates
    if (typeof lat === 'number' && typeof lng === 'number' &&
        !isNaN(lat) && !isNaN(lng)) {
      marker.setPosition({ lat, lng });
      map.panTo({ lat, lng });
    }
  }, [value.coordinates, marker, map]);

  /**
   * Update marker draggable state
   */
  useEffect(() => {
    if (!marker) return;
    marker.setDraggable(!disabled);
  }, [marker, disabled]);

  // Loading state
  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center h-[300px] md:h-[400px] border rounded-lg bg-muted/30 ${className}`}>
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading map...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div className={`p-6 border border-destructive rounded-lg bg-destructive/10 ${className}`}>
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-destructive">Failed to load map</p>
            <p className="text-sm text-destructive/80 mt-1">
              {loadError.message}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              You can still enter your address manually in the fields below.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={searchInputRef}
          type="text"
          placeholder="Search for an address..."
          disabled={disabled}
          className="pl-9"
        />
      </div>

      {/* Map container */}
      <div className="relative">
        <div
          ref={mapRef}
          className="w-full h-[300px] md:h-[400px] rounded-lg border"
        />

        {/* Geocoding overlay */}
        {isGeocoding && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-lg">
            <div className="bg-background border rounded-lg px-4 py-3 shadow-lg flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Getting address...</span>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <p className="text-sm text-muted-foreground">
        Search for an address above, click on the map, or drag the marker to select your location.
      </p>
    </div>
  );
}
