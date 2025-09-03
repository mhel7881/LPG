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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getAuthHeaders } from "@/lib/auth";
import { generateReceiptPDF } from "@/lib/receipt-generator";
import { Package, MapPin, MessageSquare, Download, RefreshCcw, Clock, CheckCircle, Truck, AlertCircle } from "lucide-react";
export default function CustomerOrders() {
    var _this = this;
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
    }), _b = _a.data, orders = _b === void 0 ? [] : _b, isLoading = _a.isLoading, refetch = _a.refetch;
    var getStatusColor = function (status) {
        switch (status) {
            case "pending": return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
            case "processing": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
            case "out_for_delivery": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
            case "delivered": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
            case "cancelled": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
            default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
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
    var getStatusIcon = function (status) {
        switch (status) {
            case "pending": return <Clock className="h-4 w-4"/>;
            case "processing": return <Package className="h-4 w-4"/>;
            case "out_for_delivery": return <Truck className="h-4 w-4"/>;
            case "delivered": return <CheckCircle className="h-4 w-4"/>;
            case "cancelled": return <AlertCircle className="h-4 w-4"/>;
            default: return <Package className="h-4 w-4"/>;
        }
    };
    var formatStatus = function (status) {
        return status.split('_').map(function (word) {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');
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
    var currentOrders = orders.filter(function (order) {
        return !["delivered", "cancelled"].includes(order.status);
    });
    var pastOrders = orders.filter(function (order) {
        return ["delivered", "cancelled"].includes(order.status);
    });
    return (<div className="container mx-auto px-4 py-6 space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Orders</h1>
          <p className="text-muted-foreground" data-testid="text-orders-count">
            {orders.length} {orders.length === 1 ? "order" : "orders"} total
          </p>
        </div>
        <Button variant="outline" onClick={function () { return refetch(); }} data-testid="button-refresh-orders">
          <RefreshCcw className="h-4 w-4 mr-2"/>
          Refresh
        </Button>
      </div>

      {isLoading ? (<div className="space-y-4">
          {Array.from({ length: 3 }).map(function (_, i) { return (<Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-3 bg-muted rounded animate-pulse w-3/4"></div>
                  <div className="h-8 bg-muted rounded animate-pulse"></div>
                </div>
              </CardContent>
            </Card>); })}
        </div>) : orders.length === 0 ? (<Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
            <h3 className="font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-4">
              Your order history will appear here once you place your first order.
            </p>
            <Button>Start Shopping</Button>
          </CardContent>
        </Card>) : (<div className="space-y-8">
          {/* Current Orders */}
          {currentOrders.length > 0 && (<section>
              <h2 className="text-xl font-semibold mb-4">Current Orders</h2>
              <div className="space-y-4">
                {currentOrders.map(function (order, index) {
                    var _a, _b;
                    return (<motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            {getStatusIcon(order.status)}
                          </div>
                          
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium" data-testid={"text-order-product-".concat(order.id)}>
                                  {(_a = order.product) === null || _a === void 0 ? void 0 : _a.name} ({order.type === "swap" ? "Swap" : "New"})
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  Qty: {order.quantity} • {(_b = order.product) === null || _b === void 0 ? void 0 : _b.weight}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="font-medium" data-testid={"text-order-amount-".concat(order.id)}>
                                  ₱{order.totalAmount}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {order.paymentMethod.toUpperCase()}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Badge className={getStatusColor(order.status)} data-testid={"badge-order-status-".concat(order.id)}>
                                {formatStatus(order.status)}
                              </Badge>
                              <span className="text-sm text-muted-foreground" data-testid={"text-order-number-".concat(order.id)}>
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
                              <Progress value={getStatusProgress(order.status)} className="h-2" data-testid={"progress-order-".concat(order.id)}/>
                            </div>

                            <div className="flex space-x-3">
                              <Button size="sm" className="flex-1" data-testid={"button-track-order-".concat(order.id)}>
                                <MapPin className="h-4 w-4 mr-2"/>
                                Track Order
                              </Button>
                              <Button variant="outline" size="sm" className="flex-1" data-testid={"button-chat-".concat(order.id)}>
                                <MessageSquare className="h-4 w-4 mr-2"/>
                                Chat Support
                              </Button>
                            </div>

                            {order.notes && (<div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                                <strong>Notes:</strong> {order.notes}
                              </div>)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>);
                })}
              </div>
            </section>)}

          {/* Past Orders */}
          {pastOrders.length > 0 && (<section>
              <h2 className="text-xl font-semibold mb-4">Order History</h2>
              <div className="space-y-4">
                {pastOrders.map(function (order, index) {
                    var _a;
                    return (<motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                              {getStatusIcon(order.status)}
                            </div>
                            <div>
                              <h3 className="font-medium" data-testid={"text-past-order-product-".concat(order.id)}>
                                {(_a = order.product) === null || _a === void 0 ? void 0 : _a.name} ({order.type === "swap" ? "Swap" : "New"})
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
                            : new Date(order.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="font-medium" data-testid={"text-past-order-amount-".concat(order.id)}>
                                ₱{order.totalAmount}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" data-testid={"button-reorder-".concat(order.id)}>
                                <RefreshCcw className="h-4 w-4 mr-2"/>
                                Reorder
                              </Button>
                              <Button size="sm" variant="ghost" onClick={function () { return handleDownloadReceipt(order.id); }} data-testid={"button-download-receipt-".concat(order.id)}>
                                <Download className="h-4 w-4"/>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>);
                })}
              </div>
            </section>)}
        </div>)}
    </div>);
}
