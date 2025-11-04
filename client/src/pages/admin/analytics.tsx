import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAuthHeaders } from "@/lib/auth";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  Download,
  RefreshCcw
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

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
  product?: {
    name: string;
    weight: string;
  };
  quantity: number;
  type: string;
  totalAmount: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  weight: string;
  stock: number;
  newPrice: string;
  swapPrice: string;
}

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState("7d");
  const [location] = useLocation();
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const productId = urlParams.get('product');

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
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

  const { data: physicalSales = [], isLoading: physicalSalesLoading } = useQuery({
    queryKey: ["/api/physical-sales"],
    queryFn: async () => {
      const response = await fetch("/api/physical-sales", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch physical sales");
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

  const selectedProduct = productId ? products.find((p: Product) => p.id === productId) : null;

  // Calculate analytics data
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const getDateRange = () => {
    switch (timeRange) {
      case "24h": return new Date(today.getTime() - 24 * 60 * 60 * 1000);
      case "7d": return weekAgo;
      case "30d": return monthAgo;
      default: return weekAgo;
    }
  };

  const filteredOrders = orders.filter((order: Order) => 
    new Date(order.createdAt) >= getDateRange()
  );

  const deliveredOrders = filteredOrders.filter((order: Order) => order.status === "delivered");
  const onlineRevenue = deliveredOrders.reduce((sum: number, order: Order) =>
    sum + parseFloat(order.totalAmount), 0
  );

  // Filter physical sales by date range
  const filteredPhysicalSales = physicalSales.filter((sale: any) =>
    new Date(sale.createdAt) >= getDateRange()
  );

  const physicalRevenue = filteredPhysicalSales.reduce((sum: number, sale: any) =>
    sum + parseFloat(sale.totalAmount), 0
  );

  const totalRevenue = onlineRevenue + physicalRevenue;

  // Calculate best selling products (online orders)
  const onlineProductSales = deliveredOrders.reduce((acc: any, order: Order) => {
    const productId = order.productId;
    if (!acc[productId]) {
      acc[productId] = {
        productId,
        product: order.product,
        quantity: 0,
        revenue: 0,
      };
    }
    acc[productId].quantity += order.quantity;
    acc[productId].revenue += parseFloat(order.totalAmount);
    return acc;
  }, {});

  // Calculate best selling products (physical sales)
  const physicalProductSales = filteredPhysicalSales.reduce((acc: any, sale: any) => {
    const productId = sale.productId;
    if (!acc[productId]) {
      acc[productId] = {
        productId,
        product: sale.product,
        quantity: 0,
        revenue: 0,
      };
    }
    acc[productId].quantity += sale.quantity;
    acc[productId].revenue += parseFloat(sale.totalAmount);
    return acc;
  }, {});

  // Combine online and physical sales
  const productSales = { ...onlineProductSales };
  Object.keys(physicalProductSales).forEach(productId => {
    if (productSales[productId]) {
      productSales[productId].quantity += physicalProductSales[productId].quantity;
      productSales[productId].revenue += physicalProductSales[productId].revenue;
    } else {
      productSales[productId] = physicalProductSales[productId];
    }
  });

  const bestSellingProducts = Object.values(productSales)
    .sort((a: any, b: any) => b.quantity - a.quantity)
    .slice(0, 5);

  // Filter orders for selected product if one is selected
  const productOrders = selectedProduct
    ? deliveredOrders.filter((order: Order) => order.productId === selectedProduct.id)
    : deliveredOrders;

  const productRevenue = selectedProduct
    ? productOrders.reduce((sum: number, order: Order) => sum + parseFloat(order.totalAmount), 0)
    : totalRevenue;

  const productOrderCount = selectedProduct ? productOrders.length : deliveredOrders.length;

  // Calculate daily sales for the chart (simplified representation)
  const dailySales = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const dayOrders = deliveredOrders.filter((order: Order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate.toDateString() === date.toDateString();
    });
    const dayPhysicalSales = filteredPhysicalSales.filter((sale: any) => {
      const saleDate = new Date(sale.createdAt);
      return saleDate.toDateString() === date.toDateString();
    });
    const dayOnlineRevenue = dayOrders.reduce((sum: number, order: Order) =>
      sum + parseFloat(order.totalAmount), 0
    );
    const dayPhysicalRevenue = dayPhysicalSales.reduce((sum: number, sale: any) =>
      sum + parseFloat(sale.totalAmount), 0
    );
    dailySales.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: dayOnlineRevenue + dayPhysicalRevenue,
      orders: dayOrders.length + dayPhysicalSales.length,
    });
  }

  const totalTransactions = deliveredOrders.length + filteredPhysicalSales.length;
  const avgOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
  const conversionRate = orders.length > 0 ? (deliveredOrders.length / orders.length) * 100 : 0;

  const handleRefresh = () => {
    refetchStats();
  };

  const handleExport = () => {
    // Implement export functionality
    console.log("Exporting analytics data...");
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-8 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">
            {selectedProduct ? `${selectedProduct.name} Analytics` : "Sales Analytics"}
          </h1>
          <p className="text-muted-foreground">
            {selectedProduct
              ? `Sales trend and performance metrics for ${selectedProduct.name}`
              : "Insights and performance metrics for your LPG business"
            }
          </p>
          {selectedProduct && (
            <Badge variant="outline" className="mt-2">
              {selectedProduct.weight} • ₱{selectedProduct.newPrice} new / ₱{selectedProduct.swapPrice} swap
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32" data-testid="select-time-range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleRefresh} data-testid="button-refresh-analytics">
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleExport} data-testid="button-export-analytics">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold" data-testid="text-revenue-metric">
                            ₱{productRevenue.toLocaleString()}
                          </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                +15.2% vs previous period
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Orders</p>
                  <p className="text-2xl font-bold" data-testid="text-orders-metric">
                    {productOrderCount}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                +8.4% vs previous period
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Order Value</p>
                  <p className="text-2xl font-bold" data-testid="text-avg-order-value">
                    ₱{avgOrderValue.toFixed(0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="mt-2 text-xs text-purple-600 dark:text-purple-400">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                +3.1% vs previous period
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  <p className="text-2xl font-bold" data-testid="text-conversion-rate">
                    {conversionRate.toFixed(1)}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                <TrendingDown className="h-3 w-3 inline mr-1" />
                -2.3% vs previous period
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.section>

      {/* Sales Trend and Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Sales Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dailySales.map((day, index) => (
                  <div key={day.date} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm font-medium">{day.date}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium" data-testid={`text-daily-revenue-${index}`}>
                        ₱{day.revenue.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {day.orders} orders
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {dailySales.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No sales data</h3>
                  <p className="text-muted-foreground">
                    Sales data will appear here once orders are delivered.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.section>

        {/* Best Selling Products or Product Details */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedProduct ? "Product Performance" : "Best Selling Products"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedProduct ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-primary/5 rounded-lg">
                      <p className="text-2xl font-bold text-primary">{productOrderCount}</p>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/10 rounded-lg">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ₱{productRevenue.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Stock Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Current Stock:</span>
                        <span className="ml-2 font-medium">{selectedProduct.stock} units</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Stock Value:</span>
                        <span className="ml-2 font-medium">
                          ₱{(parseFloat(selectedProduct.newPrice) * selectedProduct.stock).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {bestSellingProducts.length > 0 ? (
                    bestSellingProducts.map((item: any, index: number) => (
                      <div key={item.productId} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium" data-testid={`text-product-name-${index}`}>
                              {item.product?.name || "Unknown Product"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.product?.weight}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium" data-testid={`text-product-quantity-${index}`}>
                            {item.quantity} units
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ₱{item.revenue.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">No sales data</h3>
                      <p className="text-muted-foreground">
                        Product sales rankings will appear here.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.section>
      </div>

      {/* Additional Analytics */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-xl font-semibold mb-4">Additional Insights</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Order Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {["pending", "processing", "out_for_delivery", "delivered", "cancelled"].map((status) => {
                  const count = filteredOrders.filter((order: Order) => order.status === status).length;
                  const percentage = filteredOrders.length > 0 ? (count / filteredOrders.length) * 100 : 0;
                  
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          status === "delivered" ? "bg-green-500" :
                          status === "cancelled" ? "bg-red-500" :
                          status === "out_for_delivery" ? "bg-yellow-500" :
                          status === "processing" ? "bg-blue-500" :
                          "bg-orange-500"
                        }`}></div>
                        <span className="text-sm capitalize">
                          {status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium" data-testid={`text-status-count-${status}`}>
                          {count}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {["cod", "gcash"].map((method) => {
                  const count = deliveredOrders.filter((order: Order) => order.paymentMethod === method).length;
                  const percentage = deliveredOrders.length > 0 ? (count / deliveredOrders.length) * 100 : 0;
                  
                  return (
                    <div key={method} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          method === "cod" ? "bg-blue-500" : "bg-green-500"
                        }`}></div>
                        <span className="text-sm uppercase">{method}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium" data-testid={`text-payment-count-${method}`}>
                          {count}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Order Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Order Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {["new", "swap"].map((type) => {
                  const onlineCount = deliveredOrders.filter((order: Order) => order.type === type).length;
                  const physicalCount = filteredPhysicalSales.filter((sale: any) => sale.type === type).length;
                  const totalCount = onlineCount + physicalCount;
                  const totalTransactions = deliveredOrders.length + filteredPhysicalSales.length;
                  const percentage = totalTransactions > 0 ? (totalCount / totalTransactions) * 100 : 0;

                  return (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          type === "new" ? "bg-blue-500" : "bg-orange-500"
                        }`}></div>
                        <span className="text-sm capitalize">{type} Tank</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium" data-testid={`text-type-count-${type}`}>
                          {totalCount}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.section>
    </div>
  );
}
