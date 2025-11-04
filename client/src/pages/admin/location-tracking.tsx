import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAuthHeaders } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import Map from "@/components/map";
import {
  Search,
  MapPin,
  Navigation,
  RefreshCw,
  Users,
  Truck,
  Package,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  X
} from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  province: string;
  zipCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  isDefault: boolean;
  user: Customer;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  customer: Customer;
  address?: Address;
  createdAt: string;
  quantity?: number;
  type?: string;
  unitPrice?: string;
  totalAmount?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  notes?: string;
}

export default function AdminLocationTracking() {
  const [location] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Parse query parameters
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const orderIdParam = urlParams.get('orderId');

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"customers" | "orders" | "order_details">(orderIdParam ? "order_details" : "orders");
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update order status");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders/tracking"] });
      toast({
        title: "Order Updated",
        description: `Order ${data.orderNumber} status updated successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
        variant: "destructive",
      });
    },
  });

  // Fetch customer addresses with GPS coordinates
  const { data: addresses = [], isLoading: addressesLoading, refetch: refetchAddresses } = useQuery({
    queryKey: ["/api/admin/addresses"],
    queryFn: async () => {
      const response = await fetch("/api/admin/addresses", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch addresses");
      return response.json();
    },
  });

  // Fetch active orders with location data
  const { data: orders = [], isLoading: ordersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ["/api/admin/orders/tracking"],
    queryFn: async () => {
      const response = await fetch("/api/admin/orders/tracking", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch orders for tracking");
      return response.json();
    },
  });

  // Filter addresses with GPS coordinates
  const addressesWithLocation = addresses.filter((addr: Address) => 
    addr.coordinates && 
    (searchTerm === "" || 
     addr.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     addr.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     addr.street.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Filter orders - if orderId is provided, show only that order
  const filteredOrders = orders.filter((order: Order) => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const hasCoordinates = order.address?.coordinates;
    const matchesSearch = searchTerm === "" ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOrderId = !orderIdParam || order.id === orderIdParam;

    return matchesStatus && hasCoordinates && matchesSearch && matchesOrderId;
  });

  const handleRefresh = async () => {
    await Promise.all([refetchAddresses(), refetchOrders()]);
    toast({
      title: "Refreshed",
      description: "Location data has been updated",
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4" />;
      case "processing": return <Package className="h-4 w-4" />;
      case "out_for_delivery": return <Truck className="h-4 w-4" />;
      case "delivered": return <CheckCircle className="h-4 w-4" />;
      case "cancelled": return <X className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getNextStatus = (currentStatus: string): string | null => {
    switch (currentStatus) {
      case "pending": return "processing";
      case "processing": return "out_for_delivery";
      case "out_for_delivery": return "delivered";
      default: return null;
    }
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    updateOrderStatusMutation.mutate({ orderId, status: newStatus });
  };

  const handleMarkerClick = (markerId: string) => {
    // Find the order by marker ID
    const order = [...orders, ...filteredOrders].find(o => o.id === markerId);
    if (order && getNextStatus(order.status)) {
      handleStatusUpdate(order.id, getNextStatus(order.status)!);
    }
  };

  // Generate map markers based on current view
  const getMapMarkers = () => {
    if (viewMode === "customers") {
      return addressesWithLocation.map((address: Address) => ({
        id: address.id,
        position: {
          latitude: address.coordinates!.lat,
          longitude: address.coordinates!.lng
        },
        title: `${address.user.name} - ${address.label} - ${address.street}, ${address.city}`,
        type: "customer" as const
      }));
    } else {
      return filteredOrders.map((order: Order) => ({
        id: order.id,
        position: {
          latitude: order.address!.coordinates!.lat,
          longitude: order.address!.coordinates!.lng
        },
        title: `${order.orderNumber} - ${order.customer.name} - ${order.address!.street}, ${order.address!.city}`,
        type: order.status === "out_for_delivery" ? "delivery" : "destination" as const
      }));
    }
  };

  const getMapCenter = () => {
    const markers = getMapMarkers();
    if (markers.length === 0) {
      return { latitude: 14.5995, longitude: 120.9842 }; // Manila, Philippines default
    }
    
    const avgLat = markers.reduce((sum: number, marker: any) => sum + marker.position.latitude, 0) / markers.length;
    const avgLng = markers.reduce((sum: number, marker: any) => sum + marker.position.longitude, 0) / markers.length;
    
    return { latitude: avgLat, longitude: avgLng };
  };

  const activeOrdersCount = orders.filter((o: Order) => ["pending", "processing", "out_for_delivery"].includes(o.status)).length;
  const customersWithLocationCount = addressesWithLocation.length;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">Location Tracking</h1>
          <p className="text-muted-foreground">
            Track customer locations and manage deliveries on the map
          </p>
        </div>
        <Button onClick={handleRefresh} data-testid="button-refresh-locations">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Orders</p>
                <p className="text-2xl font-bold" data-testid="text-active-orders-count">
                  {activeOrdersCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Customers with Location</p>
                <p className="text-2xl font-bold" data-testid="text-customers-with-location-count">
                  {customersWithLocationCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <Truck className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Out for Delivery</p>
                <p className="text-2xl font-bold" data-testid="text-out-for-delivery-count">
                  {orders.filter((o: Order) => o.status === "out_for_delivery").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            {/* View Mode Toggle */}
            <div className="flex space-x-2">
              <Button
                variant={viewMode === "orders" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("orders")}
                data-testid="button-view-orders"
              >
                <Package className="h-4 w-4 mr-2" />
                Orders
              </Button>
              <Button
                variant={viewMode === "customers" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("customers")}
                data-testid="button-view-customers"
              >
                <Users className="h-4 w-4 mr-2" />
                Customers
              </Button>
              <Button
                variant={viewMode === "order_details" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("order_details")}
                disabled={!orderIdParam}
                data-testid="button-view-order-details"
              >
                <Eye className="h-4 w-4 mr-2" />
                Order Details
              </Button>
            </div>

            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${viewMode === "orders" ? "orders" : "customers"}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-locations"
              />
            </div>

            {/* Status Filter (for orders view) */}
            {viewMode === "orders" && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Live Map - {viewMode === "orders" ? "Order" : "Customer"} Locations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {(addressesLoading || ordersLoading) ? (
            <div className="h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading map data...</p>
              </div>
            </div>
          ) : (
            <Map
              center={getMapCenter()}
              markers={getMapMarkers()}
              onMarkerClick={handleMarkerClick}
              className="h-96"
            />
          )}
        </CardContent>
      </Card>

      {/* Data List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {viewMode === "order_details" && orderIdParam ? (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {filteredOrders.length > 0 ? (
                (() => {
                  const order = filteredOrders[0]; // Since filtered to one order
                  return (
                    <div className="space-y-6">
                      {/* Order Header */}
                      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:items-start md:space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          {getStatusIcon(order.status)}
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-col space-y-2 md:flex-row md:items-start md:justify-between md:space-y-0">
                            <div>
                              <h3 className="font-semibold text-lg" data-testid={`text-order-number-${order.id}`}>
                                {order.orderNumber}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Customer: {order.customer.name} ({order.customer.email})
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge className={getStatusColor(order.status)} data-testid={`badge-order-status-${order.id}`}>
                                  {formatStatus(order.status)}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-xl" data-testid={`text-order-amount-${order.id}`}>
                                ₱{order.totalAmount || 'N/A'}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {order.paymentMethod?.toUpperCase() || 'N/A'}
                              </div>
                            </div>
                          </div>

                          {/* Address */}
                          {order.address && (
                            <div
                              className="bg-muted/30 p-4 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() => getNextStatus(order.status) && handleStatusUpdate(order.id, getNextStatus(order.status)!)}
                            >
                              <h4 className="font-medium mb-2">Delivery Address (Click to update status)</h4>
                              <div className="text-sm text-muted-foreground">
                                <div className="flex items-center space-x-2">
                                  <MapPin className="h-4 w-4" />
                                  <span>
                                    {order.address.street}, {order.address.city}, {order.address.province} {order.address.zipCode}
                                  </span>
                                </div>
                                {order.address.coordinates && (
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Navigation className="h-4 w-4 text-green-600" />
                                    <span className="text-green-600 font-medium">
                                      {order.address.coordinates.lat.toFixed(6)}, {order.address.coordinates.lng.toFixed(6)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Status Update Buttons */}
                          <div className="flex flex-wrap gap-2 pt-4 border-t">
                            {getNextStatus(order.status) && (
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(order.id, getNextStatus(order.status)!)}
                                disabled={updateOrderStatusMutation.isPending}
                                data-testid={`button-advance-status-${order.id}`}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as {formatStatus(getNextStatus(order.status)!)}
                              </Button>
                            )}

                            {order.status === "pending" && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleStatusUpdate(order.id, "cancelled")}
                                disabled={updateOrderStatusMutation.isPending}
                                data-testid={`button-cancel-order-${order.id}`}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Cancel Order
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Order not found or no location data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : viewMode === "orders" ? (
          <Card>
            <CardHeader>
              <CardTitle>Active Orders with Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No orders with location data found</p>
                </div>
              ) : (
                filteredOrders.map((order: Order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 border rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium" data-testid={`text-order-number-${order.id}`}>
                          {order.orderNumber}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {order.customer.name}
                        </p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {formatStatus(order.status)}
                      </Badge>
                    </div>
                    
                    {order.address && (
                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {order.address.street}, {order.address.city}
                          </span>
                        </div>
                        {order.address.coordinates && (
                          <div className="flex items-center space-x-2 mt-1">
                            <Navigation className="h-4 w-4 text-green-600" />
                            <span className="text-green-600 font-medium">
                              {order.address.coordinates.lat.toFixed(6)}, {order.address.coordinates.lng.toFixed(6)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Customers with GPS Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {addressesWithLocation.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No customers with location data found</p>
                </div>
              ) : (
                addressesWithLocation.map((address: Address) => (
                  <motion.div
                    key={address.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 border rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium" data-testid={`text-customer-name-${address.id}`}>
                          {address.user.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {address.user.email}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {address.label}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {address.street}, {address.city}
                        </span>
                      </div>
                      {address.coordinates && (
                        <div className="flex items-center space-x-2 mt-1">
                          <Navigation className="h-4 w-4 text-green-600" />
                          <span className="text-green-600 font-medium">
                            {address.coordinates.lat.toFixed(6)}, {address.coordinates.lng.toFixed(6)}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" data-testid="button-export-locations">
              <Eye className="h-4 w-4 mr-2" />
              Export Location Data
            </Button>
            <Button variant="outline" className="w-full" data-testid="button-delivery-routes">
              <Navigation className="h-4 w-4 mr-2" />
              Optimize Delivery Routes
            </Button>
            <Button variant="outline" className="w-full" data-testid="button-location-analytics">
              <Filter className="h-4 w-4 mr-2" />
              Location Analytics
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}