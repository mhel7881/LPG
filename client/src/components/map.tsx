import { useCallback, useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, RefreshCw } from 'lucide-react';
import { GeolocationPosition } from '@/hooks/use-geolocation';

// Dynamic import for Leaflet to avoid SSR issues
let L: any = null;
if (typeof window !== 'undefined') {
  Promise.all([
    import('leaflet'),
    import('leaflet/dist/leaflet.css')
  ]).then(([leaflet]) => {
    L = leaflet.default;
  });
}

interface MapProps {
  center?: GeolocationPosition;
  markers?: Array<{
    id: string;
    position: GeolocationPosition;
    title: string;
    type: 'customer' | 'delivery' | 'destination';
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
    if (!mapRef.current || !L) return;

    try {
      // Initialize map
      const map = L.map(mapRef.current).setView([defaultCenter.latitude, defaultCenter.longitude], 13);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
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
        const iconHtml = type === 'customer'
          ? '<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center;"><div style="width: 8px; height: 8px; background-color: white; border-radius: 50%;"></div></div>'
          : type === 'delivery'
          ? '<div style="background-color: #10b981; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center;"><div style="width: 8px; height: 8px; background-color: white; border-radius: 50%;"></div></div>'
          : '<div style="background-color: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center;"><div style="width: 8px; height: 8px; background-color: white; border-radius: 50%;"></div></div>';

        return L.divIcon({
          html: iconHtml,
          className: 'custom-marker',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
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
      const group = new L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.1));
    }
  }, [markers, isMapLoaded, onMarkerClick]);

  if (mapError) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Map Unavailable</h3>
          <p className="text-muted-foreground mb-4">{mapError}</p>
          <Button variant="outline" onClick={() => setMapError(null)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-0">
        <div
          ref={mapRef}
          className="w-full h-64 md:h-96 rounded-lg overflow-hidden"
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
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Customer</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Delivery</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Destination</span>
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
      </CardContent>
    </Card>
  );
}

export { Map };