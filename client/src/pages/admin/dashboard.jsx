var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAuthHeaders } from "@/lib/auth";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { DollarSign, ShoppingCart, Clock, Users, Package, TrendingUp, AlertTriangle, CheckCircle, Truck, Target } from "lucide-react";
export default function AdminDashboard() {
    var _this = this;
    var _a;
    var _b = useQuery({
        queryKey: ["/api/analytics/dashboard"],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("/api/analytics/dashboard", {
                            headers: getAuthHeaders(),
                        })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error("Failed to fetch dashboard stats");
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
    }), stats = _b.data, statsLoading = _b.isLoading;
    var _c = useQuery({
        queryKey: ["/api/orders"],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("/api/orders", {
                            headers: getAuthHeaders(),
                        })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error("Failed to fetch orders");
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
    }), _d = _c.data, orders = _d === void 0 ? [] : _d, ordersLoading = _c.isLoading;
    var _e = useQuery({
        queryKey: ["/api/products"],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("/api/products")];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error("Failed to fetch products");
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
    }).data, products = _e === void 0 ? [] : _e;
    var recentOrders = orders.slice(0, 5);
    var lowStockProducts = products.filter(function (product) { return product.stock <= 5; });
    // Calculate analytics data
    var salesData = orders.reduce(function (acc, order) {
        var date = new Date(order.createdAt).toLocaleDateString();
        var existingEntry = acc.find(function (entry) { return entry.date === date; });
        if (existingEntry) {
            existingEntry.sales += parseFloat(order.totalAmount);
            existingEntry.orders += 1;
        }
        else {
            acc.push({
                date: date,
                sales: parseFloat(order.totalAmount),
                orders: 1,
            });
        }
        return acc;
    }, []).slice(-7); // Last 7 days
    var ordersByStatus = orders.reduce(function (acc, order) {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
    }, {});
    var statusChartData = Object.entries(ordersByStatus).map(function (_a) {
        var status = _a[0], count = _a[1];
        return ({
            name: formatStatus(status),
            value: count,
            fill: getStatusChartColor(status)
        });
    });
    var productSales = products.map(function (product) { return ({
        name: product.name,
        stock: product.stock,
        sold: orders.filter(function (order) { return order.productId === product.id; }).length,
    }); });
    function getStatusChartColor(status) {
        switch (status) {
            case "pending": return "#f59e0b";
            case "processing": return "#3b82f6";
            case "out_for_delivery": return "#eab308";
            case "delivered": return "#10b981";
            case "cancelled": return "#ef4444";
            default: return "#6b7280";
        }
    }
    var getStatusColor = function (status) {
        switch (status) {
            case "pending": return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
            case "processing": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
            case "out_for_delivery": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
            case "delivered": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
            default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
        }
    };
    var formatStatus = function (status) {
        return status.split('_').map(function (word) {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');
    };
    return (<div className="container mx-auto px-4 py-6 space-y-8 pb-20 md:pb-6">
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
        
        {lowStockProducts.length > 0 && (<Link href="/admin/inventory" data-testid="link-low-stock-alert">
            <Button variant="outline" className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 pulse-glow">
              <AlertTriangle className="h-4 w-4 mr-2"/>
              {lowStockProducts.length} Low Stock Alert{lowStockProducts.length > 1 ? 's' : ''}
            </Button>
          </Link>)}
      </div>

      {/* Stats Overview */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-semibold mb-4">Today's Overview</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sales</p>
                  <p className="text-2xl font-bold" data-testid="text-total-sales">
                    {statsLoading ? "..." : "\u20B1".concat(((_a = stats === null || stats === void 0 ? void 0 : stats.totalSales) === null || _a === void 0 ? void 0 : _a.toLocaleString()) || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400"/>
                </div>
              </div>
              <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                <TrendingUp className="h-3 w-3 inline mr-1"/>
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
                    {statsLoading ? "..." : (stats === null || stats === void 0 ? void 0 : stats.totalOrders) || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400"/>
                </div>
              </div>
              <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                <TrendingUp className="h-3 w-3 inline mr-1"/>
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
                    {statsLoading ? "..." : (stats === null || stats === void 0 ? void 0 : stats.pendingOrders) || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400"/>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {orders.filter(function (order) { return order.status === "out_for_delivery"; }).length} out for delivery
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Customers</p>
                  <p className="text-2xl font-bold" data-testid="text-active-customers">
                    {statsLoading ? "..." : (stats === null || stats === void 0 ? void 0 : stats.activeCustomers) || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400"/>
                </div>
              </div>
              <div className="mt-2 text-xs text-purple-600 dark:text-purple-400">
                <TrendingUp className="h-3 w-3 inline mr-1"/>
                +5 new this week
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.section>

      {/* Recent Orders */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
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
            {ordersLoading ? (<div className="space-y-3">
                {Array.from({ length: 3 }).map(function (_, i) { return (<div key={i} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className="w-10 h-10 bg-muted rounded-lg animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse"></div>
                      <div className="h-3 bg-muted rounded animate-pulse w-3/4"></div>
                    </div>
                  </div>); })}
              </div>) : recentOrders.length === 0 ? (<div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
                <h3 className="font-semibold mb-2">No orders yet</h3>
                <p className="text-muted-foreground">Orders will appear here once customers start placing them.</p>
              </div>) : (<div className="space-y-3">
                {recentOrders.map(function (order) { return (<div key={order.id} className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      {order.status === "delivered" ? (<CheckCircle className="h-5 w-5 text-green-600"/>) : order.status === "out_for_delivery" ? (<Truck className="h-5 w-5 text-yellow-600"/>) : (<Package className="h-5 w-5 text-primary"/>)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium" data-testid={"text-order-number-".concat(order.id)}>
                            {order.orderNumber}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(order.status)} data-testid={"badge-order-status-".concat(order.id)}>
                              {formatStatus(order.status)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium" data-testid={"text-order-amount-".concat(order.id)}>
                            ₱{order.totalAmount}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>); })}
              </div>)}
          </CardContent>
        </Card>
      </motion.section>

      {/* Analytics Charts */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="text-xl font-semibold mb-4">Analytics</h2>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Sales Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2"/>
                Sales Trend (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="date"/>
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="sales" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6}/>
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Order Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2"/>
                Order Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={statusChartData} cx="50%" cy="50%" labelLine={false} label={function (_a) {
        var name = _a.name, percent = _a.percent;
        return "".concat(name, " ").concat((percent * 100).toFixed(0), "%");
    }} outerRadius={80} fill="#8884d8" dataKey="value">
                    {statusChartData.map(function (entry, index) { return (<Cell key={"cell-".concat(index)} fill={entry.fill}/>); })}
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
                <Package className="h-5 w-5 mr-2"/>
                Product Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productSales}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="name"/>
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sold" fill="#8884d8" name="Units Sold"/>
                  <Bar dataKey="stock" fill="#82ca9d" name="Stock Remaining"/>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </motion.section>

      {/* Quick Actions */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/admin/orders" data-testid="link-quick-orders">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <ShoppingCart className="h-8 w-8 text-primary mx-auto mb-2"/>
                <p className="font-medium">Manage Orders</p>
                <p className="text-sm text-muted-foreground">View and update orders</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/inventory" data-testid="link-quick-inventory">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Package className="h-8 w-8 text-primary mx-auto mb-2"/>
                <p className="font-medium">Inventory</p>
                <p className="text-sm text-muted-foreground">Manage products & stock</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/analytics" data-testid="link-quick-analytics">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2"/>
                <p className="font-medium">Analytics</p>
                <p className="text-sm text-muted-foreground">Sales reports & insights</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/chat" data-testid="link-quick-chat">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-primary mx-auto mb-2"/>
                <p className="font-medium">Customer Chat</p>
                <p className="text-sm text-muted-foreground">Support customers</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </motion.section>
    </div>);
}
