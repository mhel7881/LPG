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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAuthHeaders } from "@/lib/auth";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, Calendar, Download, RefreshCcw } from "lucide-react";
import { useState } from "react";
export default function AdminAnalytics() {
    var _this = this;
    var _a = useState("7d"), timeRange = _a[0], setTimeRange = _a[1];
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
    }), stats = _b.data, statsLoading = _b.isLoading, refetchStats = _b.refetch;
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
    // Calculate analytics data
    var today = new Date();
    var weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    var monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    var getDateRange = function () {
        switch (timeRange) {
            case "24h": return new Date(today.getTime() - 24 * 60 * 60 * 1000);
            case "7d": return weekAgo;
            case "30d": return monthAgo;
            default: return weekAgo;
        }
    };
    var filteredOrders = orders.filter(function (order) {
        return new Date(order.createdAt) >= getDateRange();
    });
    var deliveredOrders = filteredOrders.filter(function (order) { return order.status === "delivered"; });
    var totalRevenue = deliveredOrders.reduce(function (sum, order) {
        return sum + parseFloat(order.totalAmount);
    }, 0);
    // Calculate best selling products
    var productSales = deliveredOrders.reduce(function (acc, order) {
        var productId = order.productId;
        if (!acc[productId]) {
            acc[productId] = {
                productId: productId,
                product: order.product,
                quantity: 0,
                revenue: 0,
            };
        }
        acc[productId].quantity += order.quantity;
        acc[productId].revenue += parseFloat(order.totalAmount);
        return acc;
    }, {});
    var bestSellingProducts = Object.values(productSales)
        .sort(function (a, b) { return b.quantity - a.quantity; })
        .slice(0, 5);
    // Calculate daily sales for the chart (simplified representation)
    var dailySales = [];
    var _loop_1 = function (i) {
        var date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        var dayOrders = deliveredOrders.filter(function (order) {
            var orderDate = new Date(order.createdAt);
            return orderDate.toDateString() === date.toDateString();
        });
        var dayRevenue = dayOrders.reduce(function (sum, order) {
            return sum + parseFloat(order.totalAmount);
        }, 0);
        dailySales.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            revenue: dayRevenue,
            orders: dayOrders.length,
        });
    };
    for (var i = 6; i >= 0; i--) {
        _loop_1(i);
    }
    var avgOrderValue = deliveredOrders.length > 0 ? totalRevenue / deliveredOrders.length : 0;
    var conversionRate = orders.length > 0 ? (deliveredOrders.length / orders.length) * 100 : 0;
    var handleRefresh = function () {
        refetchStats();
    };
    var handleExport = function () {
        // Implement export functionality
        console.log("Exporting analytics data...");
    };
    return (<div className="container mx-auto px-4 py-6 space-y-8 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">Sales Analytics</h1>
          <p className="text-muted-foreground">
            Insights and performance metrics for your LPG business
          </p>
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
            <RefreshCcw className="h-4 w-4"/>
          </Button>
          <Button variant="outline" onClick={handleExport} data-testid="button-export-analytics">
            <Download className="h-4 w-4 mr-2"/>
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold" data-testid="text-revenue-metric">
                    ₱{totalRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400"/>
                </div>
              </div>
              <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                <TrendingUp className="h-3 w-3 inline mr-1"/>
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
                    {deliveredOrders.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400"/>
                </div>
              </div>
              <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                <TrendingUp className="h-3 w-3 inline mr-1"/>
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
                  <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400"/>
                </div>
              </div>
              <div className="mt-2 text-xs text-purple-600 dark:text-purple-400">
                <TrendingUp className="h-3 w-3 inline mr-1"/>
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
                  <Users className="h-6 w-6 text-orange-600 dark:text-orange-400"/>
                </div>
              </div>
              <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                <TrendingDown className="h-3 w-3 inline mr-1"/>
                -2.3% vs previous period
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.section>

      {/* Sales Trend and Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle>Sales Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dailySales.map(function (day, index) { return (<div key={day.date} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm font-medium">{day.date}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium" data-testid={"text-daily-revenue-".concat(index)}>
                        ₱{day.revenue.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {day.orders} orders
                      </div>
                    </div>
                  </div>); })}
              </div>
              
              {dailySales.length === 0 && (<div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
                  <h3 className="font-semibold mb-2">No sales data</h3>
                  <p className="text-muted-foreground">
                    Sales data will appear here once orders are delivered.
                  </p>
                </div>)}
            </CardContent>
          </Card>
        </motion.section>

        {/* Best Selling Products */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle>Best Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bestSellingProducts.length > 0 ? (bestSellingProducts.map(function (item, index) {
            var _a, _b;
            return (<div key={item.productId} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium" data-testid={"text-product-name-".concat(index)}>
                            {((_a = item.product) === null || _a === void 0 ? void 0 : _a.name) || "Unknown Product"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(_b = item.product) === null || _b === void 0 ? void 0 : _b.weight}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium" data-testid={"text-product-quantity-".concat(index)}>
                          {item.quantity} units
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ₱{item.revenue.toLocaleString()}
                        </p>
                      </div>
                    </div>);
        })) : (<div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
                    <h3 className="font-semibold mb-2">No sales data</h3>
                    <p className="text-muted-foreground">
                      Product sales rankings will appear here.
                    </p>
                  </div>)}
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>

      {/* Additional Analytics */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h2 className="text-xl font-semibold mb-4">Additional Insights</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Order Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {["pending", "processing", "out_for_delivery", "delivered", "cancelled"].map(function (status) {
            var count = filteredOrders.filter(function (order) { return order.status === status; }).length;
            var percentage = filteredOrders.length > 0 ? (count / filteredOrders.length) * 100 : 0;
            return (<div key={status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={"w-3 h-3 rounded-full ".concat(status === "delivered" ? "bg-green-500" :
                    status === "cancelled" ? "bg-red-500" :
                        status === "out_for_delivery" ? "bg-yellow-500" :
                            status === "processing" ? "bg-blue-500" :
                                "bg-orange-500")}></div>
                        <span className="text-sm capitalize">
                          {status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium" data-testid={"text-status-count-".concat(status)}>
                          {count}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>);
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
                {["cod", "gcash"].map(function (method) {
            var count = deliveredOrders.filter(function (order) { return order.paymentMethod === method; }).length;
            var percentage = deliveredOrders.length > 0 ? (count / deliveredOrders.length) * 100 : 0;
            return (<div key={method} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={"w-3 h-3 rounded-full ".concat(method === "cod" ? "bg-blue-500" : "bg-green-500")}></div>
                        <span className="text-sm uppercase">{method}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium" data-testid={"text-payment-count-".concat(method)}>
                          {count}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>);
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
                {["new", "swap"].map(function (type) {
            var count = deliveredOrders.filter(function (order) { return order.type === type; }).length;
            var percentage = deliveredOrders.length > 0 ? (count / deliveredOrders.length) * 100 : 0;
            return (<div key={type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={"w-3 h-3 rounded-full ".concat(type === "new" ? "bg-blue-500" : "bg-orange-500")}></div>
                        <span className="text-sm capitalize">{type} Tank</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium" data-testid={"text-type-count-".concat(type)}>
                          {count}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>);
        })}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.section>
    </div>);
}
