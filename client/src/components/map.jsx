import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, RefreshCw } from 'lucide-react';
export default function Map(_a) {
    var center = _a.center, _b = _a.markers, markers = _b === void 0 ? [] : _b, onLocationSelect = _a.onLocationSelect, className = _a.className;
    var mapRef = useRef(null);
    var _c = useState(false), isMapLoaded = _c[0], setIsMapLoaded = _c[1];
    var _d = useState(null), mapError = _d[0], setMapError = _d[1];
    // For now, we'll use a simple visual map representation
    // In production, you would integrate with Google Maps, Mapbox, or OpenStreetMap
    useEffect(function () {
        // Simulate map loading
        var timer = setTimeout(function () {
            setIsMapLoaded(true);
        }, 1000);
        return function () { return clearTimeout(timer); };
    }, []);
    var defaultCenter = center || { latitude: 14.5995, longitude: 120.9842 }; // Manila, Philippines
    var handleLocationClick = function (e) {
        if (!onLocationSelect)
            return;
        var rect = e.currentTarget.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        // Convert click position to approximate coordinates (this is simplified)
        var lat = defaultCenter.latitude + (0.01 * (y - rect.height / 2) / (rect.height / 2));
        var lng = defaultCenter.longitude + (0.01 * (x - rect.width / 2) / (rect.width / 2));
        onLocationSelect({ latitude: lat, longitude: lng });
    };
    if (mapError) {
        return (<Card className={className}>
        <CardContent className="p-8 text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
          <h3 className="font-semibold mb-2">Map Unavailable</h3>
          <p className="text-muted-foreground mb-4">{mapError}</p>
          <Button variant="outline" onClick={function () { return setMapError(null); }}>
            <RefreshCw className="h-4 w-4 mr-2"/>
            Retry
          </Button>
        </CardContent>
      </Card>);
    }
    return (<Card className={className}>
      <CardContent className="p-0">
        <div ref={mapRef} className="w-full h-64 md:h-96 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 relative rounded-lg overflow-hidden cursor-pointer" onClick={handleLocationClick}>
          {!isMapLoaded ? (<div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading map...</p>
              </div>
            </div>) : (<>
              {/* Map Grid Pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="grid grid-cols-8 grid-rows-6 h-full">
                  {Array.from({ length: 48 }).map(function (_, i) { return (<div key={i} className="border border-muted-foreground/20"></div>); })}
                </div>
              </div>

              {/* Center Marker */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg"></div>
              </div>

              {/* Custom Markers */}
              {markers.map(function (marker, index) {
                var getMarkerColor = function (type) {
                    switch (type) {
                        case 'customer': return 'bg-blue-500';
                        case 'delivery': return 'bg-green-500';
                        case 'destination': return 'bg-red-500';
                        default: return 'bg-gray-500';
                    }
                };
                // Simple positioning based on relative coordinates
                var offsetX = (marker.position.longitude - defaultCenter.longitude) * 50;
                var offsetY = -(marker.position.latitude - defaultCenter.latitude) * 50;
                return (<div key={marker.id} className="absolute transform -translate-x-1/2 -translate-y-1/2" style={{
                        left: "calc(50% + ".concat(Math.max(-120, Math.min(120, offsetX)), "px)"),
                        top: "calc(50% + ".concat(Math.max(-80, Math.min(80, offsetY)), "px)")
                    }}>
                    <div className={"w-6 h-6 ".concat(getMarkerColor(marker.type), " rounded-full border-2 border-white shadow-lg flex items-center justify-center")}>
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div className="absolute top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                      <div className="bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-lg text-xs font-medium">
                        {marker.title}
                      </div>
                    </div>
                  </div>);
            })}

              {/* Map Controls */}
              <div className="absolute top-4 right-4 space-y-2">
                <Button size="sm" variant="secondary" className="shadow-lg">
                  <Navigation className="h-4 w-4"/>
                </Button>
              </div>

              {/* Map Legend */}
              <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
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
              <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2">
                <div className="text-xs text-muted-foreground">
                  {defaultCenter.latitude.toFixed(4)}, {defaultCenter.longitude.toFixed(4)}
                </div>
              </div>
            </>)}
        </div>
      </CardContent>
    </Card>);
}
export { Map };
