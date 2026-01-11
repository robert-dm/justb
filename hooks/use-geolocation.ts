'use client';

import { useState, useCallback } from 'react';

interface Coordinates {
  lat: number;
  lng: number;
}

interface UseGeolocationReturn {
  coordinates: Coordinates | null;
  isLoading: boolean;
  error: string | null;
  getLocation: () => Promise<Coordinates | null>;
}

export function useGeolocation(): UseGeolocationReturn {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLocation = useCallback(async (): Promise<Coordinates | null> => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return null;
    }

    setIsLoading(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCoordinates(coords);
          setIsLoading(false);
          resolve(coords);
        },
        (err) => {
          let errorMessage = 'Failed to get location';
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = 'Location permission denied';
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case err.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          setError(errorMessage);
          setIsLoading(false);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }, []);

  return {
    coordinates,
    isLoading,
    error,
    getLocation,
  };
}
