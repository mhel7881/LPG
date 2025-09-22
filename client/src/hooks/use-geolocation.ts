import { useState, useEffect } from 'react';
import { GeocodingService, GeocodingResult } from '@/lib/geocoding';

export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

export interface UseGeolocationReturn {
  position: GeolocationPosition | null;
  error: GeolocationError | null;
  loading: boolean;
  geocoding: boolean;
  address: GeocodingResult | null;
  getCurrentPosition: () => Promise<GeocodingResult | null>;
}

export const useGeolocation = (): UseGeolocationReturn => {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<GeolocationError | null>(null);
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [address, setAddress] = useState<GeocodingResult | null>(null);


  const getCurrentPosition = async (): Promise<GeocodingResult | null> => {
    if (!navigator.geolocation) {
      console.log('[Geolocation] Geolocation not supported by browser');
      setError({
        code: 0,
        message: 'Geolocation is not supported by this browser'
      });
      return null;
    }

    console.log('[Geolocation] Requesting current position...');
    setLoading(true);
    setError(null);
    setAddress(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const positionData = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy
            };
            console.log('[Geolocation] Position obtained:', {
              latitude: positionData.latitude,
              longitude: positionData.longitude,
              accuracy: positionData.accuracy,
              timestamp: pos.timestamp
            });
            resolve(positionData);
          },
          (error) => {
            console.error('[Geolocation] Error getting position:', error);
            let message = 'Unknown error occurred';

            switch (error.code) {
              case error.PERMISSION_DENIED:
                message = 'Location access denied. Please allow location access in your browser settings and try again.';
                break;
              case error.POSITION_UNAVAILABLE:
                message = 'Location information is unavailable. Please check your GPS settings and try again.';
                break;
              case error.TIMEOUT:
                message = 'Location request timed out. Please try again.';
                break;
            }

            reject(new Error(message));
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 300000
          }
        );
      });

      setPosition(position);
      setLoading(false);

      // Now geocode the coordinates
      console.log('[Geolocation] Starting geocoding...');
      setGeocoding(true);

      try {
        const addressResult = await GeocodingService.reverseGeocode(
          position.latitude,
          position.longitude
        );

        setAddress(addressResult);
        setGeocoding(false);

        console.log('[Geolocation] Geocoding completed successfully');
        return addressResult;
      } catch (geocodeError) {
       console.error('[Geolocation] Geocoding failed:', geocodeError);
       setGeocoding(false);
       setError({
         code: -1,
         message: 'Address conversion failed, but location was captured. You can manually enter your address details below.'
       });
       // Return null for address but keep the position
       return null;
     }

    } catch (error: any) {
      console.error('[Geolocation] Position request failed:', error);
      setError({
        code: -1,
        message: error.message
      });
      setLoading(false);
      setGeocoding(false);
      return null;
    }
  };

  return {
    position,
    error,
    loading,
    geocoding,
    address,
    getCurrentPosition
  };
};

export const formatCoordinates = (position: GeolocationPosition): string => {
  return `${position.latitude.toFixed(6)}, ${position.longitude.toFixed(6)}`;
};

export const calculateDistance = (
  pos1: GeolocationPosition,
  pos2: GeolocationPosition
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (pos2.latitude - pos1.latitude) * Math.PI / 180;
  const dLon = (pos2.longitude - pos1.longitude) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(pos1.latitude * Math.PI / 180) * Math.cos(pos2.latitude * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
};