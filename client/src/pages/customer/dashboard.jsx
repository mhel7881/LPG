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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { getAuthHeaders } from "@/lib/auth";
import { generateReceiptPDF } from "@/lib/receipt-generator";
import { ShoppingCart, Package, Truck, MessageSquare, MapPin, Plus, Clock, CheckCircle, DollarSign, Calendar, TrendingUp, Heart, Star } from "lucide-react";
export default function CustomerDashboard() {
    var _this = this;
    var user = useAuth().user;
    var _a = useQuery({
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
    }), _b = _a.data, orders = _b === void 0 ? [] : _b, ordersLoading = _a.isLoading;
    var currentOrders = orders.filter(function (order) {
        return !["delivered", "cancelled"].includes(order.status);
    });
    var recentOrders = orders
        .filter(function (order) { return order.status === "delivered"; })
        .slice(0, 3);
    // Calculate customer stats
    var totalSpent = orders
        .filter(function (order) { return order.status === "delivered"; })
        .reduce(function (sum, order) { return sum + parseFloat(order.totalAmount); }, 0);
    var totalOrders = orders.filter(function (order) { return order.status === "delivered"; }).length;
    var pendingOrders = orders.filter(function (order) {
        return ["pending", "processing", "out_for_delivery"].includes(order.status);
    }).length;
    var getStatusColor = function (status) {
        switch (status) {
            case "pending": return "bg-orange-100 text-orange-800";
            case "processing": return "bg-blue-100 text-blue-800";
            case "out_for_delivery": return "bg-yellow-100 text-yellow-800";
            case "delivered": return "bg-green-100 text-green-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };
    var getStatusProgress = function (status) {
        switch (status) {
            case "pending": return 25;
            case "processing": return 50;
            case "out_for_delivery": return 75;
            case "delivered": return 100;
            default: return 0;
        }
    };
    var handleDownloadReceipt = function (orderId) { return __awaiter(_this, void 0, void 0, function () {
        var response, orderDetails, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, fetch("/api/orders/".concat(orderId, "/receipt"), {
                            headers: getAuthHeaders(),
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error('Failed to fetch order details');
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    orderDetails = _a.sent();
                    // Generate and download PDF
                    return [4 /*yield*/, generateReceiptPDF(orderDetails)];
                case 3:
                    // Generate and download PDF
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error('Error downloading receipt:', error_1);
                    alert('Failed to download receipt. Please try again.');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="container mx-auto px-4 py-6 space-y-8 pb-20 md:pb-6">
      {/* Hero Section */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2" data-testid="text-welcome-message">
              Welcome back, {user === null || user === void 0 ? void 0 : user.name}!
            </h1>
            <p className="text-primary-foreground/80 mb-4">
              Need LPG? Order now for fast delivery to your doorstep
            </p>
            <Link href="/customer/products" data-testid="link-order-now">
              <Button variant="secondary" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                <Plus className="h-4 w-4 mr-2"/>
                Order Now
              </Button>
            </Link>
          </div>
          <Truck className="h-16 w-16 text-primary-foreground/60"/>
        </div>
      </motion.section>

      {/* Customer Stats */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
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
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400"/>
                </div>
              </div>
              <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                <TrendingUp className="h-3 w-3 inline mr-1"/>
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
                  <Package className="h-6 w-6 text-blue-600 dark:text-blue-400"/>
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
                  <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400"/>
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
                  <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400"/>
                </div>
              </div>
              <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                <Heart className="h-3 w-3 inline mr-1"/>
                Member status
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.section>

      {/* Quick Actions */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link href="/customer/products" data-testid="link-quick-order">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Plus className="h-6 w-6 text-primary"/>
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
                  <Calendar className="h-6 w-6 text-primary"/>
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
                  <Truck className="h-6 w-6 text-primary"/>
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
                  <MessageSquare className="h-6 w-6 text-primary"/>
                </div>
                <h3 className="font-semibold mb-1">Get Support</h3>
                <p className="text-sm text-muted-foreground">Chat with us</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </motion.section>

      {/* Current Orders */}
      {currentOrders.length > 0 && (<motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Current Orders</h2>
            <Link href="/customer/orders" data-testid="link-view-all-orders">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>

          <div className="space-y-4">
            {currentOrders.map(function (order) {
                var _a;
                return (<Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-primary"/>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium" data-testid={"text-order-product-".concat(order.id)}>
                          {(_a = order.product) === null || _a === void 0 ? void 0 : _a.name} ({order.type === "swap" ? "Swap" : "New"})
                        </h3>
                        <span className="font-medium" data-testid={"text-order-amount-".concat(order.id)}>
                          ₱{order.totalAmount}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mb-3">
                        <Badge className={getStatusColor(order.status)} data-testid={"badge-order-status-".concat(order.id)}>
                          {order.status === "out_for_delivery" ? "Out for Delivery" :
                        order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                        <span className="text-sm text-muted-foreground" data-testid={"text-order-number-".concat(order.id)}>
                          {order.orderNumber}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mb-3">
                        <Progress value={getStatusProgress(order.status)} className="flex-1 h-2" data-testid={"progress-order-".concat(order.id)}/>
                        <span className="text-xs text-muted-foreground">
                          {order.status === "out_for_delivery" ? "ETA: 15 mins" : ""}
                        </span>
                      </div>
                      <div className="flex space-x-3">
                        <Button size="sm" className="flex-1" data-testid={"button-track-order-".concat(order.id)}>
                          <MapPin className="h-4 w-4 mr-2"/>
                          Track Order
                        </Button>
                        <Link href="/chat" data-testid={"link-chat-".concat(order.id)}>
                          <Button variant="outline" size="sm" className="flex-1">
                            <MessageSquare className="h-4 w-4 mr-2"/>
                            Chat
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>);
            })}
          </div>
        </motion.section>)}

      {/* Quick Actions */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/customer/products" data-testid="link-quick-products">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Package className="h-8 w-8 text-primary mx-auto mb-2"/>
                <p className="font-medium">Browse Products</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/customer/cart" data-testid="link-quick-cart">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <ShoppingCart className="h-8 w-8 text-primary mx-auto mb-2"/>
                <p className="font-medium">View Cart</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/customer/orders" data-testid="link-quick-orders">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 text-primary mx-auto mb-2"/>
                <p className="font-medium">Order History</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/chat" data-testid="link-quick-chat">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <MessageSquare className="h-8 w-8 text-primary mx-auto mb-2"/>
                <p className="font-medium">Chat Support</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </motion.section>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (<motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          <div className="space-y-4">
            {recentOrders.map(function (order) {
                var _a;
                return (<Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600"/>
                      </div>
                      <div>
                        <h3 className="font-medium" data-testid={"text-recent-order-product-".concat(order.id)}>
                          {(_a = order.product) === null || _a === void 0 ? void 0 : _a.name} ({order.type === "swap" ? "Swap" : "New"})
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Delivered on {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium" data-testid={"text-recent-order-amount-".concat(order.id)}>
                        ₱{order.totalAmount}
                      </div>
                      <div className="flex space-x-2 mt-1">
                        <Button size="sm" variant="outline" data-testid={"button-reorder-".concat(order.id)}>
                          Reorder
                        </Button>
                        <Button size="sm" variant="ghost" onClick={function () { return handleDownloadReceipt(order.id); }} data-testid={"button-receipt-".concat(order.id)}>
                          Receipt
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>);
            })}
          </div>
        </motion.section>)}

      {ordersLoading && (<div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading your orders...</p>
        </div>)}

      {!ordersLoading && orders.length === 0 && (<Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
            <h3 className="font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by ordering your first LPG tank!
            </p>
            <Link href="/customer/products" data-testid="link-first-order">
              <Button>
                <Plus className="h-4 w-4 mr-2"/>
                Browse Products
              </Button>
            </Link>
          </CardContent>
        </Card>)}
    </div>);
}
