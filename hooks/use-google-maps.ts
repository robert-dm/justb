'use client';

import { useState, useEffect } from 'react';

interface UseGoogleMapsResult {
  isLoaded: boolean;
  loadError: Error | null;
}

// Global state to track if Google Maps is loaded
let globalGoogleMapsLoaded = false;
let globalGoogleMapsError: Error | null = null;
let globalLoadPromise: Promise<void> | null = null;

/**
 * Hook to load Google Maps JavaScript API
 *
 * Uses a singleton pattern to ensure the API is only loaded once globally.
 * Returns loading and error states for UI feedback.
 *
 * @returns {UseGoogleMapsResult} Object containing isLoaded and loadError states
 */
export function useGoogleMaps(): UseGoogleMapsResult {
  const [isLoaded, setIsLoaded] = useState(globalGoogleMapsLoaded);
  const [loadError, setLoadError] = useState<Error | null>(globalGoogleMapsError);

  useEffect(() => {
    // If already loaded globally, update local state
    if (globalGoogleMapsLoaded) {
      setIsLoaded(true);
      return;
    }

    // If there was a global error, update local state
    if (globalGoogleMapsError) {
      setLoadError(globalGoogleMapsError);
      return;
    }

    // If currently loading, wait for the existing promise
    if (globalLoadPromise) {
      globalLoadPromise
        .then(() => {
          globalGoogleMapsLoaded = true;
          setIsLoaded(true);
        })
        .catch((error) => {
          globalGoogleMapsError = error;
          setLoadError(error);
        });
      return;
    }

    // Check if Google Maps is already loaded by another script
    if (typeof window !== 'undefined' && window.google?.maps) {
      globalGoogleMapsLoaded = true;
      setIsLoaded(true);
      return;
    }

    // Start loading Google Maps
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      const error = new Error(
        'Google Maps API key not found. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables.'
      );
      globalGoogleMapsError = error;
      setLoadError(error);
      return;
    }

    // Load Google Maps script
    globalLoadPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;

      // Create callback function
      (window as any).initGoogleMaps = () => {
        globalGoogleMapsLoaded = true;
        setIsLoaded(true);
        resolve();
      };

      script.onerror = () => {
        const error = new Error('Failed to load Google Maps script');
        globalGoogleMapsError = error;
        setLoadError(error);
        reject(error);
      };

      document.head.appendChild(script);
    });

  }, []);

  return { isLoaded, loadError };
}
