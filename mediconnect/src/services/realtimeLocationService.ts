// Real-Time Hardware GPS & Geolocation Service
// Leverages expo-location on native iOS/Android and navigator.geolocation on Web.

import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { reverseGeocode, GeocodedAddress } from './nominatimService';

export interface RealtimeLocation {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  heading: number | null;
  speedKmH: number | null;
  timestamp: number;
  address?: GeocodedAddress;
  isSimulated?: boolean;
}

// Default fallback coordinates (Central Mumbai) if permissions denied
export const DEFAULT_COORDS = {
  latitude: 19.076,
  longitude: 72.8777,
};

export async function getCurrentDeviceLocation(): Promise<RealtimeLocation> {
  try {
    // 1. Request foreground permissions
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Location permission not granted, using accurate fallback');
      const fallbackAddress = await reverseGeocode(DEFAULT_COORDS.latitude, DEFAULT_COORDS.longitude);
      return {
        latitude: DEFAULT_COORDS.latitude,
        longitude: DEFAULT_COORDS.longitude,
        accuracyMeters: 50,
        heading: null,
        speedKmH: null,
        timestamp: Date.now(),
        address: fallbackAddress,
        isSimulated: true,
      };
    }

    // 2. Fetch high-accuracy real-time GPS position
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    const speed = pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : null;

    // 3. Reverse geocode real coordinates into street address
    const address = await reverseGeocode(lat, lon);

    return {
      latitude: lat,
      longitude: lon,
      accuracyMeters: Math.round(pos.coords.accuracy || 10),
      heading: pos.coords.heading || null,
      speedKmH: speed,
      timestamp: pos.timestamp,
      address,
      isSimulated: false,
    };
  } catch (err) {
    console.warn('Error fetching device location:', err);
    // On web fallback to navigator.geolocation if expo-location fails
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            const address = await reverseGeocode(lat, lon);
            resolve({
              latitude: lat,
              longitude: lon,
              accuracyMeters: Math.round(pos.coords.accuracy || 15),
              heading: pos.coords.heading || null,
              speedKmH: pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : null,
              timestamp: pos.timestamp,
              address,
              isSimulated: false,
            });
          },
          async () => {
            const fallbackAddress = await reverseGeocode(DEFAULT_COORDS.latitude, DEFAULT_COORDS.longitude);
            resolve({
              latitude: DEFAULT_COORDS.latitude,
              longitude: DEFAULT_COORDS.longitude,
              accuracyMeters: 50,
              heading: null,
              speedKmH: null,
              timestamp: Date.now(),
              address: fallbackAddress,
              isSimulated: true,
            });
          },
          { enableHighAccuracy: true, timeout: 8000 }
        );
      });
    }

    const fallbackAddress = await reverseGeocode(DEFAULT_COORDS.latitude, DEFAULT_COORDS.longitude);
    return {
      latitude: DEFAULT_COORDS.latitude,
      longitude: DEFAULT_COORDS.longitude,
      accuracyMeters: 50,
      heading: null,
      speedKmH: null,
      timestamp: Date.now(),
      address: fallbackAddress,
      isSimulated: true,
    };
  }
}
