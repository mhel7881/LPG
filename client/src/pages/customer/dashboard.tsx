import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { getAuthHeaders } from "@/lib/auth";
import { generateReceiptPDF, type ReceiptData } from "@/lib/receipt-generator";
import { 
  ShoppingCart, 
  Package, 
  Truck, 
  MessageSquare, 
  MapPin,
  Plus,
  Clock,
  CheckCircle,
  DollarSign,
  Calendar,
  Bell,
  TrendingUp,
  Heart,
  Gift,
  Star
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
  totalAmount: string;
  status: string;
  createdAt: string;
}

export default function CustomerDashboard() {
  const { user } = useAuth();

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      const response = await fetch("/api/orders", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch orders");
      return response.json();
    },
  });

  const currentOrders = orders.filter((order: Order) => 
    !["delivered", "cancelled"].includes(order.status)
  );
  
  const recentOrders = orders
    .filter((order: Order) => order.status === "delivered")
    .slice(0, 3);

  // Calculate customer stats
  const totalSpent = orders
    .filter((order: Order) => order.status === "delivered")
    .reduce((sum: number, order: Order) => sum + parseFloat(order.totalAmount), 0);
  
  const totalOrders = orders.filter((order: Order) => order.status === "delivered").length;
  
  const pendingOrders = orders.filter((order: Order) => 
    ["pending", "processing", "out_for_delivery"].includes(order.status)
  ).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-orange-100 text-orange-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "out_for_delivery": return "bg-yellow-100 text-yellow-800";
      case "delivered": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
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

  return (
    <div className="container mx-auto px-4 py-6 space-y-8 pb-20 md:pb-6">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary rounded-xl p-6 text-primary-foreground"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2" data-testid="text-welcome-message">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-primary-foreground/80 mb-4">
              Need LPG? Order now for fast delivery to your doorstep
            </p>
            <Link href="/customer/products" data-testid="link-order-now">
              <Button variant="secondary" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                <Plus className="h-4 w-4 mr-2" />
                Order Now
              </Button>
            </Link>
          </div>
          <Truck className="h-16 w-16 text-primary-foreground/60" />
        </div>
      </motion.section>

      {/* Customer Stats */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-xl font-semibold mb-4">Your Overview</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold" data-testid="text-total-spent">
                    ₱{totalSpent.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                This month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Orders</p>
                  <p className="text-2xl font-bold" data-testid="text-total-orders">
                    {totalOrders}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Completed deliveries
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold" data-testid="text-pending-orders">
                    {pendingOrders}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                In progress
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Loyalty</p>
                  <p className="text-2xl font-bold" data-testid="text-loyalty-status">
                    {totalOrders >= 10 ? "Gold" : totalOrders >= 5 ? "Silver" : "Bronze"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
              <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                <Heart className="h-3 w-3 inline mr-1" />
                Member status
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.section>

      {/* Quick Actions */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link href="/customer/products" data-testid="link-quick-order">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">Order LPG</h3>
                <p className="text-sm text-muted-foreground">Start new order</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/customer/schedules" data-testid="link-quick-schedule">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">Schedule</h3>
                <p className="text-sm text-muted-foreground">Set recurring deliveries</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/customer/orders" data-testid="link-quick-track">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">Track Order</h3>
                <p className="text-sm text-muted-foreground">View delivery status</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/chat" data-testid="link-quick-support">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">Get Support</h3>
                <p className="text-sm text-muted-foreground">Chat with us</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </motion.section>

      {/* Current Orders */}
      {currentOrders.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Current Orders</h2>
            <Link href="/customer/orders" data-testid="link-view-all-orders">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>

          <div className="space-y-4">
            {currentOrders.map((order: Order) => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium" data-testid={`text-order-product-${order.id}`}>
                          {order.product?.name} ({order.type === "swap" ? "Swap" : "New"})
                        </h3>
                        <span className="font-medium" data-testid={`text-order-amount-${order.id}`}>
                          ₱{order.totalAmount}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mb-3">
                        <Badge className={getStatusColor(order.status)} data-testid={`badge-order-status-${order.id}`}>
                          {order.status === "out_for_delivery" ? "Out for Delivery" : 
                           order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                        <span className="text-sm text-muted-foreground" data-testid={`text-order-number-${order.id}`}>
                          {order.orderNumber}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mb-3">
                        <Progress 
                          value={getStatusProgress(order.status)} 
                          className="flex-1 h-2"
                          data-testid={`progress-order-${order.id}`}
                        />
                        <span className="text-xs text-muted-foreground">
                          {order.status === "out_for_delivery" ? "ETA: 15 mins" : ""}
                        </span>
                      </div>
                      <div className="flex space-x-3">
                        <Button size="sm" className="flex-1" data-testid={`button-track-order-${order.id}`}>
                          <MapPin className="h-4 w-4 mr-2" />
                          Track Order
                        </Button>
                        <Link href="/chat" data-testid={`link-chat-${order.id}`}>
                          <Button variant="outline" size="sm" className="flex-1">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Chat
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>
      )}

      {/* Quick Actions */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/customer/products" data-testid="link-quick-products">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Package className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="font-medium">Browse Products</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/customer/cart" data-testid="link-quick-cart">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <ShoppingCart className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="font-medium">View Cart</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/customer/orders" data-testid="link-quick-orders">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="font-medium">Order History</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/chat" data-testid="link-quick-chat">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <MessageSquare className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="font-medium">Chat Support</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </motion.section>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          <div className="space-y-4">
            {recentOrders.map((order: Order) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium" data-testid={`text-recent-order-product-${order.id}`}>
                          {order.product?.name} ({order.type === "swap" ? "Swap" : "New"})
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Delivered on {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium" data-testid={`text-recent-order-amount-${order.id}`}>
                        ₱{order.totalAmount}
                      </div>
                      <div className="flex space-x-2 mt-1">
                        <Button size="sm" variant="outline" data-testid={`button-reorder-${order.id}`}>
                          Reorder
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleDownloadReceipt(order.id)}
                          data-testid={`button-receipt-${order.id}`}
                        >
                          Receipt
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>
      )}

      {ordersLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading your orders...</p>
        </div>
      )}

      {!ordersLoading && orders.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by ordering your first LPG tank!
            </p>
            <Link href="/customer/products" data-testid="link-first-order">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Browse Products
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
