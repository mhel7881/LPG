import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { getAuthHeaders } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  MapPin, 
  MessageSquare, 
  CheckCircle, 
  Package,
  Truck,
  Clock,
  X,
  User,
  Phone
} from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
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
  createdAt: string;
}

export default function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      const response = await fetch("/api/orders", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch orders");
      return response.json();
    },
  });

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
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
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

  const filteredOrders = orders
    .filter((order: Order) => 
      statusFilter === "all" || order.status === statusFilter
    )
    .filter((order: Order) =>
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

  const orderCounts = {
    all: orders.length,
    pending: orders.filter((o: Order) => o.status === "pending").length,
    processing: orders.filter((o: Order) => o.status === "processing").length,
    out_for_delivery: orders.filter((o: Order) => o.status === "out_for_delivery").length,
    delivered: orders.filter((o: Order) => o.status === "delivered").length,
    cancelled: orders.filter((o: Order) => o.status === "cancelled").length,
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">Order Management</h1>
          <p className="text-muted-foreground" data-testid="text-orders-count">
            {filteredOrders.length} {filteredOrders.length === 1 ? "order" : "orders"}
            {statusFilter !== "all" && ` (${formatStatus(statusFilter)})`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order number or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-orders"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48" data-testid="select-status-filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders ({orderCounts.all})</SelectItem>
                <SelectItem value="pending">Pending ({orderCounts.pending})</SelectItem>
                <SelectItem value="processing">Processing ({orderCounts.processing})</SelectItem>
                <SelectItem value="out_for_delivery">Out for Delivery ({orderCounts.out_for_delivery})</SelectItem>
                <SelectItem value="delivered">Delivered ({orderCounts.delivered})</SelectItem>
                <SelectItem value="cancelled">Cancelled ({orderCounts.cancelled})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-3 bg-muted rounded animate-pulse w-3/4"></div>
                  <div className="h-8 bg-muted rounded animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">
              {searchTerm || statusFilter !== "all" ? "No matching orders" : "No orders yet"}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search or filter criteria"
                : "Orders will appear here once customers start placing them"
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order: Order, index: number) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:items-start md:space-x-4">
                    {/* Order Icon */}
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      {getStatusIcon(order.status)}
                    </div>
                    
                    {/* Order Details */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col space-y-2 md:flex-row md:items-start md:justify-between md:space-y-0">
                        <div>
                          <h3 className="font-semibold" data-testid={`text-order-number-${order.id}`}>
                            {order.orderNumber}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {order.product?.name} ({order.type === "swap" ? "Swap" : "New"}) • Qty: {order.quantity}
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
                          <div className="font-semibold text-lg" data-testid={`text-order-amount-${order.id}`}>
                            ₱{order.totalAmount}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {order.paymentMethod.toUpperCase()}
                          </div>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>Customer ID: {order.customerId.slice(0, 8)}...</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4" />
                          <span>{order.product?.weight}</span>
                        </div>
                      </div>

                      {/* Notes */}
                      {order.notes && (
                        <div className="bg-muted p-3 rounded-lg">
                          <p className="text-sm"><strong>Customer Notes:</strong> {order.notes}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
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
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          data-testid={`button-view-location-${order.id}`}
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          View Location
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          data-testid={`button-chat-customer-${order.id}`}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Chat
                        </Button>

                        {order.status === "pending" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleStatusUpdate(order.id, "cancelled")}
                            disabled={updateOrderStatusMutation.isPending}
                            data-testid={`button-cancel-order-${order.id}`}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
