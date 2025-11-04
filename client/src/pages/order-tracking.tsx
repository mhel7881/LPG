import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getAuthHeaders } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useGeolocation, GeolocationPosition } from "@/hooks/use-geolocation";
import { useWebSocket } from "@/hooks/use-websocket";
import { useAuth } from "@/hooks/use-auth";
import Map from "@/components/map";
import {
  ArrowLeft,
  Package,
  MapPin,
  MessageSquare,
  Clock,
  CheckCircle,
  Truck,
  AlertCircle,
  Navigation,
  Phone,
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  User,
  Star
} from "lucide-react";
import L from 'leaflet';

interface Order {
  id: string;
  orderNumber: string;
  productId: string;
  product?: {
    name: string;
    weight: string;
  };
  quantity: number;
  type: string;
  unitPrice: string;
  totalAmount: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  notes?: string;
  deliveredAt?: string;
  createdAt: string;
  address?: {
    id: string;
    street: string;
    city: string;
    province: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
}

// Restaurant location (should be configurable in real app)
const RESTAURANT_LOCATION: GeolocationPosition = {
  latitude: 14.5995,
  longitude: 120.9842
};

export default function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState<GeolocationPosition | null>(null);
  const [lastLocationUpdate, setLastLocationUpdate] = useState<Date | null>(null);
  const [riderPosition, setRiderPosition] = useState<GeolocationPosition | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);
  const [routeLine, setRouteLine] = useState<any>(null);
  const [adminLocation, setAdminLocation] = useState<GeolocationPosition | null>(null);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const adminLocationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mapRef = useRef<any>(null);
  const { position: currentLocation, getCurrentPosition } = useGeolocation();
  const { isConnected, sendMessage, lastMessage } = useWebSocket();

  const { data: order, isLoading, refetch } = useQuery<Order>({
    queryKey: [`/api/orders/${orderId}`],
    queryFn: async () => {
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Order not found");
        }
        throw new Error("Failed to fetch order details");
      }
      return response.json();
    },
    enabled: !!orderId,
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: deliveryDrivers = [] } = useQuery({
    queryKey: ["/api/admin/delivery-drivers"],
    queryFn: async () => {
      const response = await fetch("/api/admin/delivery-drivers", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch delivery drivers");
      return response.json();
    },
  });

  useEffect(() => {
    // Get current location when component mounts
    getCurrentPosition();
  }, [getCurrentPosition]);

  // Handle WebSocket messages for real-time location updates
  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.type) {
        case "delivery_location_update":
          if (lastMessage.orderId === orderId) {
            setDeliveryLocation({
              latitude: lastMessage.location.lat,
              longitude: lastMessage.location.lng
            });
            setLastLocationUpdate(new Date());
            toast({
              title: "Location Updated",
              description: "Delivery person location updated",
            });
          }
          break;
        
        case "order_status_update":
          if (lastMessage.order.id === orderId) {
            // Refetch order data when status updates
            refetch();
          }
          break;
      }
    }
  }, [lastMessage, orderId, toast, refetch]);

  // Subscribe to location updates for this order
  useEffect(() => {
    if (isConnected && orderId && order?.status === "out_for_delivery") {
      sendMessage({
        type: "subscribe_delivery_tracking",
        orderId: orderId
      });
    }

    return () => {
      if (isConnected && orderId) {
        sendMessage({
          type: "unsubscribe_delivery_tracking",
          orderId: orderId
        });
      }
    };
  }, [isConnected, orderId, order?.status, sendMessage]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    getCurrentPosition();
    setRefreshing(false);
    toast({
      title: "Updated",
      description: "Order information refreshed",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "processing": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "out_for_delivery": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "delivered": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "cancelled": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getStatusProgress = (status: string) => {
    switch (status) {
      case "pending": return 25;
      case "processing": return 50;
      case "out_for_delivery": return 75;
      case "delivered": return 100;
      default: return 0;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-5 w-5" />;
      case "processing": return <Package className="h-5 w-5" />;
      case "out_for_delivery": return <Truck className="h-5 w-5" />;
      case "delivered": return <CheckCircle className="h-5 w-5" />;
      case "cancelled": return <AlertCircle className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getEstimatedTime = (status: string) => {
    switch (status) {
      case "pending": return "Processing within 2 hours";
      case "processing": return "Preparing for delivery";
      case "out_for_delivery": return "15-30 minutes away";
      case "delivered": return "Delivered";
      default: return "";
    }
  };

  // Simulate delivery driver location with animation
  const getDeliveryDriverLocation = (): GeolocationPosition | null => {
    if (order?.status !== "out_for_delivery" || !order?.address?.coordinates) {
      return null;
    }

    // Use simulated position if available, otherwise calculate based on simulation step
    if (riderPosition) {
      return riderPosition;
    }

    // Default simulation: driver starts at restaurant and moves toward destination
    const startLat = RESTAURANT_LOCATION.latitude;
    const startLng = RESTAURANT_LOCATION.longitude;
    const endLat = order.address.coordinates.lat;
    const endLng = order.address.coordinates.lng;

    // Calculate intermediate position based on simulation step (0-100)
    const progress = Math.min(simulationStep / 100, 1);
    const currentLat = startLat + (endLat - startLat) * progress;
    const currentLng = startLng + (endLng - startLng) * progress;

    return {
      latitude: currentLat,
      longitude: currentLng
    };
  };

  // Simulation controls
  const startSimulation = () => {
    setIsSimulating(true);
    setSimulationStep(0);
    setRiderPosition(null);

    simulationIntervalRef.current = setInterval(() => {
      setSimulationStep(prev => {
        const next = prev + 2; // Move 2% every 500ms
        if (next >= 100) {
          setIsSimulating(false);
          if (simulationIntervalRef.current) {
            clearInterval(simulationIntervalRef.current);
          }
          return 100;
        }

        // Update rider position for route line
        if (order?.address?.coordinates) {
          const progress = next / 100;
          const currentLat = RESTAURANT_LOCATION.latitude + (order.address.coordinates.lat - RESTAURANT_LOCATION.latitude) * progress;
          const currentLng = RESTAURANT_LOCATION.longitude + (order.address.coordinates.lng - RESTAURANT_LOCATION.longitude) * progress;

          const newPosition = {
            latitude: currentLat,
            longitude: currentLng
          };
          setRiderPosition(newPosition);
          updateRouteLine(newPosition);
        }

        return next;
      });
    }, 500);
  };

  const pauseSimulation = () => {
    setIsSimulating(false);
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
    }
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    setSimulationStep(0);
    setRiderPosition(null);
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
    }
  };

  // Create route line between restaurant and destination
  const createRouteLine = () => {
    if (!order?.address?.coordinates) return null;

    const routePoints: L.LatLngTuple[] = [
      [RESTAURANT_LOCATION.latitude, RESTAURANT_LOCATION.longitude],
      [order.address.coordinates.lat, order.address.coordinates.lng]
    ];

    return L.polyline(routePoints, {
      color: '#3b82f6',
      weight: 4,
      opacity: 0.7,
      dashArray: '10, 10'
    });
  };

  // Update route line with rider position
  const updateRouteLine = (riderPos: GeolocationPosition) => {
    if (!order?.address?.coordinates) return;

    const routePoints: L.LatLngTuple[] = [
      [RESTAURANT_LOCATION.latitude, RESTAURANT_LOCATION.longitude],
      [riderPos.latitude, riderPos.longitude],
      [order.address.coordinates.lat, order.address.coordinates.lng]
    ];

    if (routeLine) {
      routeLine.setLatLngs(routePoints);
    }
  };

  // Track admin's actual device location
  const updateAdminLocation = async () => {
    if (!navigator.geolocation) {
      console.log('Geolocation not supported');
      setAdminLocation({
        latitude: 14.5995,
        longitude: 120.9842
      });
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy
            });
          },
          (error) => {
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
          }
        );
      });

      setAdminLocation(position);
      console.log('Admin location updated:', position);
    } catch (error) {
      console.log('Admin location tracking failed:', error);
      // Fallback to restaurant location if GPS fails
      setAdminLocation({
        latitude: 14.5995,
        longitude: 120.9842
      });
    }
  };

  // Start admin location tracking
  useEffect(() => {
    // Initial location update
    updateAdminLocation();

    // Update admin location every 30 seconds
    adminLocationIntervalRef.current = setInterval(updateAdminLocation, 30000);

    return () => {
      if (adminLocationIntervalRef.current) {
        clearInterval(adminLocationIntervalRef.current);
      }
    };
  }, []);

  // Cleanup simulation on unmount
  useEffect(() => {
    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
      if (adminLocationIntervalRef.current) {
        clearInterval(adminLocationIntervalRef.current);
      }
    };
  }, []);

  const getMapMarkers = () => {
    const markers = [];

    // Restaurant location
    markers.push({
      id: "restaurant",
      position: RESTAURANT_LOCATION,
      title: "GasFlow Restaurant",
      type: "restaurant" as const
    });

    // Customer delivery destination
    if (order?.address?.coordinates) {
      markers.push({
        id: "destination",
        position: {
          latitude: order.address.coordinates.lat,
          longitude: order.address.coordinates.lng
        },
        title: "Delivery Address",
        type: "destination" as const
      });
    }

    // Delivery driver location with pulse animation
    const driverLocation = getDeliveryDriverLocation();
    if (driverLocation) {
      markers.push({
        id: "driver",
        position: driverLocation,
        title: `Delivery Driver - ${isSimulating ? 'Moving' : 'Stationary'}`,
        type: "delivery" as const
      });
    }

    // Admin location (real-time device tracking)
    if (adminLocation) {
      markers.push({
        id: "admin",
        position: adminLocation,
        title: `Admin Location (Live GPS) - ${adminLocation.latitude.toFixed(6)}, ${adminLocation.longitude.toFixed(6)}`,
        type: "admin" as const
      });
    }

    return markers;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="h-6 bg-muted rounded animate-pulse"></div>
                <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
                <div className="h-32 bg-muted rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Order Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The order you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button onClick={() => setLocation(user?.role === "admin" ? "/admin/orders" : "/customer/orders")}>
              Back to Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation(user?.role === "admin" ? "/admin/orders" : "/customer/orders")}
          data-testid="button-back-to-orders"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Track Order</h1>
          <p className="text-muted-foreground" data-testid="text-order-number">
            {order.orderNumber}
          </p>
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleRefresh}
          disabled={refreshing}
          data-testid="button-refresh-tracking"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Order Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                {getStatusIcon(order.status)}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <Badge className={getStatusColor(order.status)} data-testid="badge-order-status">
                    {formatStatus(order.status)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {getEstimatedTime(order.status)}
                  </span>
                </div>
                <h3 className="font-semibold" data-testid="text-product-details">
                  {order.product?.name} ({order.type === "swap" ? "Swap" : "New"})
                </h3>
                <p className="text-sm text-muted-foreground">
                  Qty: {order.quantity} • {order.product?.weight} • ₱{order.totalAmount}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Order Progress</span>
                <span>{getStatusProgress(order.status)}%</span>
              </div>
              <Progress 
                value={getStatusProgress(order.status)} 
                className="h-3"
                data-testid="progress-order-status"
              />
            </div>

            {/* Order Timeline */}
            <div className="mt-6 space-y-3">
              <h4 className="font-medium">Order Timeline</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${order.status === "pending" ? "bg-primary" : "bg-muted"}`}></div>
                  <span className="text-sm">Order Placed</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(order.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${["processing", "out_for_delivery", "delivered"].includes(order.status) ? "bg-primary" : "bg-muted"}`}></div>
                  <span className="text-sm">Order Confirmed</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${["out_for_delivery", "delivered"].includes(order.status) ? "bg-primary" : "bg-muted"}`}></div>
                  <span className="text-sm">Out for Delivery</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${order.status === "delivered" ? "bg-primary" : "bg-muted"}`}></div>
                  <span className="text-sm">Delivered</span>
                  {order.deliveredAt && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(order.deliveredAt).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Live Map Tracking */}
      {order.address?.coordinates && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Live Tracking
                </div>
                {/* Simulation Controls */}
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={startSimulation}
                    disabled={isSimulating || order.status !== "out_for_delivery"}
                    className="text-xs"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Simulate
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={pauseSimulation}
                    disabled={!isSimulating}
                    className="text-xs"
                  >
                    <Pause className="h-3 w-3 mr-1" />
                    Pause
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={resetSimulation}
                    className="text-xs"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Reset
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Map
                  center={{
                    latitude: order.address.coordinates.lat,
                    longitude: order.address.coordinates.lng
                  }}
                  markers={getMapMarkers()}
                  className="h-64 md:h-96"
                />

                {/* Simulation Progress */}
                {isSimulating && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Delivery Progress</span>
                      <span>{simulationStep}%</span>
                    </div>
                    <Progress value={simulationStep} className="h-2" />
                  </div>
                )}

                {/* Delivery Info */}
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2">Delivery Address</h4>
                  <p className="text-sm text-muted-foreground">
                    {order.address.street}, {order.address.city}, {order.address.province} {order.address.zipCode}
                  </p>
                  {order.status === "out_for_delivery" && (
                    <div className="flex items-center space-x-2 mt-2">
                      <Truck className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        Driver is on the way
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Rider Information Panel */}
      {order.status === "out_for_delivery" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Delivery Driver Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {deliveryDrivers.length > 0 ? (
                <>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{deliveryDrivers[0].name}</h4>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-muted-foreground">{deliveryDrivers[0].rating || 4.8}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">License: {deliveryDrivers[0].licenseNumber}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => window.open(`tel:${deliveryDrivers[0].phone}`)}>
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Vehicle:</span>
                      <p className="font-medium capitalize">{deliveryDrivers[0].vehicleType}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Plate Number:</span>
                      <p className="font-medium">{deliveryDrivers[0].plateNumber}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Phone:</span>
                      <p className="font-medium">{deliveryDrivers[0].phone}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ETA:</span>
                      <p className="font-medium text-green-600">
                        {isSimulating ? `${Math.max(0, Math.round((100 - simulationStep) * 0.3))} mins` : "15-30 mins"}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <User className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Driver information not available</p>
                </div>
              )}

              {riderPosition && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Navigation className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Current Location:</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {riderPosition.latitude.toFixed(6)}, {riderPosition.longitude.toFixed(6)}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Last updated: {lastLocationUpdate ? lastLocationUpdate.toLocaleTimeString() : 'Just now'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-3">
        <Button
          className="flex-1"
          onClick={() => setLocation(`/chat?orderId=${orderId}`)}
          data-testid="button-chat-support"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Chat with Support
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => window.open('tel:+639123456789')}
          data-testid="button-call-support"
        >
          <Phone className="h-4 w-4 mr-2" />
          Call Support
        </Button>
      </div>

      {/* Order Notes */}
      {order.notes && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Order Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{order.notes}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}