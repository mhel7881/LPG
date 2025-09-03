import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAuthHeaders } from "@/lib/auth";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { 
  DollarSign, 
  ShoppingCart, 
  Clock, 
  Users, 
  Package, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Truck,
  Calendar,
  Target
} from "lucide-react";

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  pendingOrders: number;
  activeCustomers: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  productId: string;
  status: string;
  totalAmount: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/analytics/dashboard"],
    queryFn: async () => {
      const response = await fetch("/api/analytics/dashboard", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch dashboard stats");
      return response.json();
    },
  });

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

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
  });

  const recentOrders = orders.slice(0, 5);
  const lowStockProducts = products.filter((product: any) => product.stock <= 5);

  // Calculate analytics data
  const salesData = orders.reduce((acc: any[], order: Order) => {
    const date = new Date(order.createdAt).toLocaleDateString();
    const existingEntry = acc.find(entry => entry.date === date);
    
    if (existingEntry) {
      existingEntry.sales += parseFloat(order.totalAmount);
      existingEntry.orders += 1;
    } else {
      acc.push({
        date,
        sales: parseFloat(order.totalAmount),
        orders: 1,
      });
    }
    return acc;
  }, []).slice(-7); // Last 7 days

  const ordersByStatus = orders.reduce((acc: any, order: Order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  const statusChartData = Object.entries(ordersByStatus).map(([status, count]) => ({
    name: formatStatus(status),
    value: count,
    fill: getStatusChartColor(status)
  }));

  const productSales = products.map((product: any) => ({
    name: product.name,
    stock: product.stock,
    sold: orders.filter((order: Order) => order.productId === product.id).length,
  }));

  function getStatusChartColor(status: string) {
    switch (status) {
      case "pending": return "#f59e0b";
      case "processing": return "#3b82f6";
      case "out_for_delivery": return "#eab308";
      case "delivered": return "#10b981";
      case "cancelled": return "#ef4444";
      default: return "#6b7280";
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "processing": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "out_for_delivery": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "delivered": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-8 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        
        {lowStockProducts.length > 0 && (
          <Link href="/admin/inventory" data-testid="link-low-stock-alert">
            <Button variant="outline" className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 pulse-glow">
              <AlertTriangle className="h-4 w-4 mr-2" />
              {lowStockProducts.length} Low Stock Alert{lowStockProducts.length > 1 ? 's' : ''}
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Overview */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-xl font-semibold mb-4">Today's Overview</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sales</p>
                  <p className="text-2xl font-bold" data-testid="text-total-sales">
                    {statsLoading ? "..." : `₱${stats?.totalSales?.toLocaleString() || 0}`}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                +12% from yesterday
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Orders</p>
                  <p className="text-2xl font-bold" data-testid="text-total-orders">
                    {statsLoading ? "..." : stats?.totalOrders || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                +8% from yesterday
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold" data-testid="text-pending-orders">
                    {statsLoading ? "..." : stats?.pendingOrders || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {orders.filter((order: Order) => order.status === "out_for_delivery").length} out for delivery
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Customers</p>
                  <p className="text-2xl font-bold" data-testid="text-active-customers">
                    {statsLoading ? "..." : stats?.activeCustomers || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="mt-2 text-xs text-purple-600 dark:text-purple-400">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                +5 new this week
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.section>

      {/* Recent Orders */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Orders</h2>
          <Link href="/admin/orders" data-testid="link-view-all-orders">
            <Button variant="outline" size="sm">View All Orders</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order Management</CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className="w-10 h-10 bg-muted rounded-lg animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse"></div>
                      <div className="h-3 bg-muted rounded animate-pulse w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No orders yet</h3>
                <p className="text-muted-foreground">Orders will appear here once customers start placing them.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order: Order) => (
                  <div key={order.id} className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      {order.status === "delivered" ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : order.status === "out_for_delivery" ? (
                        <Truck className="h-5 w-5 text-yellow-600" />
                      ) : (
                        <Package className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium" data-testid={`text-order-number-${order.id}`}>
                            {order.orderNumber}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(order.status)} data-testid={`badge-order-status-${order.id}`}>
                              {formatStatus(order.status)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium" data-testid={`text-order-amount-${order.id}`}>
                            ₱{order.totalAmount}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.section>

      {/* Analytics Charts */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold mb-4">Analytics</h2>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Sales Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Sales Trend (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Order Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Order Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Product Performance */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Product Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productSales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sold" fill="#8884d8" name="Units Sold" />
                  <Bar dataKey="stock" fill="#82ca9d" name="Stock Remaining" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </motion.section>

      {/* Quick Actions */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/admin/orders" data-testid="link-quick-orders">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <ShoppingCart className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="font-medium">Manage Orders</p>
                <p className="text-sm text-muted-foreground">View and update orders</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/inventory" data-testid="link-quick-inventory">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Package className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="font-medium">Inventory</p>
                <p className="text-sm text-muted-foreground">Manage products & stock</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/analytics" data-testid="link-quick-analytics">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="font-medium">Analytics</p>
                <p className="text-sm text-muted-foreground">Sales reports & insights</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/chat" data-testid="link-quick-chat">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="font-medium">Customer Chat</p>
                <p className="text-sm text-muted-foreground">Support customers</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </motion.section>
    </div>
  );
}
