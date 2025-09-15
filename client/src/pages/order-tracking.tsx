import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getAuthHeaders } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useGeolocation, GeolocationPosition } from "@/hooks/use-geolocation";
import { useWebSocket } from "@/hooks/use-websocket";
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
  RefreshCw
} from "lucide-react";

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

export default function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState<GeolocationPosition | null>(null);
  const [lastLocationUpdate, setLastLocationUpdate] = useState<Date | null>(null);
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

  // Simulate delivery driver location (in real app, this would come from your backend)
  const getDeliveryDriverLocation = (): GeolocationPosition | null => {
    if (order?.status !== "out_for_delivery" || !order?.address?.coordinates) {
      return null;
    }
    
    // Simulate driver location - slightly offset from destination
    return {
      latitude: order.address.coordinates.lat + 0.001,
      longitude: order.address.coordinates.lng + 0.001
    };
  };

  const getMapMarkers = () => {
    const markers = [];

    // Customer current location
    if (currentLocation) {
      markers.push({
        id: "current-location",
        position: currentLocation,
        title: "Your Location",
        type: "customer" as const
      });
    }

    // Delivery destination
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

    // Delivery driver location
    const driverLocation = getDeliveryDriverLocation();
    if (driverLocation) {
      markers.push({
        id: "driver",
        position: driverLocation,
        title: "Delivery Driver",
        type: "delivery" as const
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
            <Button onClick={() => navigate("/orders")}>
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
          onClick={() => navigate("/orders")}
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
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Live Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Map
                center={{
                  latitude: order.address.coordinates.lat,
                  longitude: order.address.coordinates.lng
                }}
                markers={getMapMarkers()}
                className="h-64 md:h-96"
              />
              
              {/* Delivery Info */}
              <div className="mt-4 p-4 bg-muted/30 rounded-lg">
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
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-3">
        <Button className="flex-1" data-testid="button-chat-support">
          <MessageSquare className="h-4 w-4 mr-2" />
          Chat with Support
        </Button>
        <Button variant="outline" className="flex-1" data-testid="button-call-support">
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