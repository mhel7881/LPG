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
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getAuthHeaders } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useGeolocation } from "@/hooks/use-geolocation";
import Map from "@/components/map";
import { ArrowLeft, Package, MapPin, MessageSquare, Clock, CheckCircle, Truck, AlertCircle, Phone, RefreshCw } from "lucide-react";
export default function OrderTracking() {
    var _this = this;
    var _a, _b, _c;
    var orderId = useParams().orderId;
    var navigate = useNavigate();
    var toast = useToast().toast;
    var _d = useState(false), refreshing = _d[0], setRefreshing = _d[1];
    var _e = useGeolocation(), currentLocation = _e.position, getCurrentPosition = _e.getCurrentPosition;
    var _f = useQuery({
        queryKey: ["/api/orders/".concat(orderId)],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("/api/orders/".concat(orderId), {
                            headers: getAuthHeaders(),
                        })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            if (response.status === 404) {
                                throw new Error("Order not found");
                            }
                            throw new Error("Failed to fetch order details");
                        }
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        enabled: !!orderId,
        refetchInterval: 60000, // Refresh every minute
    }), order = _f.data, isLoading = _f.isLoading, refetch = _f.refetch;
    useEffect(function () {
        // Get current location when component mounts
        getCurrentPosition();
    }, [getCurrentPosition]);
    var handleRefresh = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setRefreshing(true);
                    return [4 /*yield*/, refetch()];
                case 1:
                    _a.sent();
                    getCurrentPosition();
                    setRefreshing(false);
                    toast({
                        title: "Updated",
                        description: "Order information refreshed",
                    });
                    return [2 /*return*/];
            }
        });
    }); };
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
            case "pending": return <Clock className="h-5 w-5"/>;
            case "processing": return <Package className="h-5 w-5"/>;
            case "out_for_delivery": return <Truck className="h-5 w-5"/>;
            case "delivered": return <CheckCircle className="h-5 w-5"/>;
            case "cancelled": return <AlertCircle className="h-5 w-5"/>;
            default: return <Package className="h-5 w-5"/>;
        }
    };
    var formatStatus = function (status) {
        return status.split('_').map(function (word) {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');
    };
    var getEstimatedTime = function (status) {
        switch (status) {
            case "pending": return "Processing within 2 hours";
            case "processing": return "Preparing for delivery";
            case "out_for_delivery": return "15-30 minutes away";
            case "delivered": return "Delivered";
            default: return "";
        }
    };
    // Simulate delivery driver location (in real app, this would come from your backend)
    var getDeliveryDriverLocation = function () {
        var _a;
        if ((order === null || order === void 0 ? void 0 : order.status) !== "out_for_delivery" || !((_a = order === null || order === void 0 ? void 0 : order.address) === null || _a === void 0 ? void 0 : _a.coordinates)) {
            return null;
        }
        // Simulate driver location - slightly offset from destination
        return {
            latitude: order.address.coordinates.lat + 0.001,
            longitude: order.address.coordinates.lng + 0.001
        };
    };
    var getMapMarkers = function () {
        var _a;
        var markers = [];
        // Customer current location
        if (currentLocation) {
            markers.push({
                id: "current-location",
                position: currentLocation,
                title: "Your Location",
                type: "customer"
            });
        }
        // Delivery destination
        if ((_a = order === null || order === void 0 ? void 0 : order.address) === null || _a === void 0 ? void 0 : _a.coordinates) {
            markers.push({
                id: "destination",
                position: {
                    latitude: order.address.coordinates.lat,
                    longitude: order.address.coordinates.lng
                },
                title: "Delivery Address",
                type: "destination"
            });
        }
        // Delivery driver location
        var driverLocation = getDeliveryDriverLocation();
        if (driverLocation) {
            markers.push({
                id: "driver",
                position: driverLocation,
                title: "Delivery Driver",
                type: "delivery"
            });
        }
        return markers;
    };
    if (isLoading) {
        return (<div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="h-6 bg-muted rounded animate-pulse"></div>
                <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
                <div className="h-32 bg-muted rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>);
    }
    if (!order) {
        return (<div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
            <h3 className="font-semibold mb-2">Order Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The order you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button onClick={function () { return navigate("/orders"); }}>
              Back to Orders
            </Button>
          </CardContent>
        </Card>
      </div>);
    }
    return (<div className="container mx-auto px-4 py-6 space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={function () { return navigate("/orders"); }} data-testid="button-back-to-orders">
          <ArrowLeft className="h-4 w-4"/>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Track Order</h1>
          <p className="text-muted-foreground" data-testid="text-order-number">
            {order.orderNumber}
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing} data-testid="button-refresh-tracking">
          <RefreshCw className={"h-4 w-4 ".concat(refreshing ? "animate-spin" : "")}/>
        </Button>
      </div>

      {/* Order Status Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                {getStatusIcon(order.status)}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <Badge className={getStatusColor(order.status)} data-testid="badge-order-status">
                    {formatStatus(order.status)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {getEstimatedTime(order.status)}
                  </span>
                </div>
                <h3 className="font-semibold" data-testid="text-product-details">
                  {(_a = order.product) === null || _a === void 0 ? void 0 : _a.name} ({order.type === "swap" ? "Swap" : "New"})
                </h3>
                <p className="text-sm text-muted-foreground">
                  Qty: {order.quantity} • {(_b = order.product) === null || _b === void 0 ? void 0 : _b.weight} • ₱{order.totalAmount}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Order Progress</span>
                <span>{getStatusProgress(order.status)}%</span>
              </div>
              <Progress value={getStatusProgress(order.status)} className="h-3" data-testid="progress-order-status"/>
            </div>

            {/* Order Timeline */}
            <div className="mt-6 space-y-3">
              <h4 className="font-medium">Order Timeline</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className={"w-3 h-3 rounded-full ".concat(order.status === "pending" ? "bg-primary" : "bg-muted")}></div>
                  <span className="text-sm">Order Placed</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(order.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={"w-3 h-3 rounded-full ".concat(["processing", "out_for_delivery", "delivered"].includes(order.status) ? "bg-primary" : "bg-muted")}></div>
                  <span className="text-sm">Order Confirmed</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={"w-3 h-3 rounded-full ".concat(["out_for_delivery", "delivered"].includes(order.status) ? "bg-primary" : "bg-muted")}></div>
                  <span className="text-sm">Out for Delivery</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={"w-3 h-3 rounded-full ".concat(order.status === "delivered" ? "bg-primary" : "bg-muted")}></div>
                  <span className="text-sm">Delivered</span>
                  {order.deliveredAt && (<span className="text-xs text-muted-foreground ml-auto">
                      {new Date(order.deliveredAt).toLocaleString()}
                    </span>)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Live Map Tracking */}
      {((_c = order.address) === null || _c === void 0 ? void 0 : _c.coordinates) && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2"/>
                Live Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Map center={{
                latitude: order.address.coordinates.lat,
                longitude: order.address.coordinates.lng
            }} markers={getMapMarkers()} className="h-64 md:h-96"/>
              
              {/* Delivery Info */}
              <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium mb-2">Delivery Address</h4>
                <p className="text-sm text-muted-foreground">
                  {order.address.street}, {order.address.city}, {order.address.province} {order.address.zipCode}
                </p>
                {order.status === "out_for_delivery" && (<div className="flex items-center space-x-2 mt-2">
                    <Truck className="h-4 w-4 text-green-600"/>
                    <span className="text-sm font-medium text-green-600">
                      Driver is on the way
                    </span>
                  </div>)}
              </div>
            </CardContent>
          </Card>
        </motion.div>)}

      {/* Action Buttons */}
      <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-3">
        <Button className="flex-1" data-testid="button-chat-support">
          <MessageSquare className="h-4 w-4 mr-2"/>
          Chat with Support
        </Button>
        <Button variant="outline" className="flex-1" data-testid="button-call-support">
          <Phone className="h-4 w-4 mr-2"/>
          Call Support
        </Button>
      </div>

      {/* Order Notes */}
      {order.notes && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader>
              <CardTitle>Order Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{order.notes}</p>
            </CardContent>
          </Card>
        </motion.div>)}
    </div>);
}
