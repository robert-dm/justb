'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGoogleMaps, useGeolocation } from '@/hooks';
import { Provider } from '@/types';
import { toast } from 'sonner';

interface ProvidersMapProps {
  providers: Provider[];
  userLocation?: { lat: number; lng: number };
}

const DEFAULT_CENTER = { lat: 37.7749, lng: -122.4194 }; // San Francisco
const DEFAULT_ZOOM = 12;

export function ProvidersMap({ providers, userLocation }: ProvidersMapProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded, loadError } = useGoogleMaps();
  const { getLocation, isLoading: isGettingLocation } = useGeolocation();

  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);

  /**
   * Initialize map
   */
  useEffect(() => {
    if (!isLoaded || !mapRef.current || map) return;

    const center = userLocation || DEFAULT_CENTER;

    const newMap = new google.maps.Map(mapRef.current, {
      center,
      zoom: userLocation ? 13 : DEFAULT_ZOOM,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });

    const newInfoWindow = new google.maps.InfoWindow();

    setMap(newMap);
    setInfoWindow(newInfoWindow);
  }, [isLoaded, map, userLocation]);

  /**
   * Create provider markers
   */
  useEffect(() => {
    if (!map || !infoWindow) return;

    // Clear existing markers
    markers.forEach((marker) => marker.setMap(null));

    // Create new markers for each provider
    const newMarkers = providers
      .filter((provider) => provider.address?.coordinates?.lat && provider.address?.coordinates?.lng)
      .map((provider) => {
        const position = {
          lat: provider.address!.coordinates!.lat,
          lng: provider.address!.coordinates!.lng,
        };

        const marker = new google.maps.Marker({
          position,
          map,
          title: provider.businessName,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#ef4444',
            fillOpacity: 0.9,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });

        // Add click listener to show info window
        marker.addListener('click', () => {
          const content = `
            <div style="padding: 8px; max-width: 250px;">
              <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 8px;">${provider.businessName}</h3>
              ${provider.description ? `<p style="color: #666; font-size: 14px; margin-bottom: 8px;">${provider.description.substring(0, 100)}${provider.description.length > 100 ? '...' : ''}</p>` : ''}
              <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 4px;">
                <span style="color: #666;">📍</span>
                <span style="font-size: 12px; color: #666;">${provider.address?.street}, ${provider.address?.city}</span>
              </div>
              ${provider.rating?.average ? `
                <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
                  <span>⭐</span>
                  <span style="font-size: 14px;">${provider.rating.average.toFixed(1)} (${provider.rating.count} reviews)</span>
                </div>
              ` : ''}
              <button
                onclick="window.location.href='/providers/${provider._id}'"
                style="
                  background-color: #ef4444;
                  color: white;
                  padding: 8px 16px;
                  border-radius: 6px;
                  border: none;
                  cursor: pointer;
                  font-weight: 500;
                  width: 100%;
                  margin-top: 8px;
                "
              >
                View Details
              </button>
            </div>
          `;

          infoWindow.setContent(content);
          infoWindow.open(map, marker);
        });

        return marker;
      });

    setMarkers(newMarkers);

    // Fit bounds to show all markers
    if (newMarkers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      newMarkers.forEach((marker) => {
        const position = marker.getPosition();
        if (position) bounds.extend(position);
      });
      map.fitBounds(bounds);

      // Don't zoom in too much if there's only one marker
      if (newMarkers.length === 1) {
        const listener = google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
          const zoom = map.getZoom();
          if (zoom && zoom > 15) {
            map.setZoom(15);
          }
        });
      }
    }

    // Cleanup
    return () => {
      newMarkers.forEach((marker) => marker.setMap(null));
    };
  }, [map, providers, infoWindow]);

  /**
   * Handle "Near Me" button click
   */
  const handleNearMe = async () => {
    const coords = await getLocation();
    if (coords && map) {
      // Center map on user location
      map.setCenter(coords);
      map.setZoom(13);

      // Add user location marker
      const userMarker = new google.maps.Marker({
        position: coords,
        map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#3b82f6',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
        title: 'Your Location',
      });

      // Update URL to filter by location
      const params = new URLSearchParams(searchParams.toString());
      params.set('lat', coords.lat.toString());
      params.set('lng', coords.lng.toString());
      router.push(`/providers?${params.toString()}`);

      toast.success('Showing providers near you');
    } else {
      toast.error('Could not get your location. Please enable location services.');
    }
  };

  // Loading state
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-muted/30 rounded-lg">
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
      <div className="p-6 border border-destructive rounded-lg bg-destructive/10">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-destructive">Failed to load map</p>
            <p className="text-sm text-destructive/80 mt-1">
              {loadError.message}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              The provider list is still available below.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Map container */}
      <div ref={mapRef} className="w-full h-[500px] rounded-lg border" />

      {/* Near Me button */}
      <Button
        onClick={handleNearMe}
        disabled={isGettingLocation}
        className="absolute top-4 right-4 shadow-lg"
        size="sm"
      >
        {isGettingLocation ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Navigation className="h-4 w-4 mr-2" />
        )}
        Near Me
      </Button>

      {/* Provider count */}
      <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur px-4 py-2 rounded-lg shadow-lg border">
        <p className="text-sm font-medium">
          {providers.length} provider{providers.length !== 1 ? 's' : ''} shown
        </p>
      </div>
    </div>
  );
}
