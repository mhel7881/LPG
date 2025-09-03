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
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAuthHeaders } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import Map from "@/components/map";
import { Search, MapPin, Navigation, RefreshCw, Users, Truck, Package, Filter, Eye } from "lucide-react";
export default function AdminLocationTracking() {
    var _this = this;
    var _a = useState(""), searchTerm = _a[0], setSearchTerm = _a[1];
    var _b = useState("all"), statusFilter = _b[0], setStatusFilter = _b[1];
    var _c = useState("orders"), viewMode = _c[0], setViewMode = _c[1];
    var _d = useState(null), selectedCustomer = _d[0], setSelectedCustomer = _d[1];
    var toast = useToast().toast;
    // Fetch customer addresses with GPS coordinates
    var _e = useQuery({
        queryKey: ["/api/admin/addresses"],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("/api/admin/addresses", {
                            headers: getAuthHeaders(),
                        })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error("Failed to fetch addresses");
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
    }), _f = _e.data, addresses = _f === void 0 ? [] : _f, addressesLoading = _e.isLoading, refetchAddresses = _e.refetch;
    // Fetch active orders with location data
    var _g = useQuery({
        queryKey: ["/api/admin/orders/tracking"],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("/api/admin/orders/tracking", {
                            headers: getAuthHeaders(),
                        })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error("Failed to fetch orders for tracking");
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
    }), _h = _g.data, orders = _h === void 0 ? [] : _h, ordersLoading = _g.isLoading, refetchOrders = _g.refetch;
    // Filter addresses with GPS coordinates
    var addressesWithLocation = addresses.filter(function (addr) {
        return addr.coordinates &&
            (searchTerm === "" ||
                addr.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                addr.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                addr.street.toLowerCase().includes(searchTerm.toLowerCase()));
    });
    // Filter orders
    var filteredOrders = orders.filter(function (order) {
        var _a;
        return (statusFilter === "all" || order.status === statusFilter) &&
            ((_a = order.address) === null || _a === void 0 ? void 0 : _a.coordinates) &&
            (searchTerm === "" ||
                order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    });
    var handleRefresh = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all([refetchAddresses(), refetchOrders()])];
                case 1:
                    _a.sent();
                    toast({
                        title: "Refreshed",
                        description: "Location data has been updated",
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
            default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
        }
    };
    var formatStatus = function (status) {
        return status.split('_').map(function (word) {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');
    };
    // Generate map markers based on current view
    var getMapMarkers = function () {
        if (viewMode === "customers") {
            return addressesWithLocation.map(function (address) { return ({
                id: address.id,
                position: {
                    latitude: address.coordinates.lat,
                    longitude: address.coordinates.lng
                },
                title: "".concat(address.user.name, " - ").concat(address.label),
                type: "customer"
            }); });
        }
        else {
            return filteredOrders.map(function (order) { return ({
                id: order.id,
                position: {
                    latitude: order.address.coordinates.lat,
                    longitude: order.address.coordinates.lng
                },
                title: "".concat(order.orderNumber, " - ").concat(order.customer.name),
                type: order.status === "out_for_delivery" ? "delivery" : "destination"
            }); });
        }
    };
    var getMapCenter = function () {
        var markers = getMapMarkers();
        if (markers.length === 0) {
            return { latitude: 14.5995, longitude: 120.9842 }; // Manila, Philippines default
        }
        var avgLat = markers.reduce(function (sum, marker) { return sum + marker.position.latitude; }, 0) / markers.length;
        var avgLng = markers.reduce(function (sum, marker) { return sum + marker.position.longitude; }, 0) / markers.length;
        return { latitude: avgLat, longitude: avgLng };
    };
    var activeOrdersCount = orders.filter(function (o) { return ["pending", "processing", "out_for_delivery"].includes(o.status); }).length;
    var customersWithLocationCount = addressesWithLocation.length;
    return (<div className="container mx-auto px-4 py-6 space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">Location Tracking</h1>
          <p className="text-muted-foreground">
            Track customer locations and manage deliveries on the map
          </p>
        </div>
        <Button onClick={handleRefresh} data-testid="button-refresh-locations">
          <RefreshCw className="h-4 w-4 mr-2"/>
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600 dark:text-blue-400"/>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Orders</p>
                <p className="text-2xl font-bold" data-testid="text-active-orders-count">
                  {activeOrdersCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600 dark:text-green-400"/>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Customers with Location</p>
                <p className="text-2xl font-bold" data-testid="text-customers-with-location-count">
                  {customersWithLocationCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <Truck className="h-5 w-5 text-yellow-600 dark:text-yellow-400"/>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Out for Delivery</p>
                <p className="text-2xl font-bold" data-testid="text-out-for-delivery-count">
                  {orders.filter(function (o) { return o.status === "out_for_delivery"; }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            {/* View Mode Toggle */}
            <div className="flex space-x-2">
              <Button variant={viewMode === "orders" ? "default" : "outline"} size="sm" onClick={function () { return setViewMode("orders"); }} data-testid="button-view-orders">
                <Package className="h-4 w-4 mr-2"/>
                Orders
              </Button>
              <Button variant={viewMode === "customers" ? "default" : "outline"} size="sm" onClick={function () { return setViewMode("customers"); }} data-testid="button-view-customers">
                <Users className="h-4 w-4 mr-2"/>
                Customers
              </Button>
            </div>

            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
              <Input placeholder={"Search ".concat(viewMode === "orders" ? "orders" : "customers", "...")} value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }} className="pl-10" data-testid="input-search-locations"/>
            </div>

            {/* Status Filter (for orders view) */}
            {viewMode === "orders" && (<Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>)}
          </div>
        </CardContent>
      </Card>

      {/* Main Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2"/>
            Live Map - {viewMode === "orders" ? "Order" : "Customer"} Locations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {(addressesLoading || ordersLoading) ? (<div className="h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading map data...</p>
              </div>
            </div>) : (<Map center={getMapCenter()} markers={getMapMarkers()} className="h-96"/>)}
        </CardContent>
      </Card>

      {/* Data List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {viewMode === "orders" ? (<Card>
            <CardHeader>
              <CardTitle>Active Orders with Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredOrders.length === 0 ? (<div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2"/>
                  <p className="text-muted-foreground">No orders with location data found</p>
                </div>) : (filteredOrders.map(function (order) { return (<motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium" data-testid={"text-order-number-".concat(order.id)}>
                          {order.orderNumber}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {order.customer.name}
                        </p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {formatStatus(order.status)}
                      </Badge>
                    </div>
                    
                    {order.address && (<div className="text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4"/>
                          <span>
                            {order.address.street}, {order.address.city}
                          </span>
                        </div>
                        {order.address.coordinates && (<div className="flex items-center space-x-2 mt-1">
                            <Navigation className="h-4 w-4 text-green-600"/>
                            <span className="text-green-600 font-medium">
                              {order.address.coordinates.lat.toFixed(6)}, {order.address.coordinates.lng.toFixed(6)}
                            </span>
                          </div>)}
                      </div>)}
                  </motion.div>); }))}
            </CardContent>
          </Card>) : (<Card>
            <CardHeader>
              <CardTitle>Customers with GPS Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {addressesWithLocation.length === 0 ? (<div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2"/>
                  <p className="text-muted-foreground">No customers with location data found</p>
                </div>) : (addressesWithLocation.map(function (address) { return (<motion.div key={address.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium" data-testid={"text-customer-name-".concat(address.id)}>
                          {address.user.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {address.user.email}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {address.label}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4"/>
                        <span>
                          {address.street}, {address.city}
                        </span>
                      </div>
                      {address.coordinates && (<div className="flex items-center space-x-2 mt-1">
                          <Navigation className="h-4 w-4 text-green-600"/>
                          <span className="text-green-600 font-medium">
                            {address.coordinates.lat.toFixed(6)}, {address.coordinates.lng.toFixed(6)}
                          </span>
                        </div>)}
                    </div>
                  </motion.div>); }))}
            </CardContent>
          </Card>)}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" data-testid="button-export-locations">
              <Eye className="h-4 w-4 mr-2"/>
              Export Location Data
            </Button>
            <Button variant="outline" className="w-full" data-testid="button-delivery-routes">
              <Navigation className="h-4 w-4 mr-2"/>
              Optimize Delivery Routes
            </Button>
            <Button variant="outline" className="w-full" data-testid="button-location-analytics">
              <Filter className="h-4 w-4 mr-2"/>
              Location Analytics
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>);
}
