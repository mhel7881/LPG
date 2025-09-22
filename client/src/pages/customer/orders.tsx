import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getAuthHeaders } from "@/lib/auth";
import { generateReceiptPDF, type ReceiptData } from "@/lib/receipt-generator";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import {
  Package,
  MapPin,
  MessageSquare,
  Download,
  RefreshCcw,
  Clock,
  CheckCircle,
  Truck,
  AlertCircle
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
}

export default function CustomerOrders() {
  const [, setLocation] = useLocation();
  const { addItem, isLoading: cartLoading } = useCart();
  const { toast } = useToast();
  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      const response = await fetch("/api/orders", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch orders");
      return response.json();
    },
  });

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
      case "pending": return <Clock className="h-4 w-4" />;
      case "processing": return <Package className="h-4 w-4" />;
      case "out_for_delivery": return <Truck className="h-4 w-4" />;
      case "delivered": return <CheckCircle className="h-4 w-4" />;
      case "cancelled": return <AlertCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const handleDownloadReceipt = async (orderId: string) => {
    try {
      // Fetch order details for receipt
      const response = await fetch(`/api/orders/${orderId}/receipt`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }
      
      const orderDetails = await response.json();
      
      // Generate and download PDF
      await generateReceiptPDF(orderDetails);
    } catch (error) {
      console.error('Error downloading receipt:', error);
      alert('Failed to download receipt. Please try again.');
    }
  };

  const handleReorder = async (order: Order) => {
    try {
      if (!order.productId) {
        toast({
          title: "Error",
          description: "Product information not available for reorder",
          variant: "destructive",
        });
        return;
      }

      // Add the item to cart with the same type and quantity
      await addItem(order.productId, order.type as "new" | "swap", order.quantity);
      
      toast({
        title: "Added to Cart",
        description: `${order.product?.name} has been added to your cart`,
      });

      // Navigate to cart page
      setLocation("/customer/cart");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const currentOrders = orders.filter((order: Order) => 
    !["delivered", "cancelled"].includes(order.status)
  );
  
  const pastOrders = orders.filter((order: Order) => 
    ["delivered", "cancelled"].includes(order.status)
  );

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Orders</h1>
          <p className="text-muted-foreground" data-testid="text-orders-count">
            {orders.length} {orders.length === 1 ? "order" : "orders"} total
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()} data-testid="button-refresh-orders">
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
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
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-4">
              Your order history will appear here once you place your first order.
            </p>
            <Button>Start Shopping</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Current Orders */}
          {currentOrders.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Current Orders</h2>
              <div className="space-y-4">
                {currentOrders.map((order: Order, index: number) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            {getStatusIcon(order.status)}
                          </div>
                          
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium" data-testid={`text-order-product-${order.id}`}>
                                  {order.product?.name} ({order.type === "swap" ? "Swap" : "New"})
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  Qty: {order.quantity} • {order.product?.weight}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="font-medium" data-testid={`text-order-amount-${order.id}`}>
                                  ₱{order.totalAmount}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {order.paymentMethod.toUpperCase()}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Badge className={getStatusColor(order.status)} data-testid={`badge-order-status-${order.id}`}>
                                {formatStatus(order.status)}
                              </Badge>
                              <span className="text-sm text-muted-foreground" data-testid={`text-order-number-${order.id}`}>
                                {order.orderNumber}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span>Order Progress</span>
                                <span>{order.status === "out_for_delivery" ? "ETA: 15 mins" : ""}</span>
                              </div>
                              <Progress 
                                value={getStatusProgress(order.status)} 
                                className="h-2"
                                data-testid={`progress-order-${order.id}`}
                              />
                            </div>

                            <div className="flex space-x-3">
                              <Button
                                size="sm"
                                className="flex-1"
                                onClick={() => setLocation(`/order-tracking/${order.id}`)}
                                data-testid={`button-track-order-${order.id}`}
                              >
                                <MapPin className="h-4 w-4 mr-2" />
                                Track Order
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => setLocation(`/chat?orderId=${order.id}`)}
                                data-testid={`button-chat-${order.id}`}
                              >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Chat Support
                              </Button>
                            </div>

                            {order.notes && (
                              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                                <strong>Notes:</strong> {order.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Past Orders */}
          {pastOrders.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Order History</h2>
              <div className="space-y-4">
                {pastOrders.map((order: Order, index: number) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                              {getStatusIcon(order.status)}
                            </div>
                            <div>
                              <h3 className="font-medium" data-testid={`text-past-order-product-${order.id}`}>
                                {order.product?.name} ({order.type === "swap" ? "Swap" : "New"})
                              </h3>
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <Badge variant="outline" className={getStatusColor(order.status)}>
                                  {formatStatus(order.status)}
                                </Badge>
                                <span>{order.orderNumber}</span>
                                <span>•</span>
                                <span>
                                  {order.deliveredAt 
                                    ? new Date(order.deliveredAt).toLocaleDateString()
                                    : new Date(order.createdAt).toLocaleDateString()
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="font-medium" data-testid={`text-past-order-amount-${order.id}`}>
                                ₱{order.totalAmount}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReorder(order)}
                                disabled={cartLoading}
                                data-testid={`button-reorder-${order.id}`}
                              >
                                <RefreshCcw className={`h-4 w-4 mr-2 ${cartLoading ? 'animate-spin' : ''}`} />
                                {cartLoading ? 'Adding...' : 'Reorder'}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleDownloadReceipt(order.id)}
                                data-testid={`button-download-receipt-${order.id}`}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
