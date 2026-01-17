/**
 * Server-side geocoding utilities for Google Maps API
 *
 * These functions should only be used on the server-side (API routes, server components).
 * Use the GOOGLE_MAPS_API_KEY environment variable (without NEXT_PUBLIC_ prefix).
 */

interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Geocode an address string to coordinates using Google Geocoding API
 *
 * @param address - Full address string or partial address
 * @returns Coordinates object with lat/lng, or null if geocoding fails
 */
export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error('GOOGLE_MAPS_API_KEY environment variable is not set');
    return null;
  }

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.searchParams.append('address', address);
    url.searchParams.append('key', apiKey);

    const response = await fetch(url.toString());

    if (!response.ok) {
      console.error('Geocoding API request failed:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
      };
    }

    if (data.status === 'ZERO_RESULTS') {
      console.warn('No results found for address:', address);
      return null;
    }

    if (data.status === 'REQUEST_DENIED') {
      console.error('Geocoding API request denied:', data.error_message);
      return null;
    }

    console.warn('Geocoding failed with status:', data.status);
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Format an address object into a string for geocoding
 *
 * @param address - Address object with optional fields
 * @returns Formatted address string
 */
export function formatAddressString(address: Partial<Address>): string {
  const parts = [
    address.street,
    address.city,
    address.state,
    address.zipCode,
    address.country,
  ].filter(Boolean);

  return parts.join(', ');
}

/**
 * Reverse geocode coordinates to an address using Google Geocoding API
 *
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Address string, or null if reverse geocoding fails
 */
export async function reverseGeocodeCoordinates(
  lat: number,
  lng: number
): Promise<string | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error('GOOGLE_MAPS_API_KEY environment variable is not set');
    return null;
  }

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.searchParams.append('latlng', `${lat},${lng}`);
    url.searchParams.append('key', apiKey);

    const response = await fetch(url.toString());

    if (!response.ok) {
      console.error('Reverse geocoding API request failed:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    }

    console.warn('Reverse geocoding failed with status:', data.status);
    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}
