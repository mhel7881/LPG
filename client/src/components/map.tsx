import { useCallback, useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, RefreshCw } from 'lucide-react';
import { GeolocationPosition } from '@/hooks/use-geolocation';
import L from 'leaflet';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

// Add custom CSS for pulse animation
const pulseKeyframes = `
  @keyframes pulse {
    0% {
      transform: scale(0.8);
      opacity: 1;
    }
    70% {
      transform: scale(1.2);
      opacity: 0.7;
    }
    100% {
      transform: scale(0.8);
      opacity: 0;
    }
  }
`;

// Inject CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = pulseKeyframes;
  document.head.appendChild(style);
}

interface MapProps {
  center?: GeolocationPosition;
  markers?: Array<{
    id: string;
    position: GeolocationPosition;
    title: string;
    type: 'customer' | 'delivery' | 'destination' | 'restaurant' | 'admin';
  }>;
  onLocationSelect?: (position: GeolocationPosition) => void;
  onMarkerClick?: (markerId: string) => void;
  className?: string;
}

export default function Map({ center, markers = [], onLocationSelect, onMarkerClick, className }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const defaultCenter = center || { latitude: 14.5995, longitude: 120.9842 }; // Manila, Philippines

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current) return;

    try {
      // Initialize map - exactly like test.html
      const map = L.map(mapRef.current).setView([defaultCenter.latitude, defaultCenter.longitude], 13);

      // Add OpenStreetMap tiles - exactly like test.html
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      leafletMapRef.current = map;
      setIsMapLoaded(true);

      // Handle map clicks for location selection
      if (onLocationSelect) {
        map.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
          onLocationSelect({ latitude: lat, longitude: lng });
        });
      }

      return () => {
        map.remove();
        leafletMapRef.current = null;
      };
    } catch (error) {
      console.error('Failed to initialize map:', error);
      setMapError('Failed to load map. Please refresh the page.');
    }
  }, [defaultCenter.latitude, defaultCenter.longitude, onLocationSelect]);

  // Update map center when center prop changes
  useEffect(() => {
    if (leafletMapRef.current && center) {
      leafletMapRef.current.setView([center.latitude, center.longitude], 13);
    }
  }, [center]);

  // Update markers
  useEffect(() => {
    if (!leafletMapRef.current || !isMapLoaded) return;

    const map = leafletMapRef.current;

    // Clear existing markers
    markersRef.current.forEach((marker: any) => {
      map.removeLayer(marker);
    });
    markersRef.current = [];

    // Add new markers
    markers.forEach((marker) => {
      const getMarkerIcon = (type: string) => {
        let iconHtml = '';
        let iconSize: [number, number] = [20, 20];

        switch (type) {
          case 'restaurant':
            iconHtml = '<div style="background-color: #f59e0b; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center;"><span style="color: white; font-size: 12px; font-weight: bold;">🏪</span></div>';
            iconSize = [24, 24];
            break;
          case 'customer':
            iconHtml = '<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center;"><div style="width: 8px; height: 8px; background-color: white; border-radius: 50%;"></div></div>';
            break;
          case 'delivery':
            // Add pulse animation for moving delivery driver
            iconHtml = '<div style="position: relative;"><div style="background-color: #10b981; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center;"><div style="width: 8px; height: 8px; background-color: white; border-radius: 50%;"></div></div><div style="position: absolute; top: -2px; left: -2px; width: 24px; height: 24px; border: 2px solid #10b981; border-radius: 50%; animation: pulse 2s infinite;"></div></div>';
            break;
          case 'admin':
            iconHtml = '<div style="background-color: #8b5cf6; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center;"><span style="color: white; font-size: 10px; font-weight: bold;">👤</span></div>';
            break;
          default: // destination
            iconHtml = '<div style="background-color: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center;"><div style="width: 8px; height: 8px; background-color: white; border-radius: 50%;"></div></div>';
            break;
        }

        return L.divIcon({
          html: iconHtml,
          className: 'custom-marker',
          iconSize: iconSize,
          iconAnchor: [iconSize[0] / 2, iconSize[1] / 2],
        });
      };

      const leafletMarker = L.marker([marker.position.latitude, marker.position.longitude], {
        icon: getMarkerIcon(marker.type)
      }).addTo(map);

      // Add popup
      leafletMarker.bindPopup(marker.title);

      // Add click handler
      if (onMarkerClick) {
        leafletMarker.on('click', () => {
          onMarkerClick(marker.id);
        });
      }

      markersRef.current.push(leafletMarker);
    });

    // Fit bounds to show all markers if there are multiple
    if (markers.length > 1) {
      const group = L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.1));
    }
  }, [markers, isMapLoaded, onMarkerClick]);

  if (mapError) {
    return (
      <div className={`w-full h-64 md:h-96 rounded-lg overflow-hidden border ${className || ''}`} style={{ background: '#f8f9fa' }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Map Unavailable</h3>
            <p className="text-muted-foreground mb-4">{mapError}</p>
            <Button variant="outline" onClick={() => setMapError(null)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className={`w-full h-64 md:h-96 rounded-lg overflow-hidden relative ${className || ''}`}
      style={{ background: '#f8f9fa' }}
    >
      {!isMapLoaded ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Map Legend */}
          <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 z-[1000]">
            <div className="text-xs font-medium mb-2">Map Legend</div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                <span>Restaurant</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Customer</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Delivery Driver</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Destination</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span>Admin</span>
              </div>
            </div>
          </div>

          {/* Coordinates Display */}
          <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 z-[1000]">
            <div className="text-xs text-muted-foreground">
              {defaultCenter.latitude.toFixed(4)}, {defaultCenter.longitude.toFixed(4)}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export { Map };