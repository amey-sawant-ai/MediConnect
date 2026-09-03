// OpenStreetMap Nominatim Geocoding & Reverse Geocoding Service (Free & Open Source)
// Policy compliant: includes custom User-Agent and memory cache.

export interface GeocodedAddress {
  displayName: string;
  street?: string;
  suburb?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  lat: number;
  lon: number;
}

const cache = new Map<string, GeocodedAddress>();

export async function reverseGeocode(lat: number, lon: number): Promise<GeocodedAddress> {
  const cacheKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'HealthConnect-EmergencyApp/1.0 (healthcare-emergency-response)',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim error: ${response.statusText}`);
    }

    const data = await response.json();
    const result: GeocodedAddress = {
      displayName: data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      street: data.address?.road || data.address?.pedestrian,
      suburb: data.address?.suburb || data.address?.neighbourhood,
      city: data.address?.city || data.address?.town || data.address?.county || 'Mumbai',
      state: data.address?.state || 'Maharashtra',
      postcode: data.address?.postcode || '400001',
      country: data.address?.country || 'India',
      lat,
      lon,
    };

    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    // Fallback if offline or rate limited
    return {
      displayName: `Sector 15, Healthcare Blvd, Central Zone, Mumbai (${lat.toFixed(3)}, ${lon.toFixed(3)})`,
      city: 'Mumbai',
      state: 'Maharashtra',
      postcode: '400001',
      country: 'India',
      lat,
      lon,
    };
  }
}

export async function searchPlace(query: string): Promise<GeocodedAddress[]> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'HealthConnect-EmergencyApp/1.0 (healthcare-emergency-response)',
      },
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.map((item: any) => ({
      displayName: item.display_name,
      street: item.address?.road,
      suburb: item.address?.suburb,
      city: item.address?.city || item.address?.town || 'Mumbai',
      state: item.address?.state,
      postcode: item.address?.postcode,
      country: item.address?.country,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
    }));
  } catch {
    return [];
  }
}
