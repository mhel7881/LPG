var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { getAuthHeaders } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Minus, Plus, Trash2, Package, ShoppingCart, CreditCard, MapPin, ArrowLeft } from "lucide-react";
export default function CustomerCart() {
    var _this = this;
    var _a = useState(""), selectedAddressId = _a[0], setSelectedAddressId = _a[1];
    var _b = useState("cod"), paymentMethod = _b[0], setPaymentMethod = _b[1];
    var _c = useState(""), notes = _c[0], setNotes = _c[1];
    var _d = useState(false), isPlacingOrder = _d[0], setIsPlacingOrder = _d[1];
    var _e = useCart(), items = _e.items, updateItem = _e.updateItem, removeItem = _e.removeItem, clearCart = _e.clearCart;
    var user = useAuth().user;
    var toast = useToast().toast;
    var _f = useQuery({
        queryKey: ["/api/users/addresses"],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("/api/users/addresses", {
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
    }).data, addresses = _f === void 0 ? [] : _f;
    var _g = useQuery({
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
    }).data, products = _g === void 0 ? [] : _g;
    // Enrich cart items with product data
    var enrichedItems = items.map(function (item) {
        var product = products.find(function (p) { return p.id === item.productId; });
        return __assign(__assign({}, item), { product: product });
    });
    var cartTotal = enrichedItems.reduce(function (total, item) {
        if (!item.product)
            return total;
        var price = item.type === "new" ? parseFloat(item.product.newPrice) : parseFloat(item.product.swapPrice);
        return total + (price * item.quantity);
    }, 0);
    var handleUpdateQuantity = function (itemId, newQuantity) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(newQuantity <= 0)) return [3 /*break*/, 2];
                    return [4 /*yield*/, removeItem(itemId)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, updateItem(itemId, newQuantity)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handlePlaceOrder = function () { return __awaiter(_this, void 0, void 0, function () {
        var _i, enrichedItems_1, item, unitPrice, totalAmount, response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (enrichedItems.length === 0) {
                        toast({
                            title: "Empty Cart",
                            description: "Please add items to your cart before placing an order.",
                            variant: "destructive",
                        });
                        return [2 /*return*/];
                    }
                    if (!selectedAddressId) {
                        toast({
                            title: "Address Required",
                            description: "Please select a delivery address.",
                            variant: "destructive",
                        });
                        return [2 /*return*/];
                    }
                    setIsPlacingOrder(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, 8, 9]);
                    _i = 0, enrichedItems_1 = enrichedItems;
                    _a.label = 2;
                case 2:
                    if (!(_i < enrichedItems_1.length)) return [3 /*break*/, 5];
                    item = enrichedItems_1[_i];
                    if (!item.product)
                        return [3 /*break*/, 4];
                    unitPrice = item.type === "new" ? item.product.newPrice : item.product.swapPrice;
                    totalAmount = parseFloat(unitPrice) * item.quantity;
                    return [4 /*yield*/, fetch("/api/orders", {
                            method: "POST",
                            headers: getAuthHeaders(),
                            body: JSON.stringify({
                                productId: item.productId,
                                addressId: selectedAddressId,
                                quantity: item.quantity,
                                type: item.type,
                                unitPrice: unitPrice,
                                totalAmount: totalAmount.toString(),
                                paymentMethod: paymentMethod,
                                notes: notes || undefined,
                            }),
                        })];
                case 3:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Failed to place order");
                    }
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [4 /*yield*/, clearCart()];
                case 6:
                    _a.sent();
                    toast({
                        title: "Order Placed!",
                        description: "Your order has been placed successfully. You'll receive updates soon.",
                    });
                    // Redirect to orders page
                    window.location.href = "/customer/orders";
                    return [3 /*break*/, 9];
                case 7:
                    error_1 = _a.sent();
                    toast({
                        title: "Order Failed",
                        description: error_1.message || "Failed to place order. Please try again.",
                        variant: "destructive",
                    });
                    return [3 /*break*/, 9];
                case 8:
                    setIsPlacingOrder(false);
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    // Set default address if available and none selected
    useState(function () {
        if (addresses.length > 0 && !selectedAddressId) {
            var defaultAddress = addresses.find(function (addr) { return addr.isDefault; }) || addresses[0];
            setSelectedAddressId(defaultAddress.id);
        }
    });
    return (<div className="container mx-auto px-4 py-6 space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/customer/products" data-testid="link-back-to-products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4"/>
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Shopping Cart</h1>
          <p className="text-muted-foreground" data-testid="text-cart-item-count">
            {enrichedItems.length} {enrichedItems.length === 1 ? "item" : "items"}
          </p>
        </div>
      </div>

      {enrichedItems.length === 0 ? (<Card>
          <CardContent className="p-8 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
            <h3 className="font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-4">
              Add some LPG tanks to get started!
            </p>
            <Link href="/customer/products" data-testid="link-browse-products">
              <Button>
                <Package className="h-4 w-4 mr-2"/>
                Browse Products
              </Button>
            </Link>
          </CardContent>
        </Card>) : (<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cart Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {enrichedItems.map(function (item, index) {
                var _a, _b, _c, _d;
                return (<motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Package className="h-8 w-8 text-primary"/>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium" data-testid={"text-cart-item-name-".concat(item.id)}>
                        {((_a = item.product) === null || _a === void 0 ? void 0 : _a.name) || "Unknown Product"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.type === "new" ? "New Tank" : "Tank Swap"} • {(_b = item.product) === null || _b === void 0 ? void 0 : _b.weight}
                      </p>
                      <p className="font-medium text-primary" data-testid={"text-cart-item-price-".concat(item.id)}>
                        ₱{item.type === "new" ? (_c = item.product) === null || _c === void 0 ? void 0 : _c.newPrice : (_d = item.product) === null || _d === void 0 ? void 0 : _d.swapPrice}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="icon" onClick={function () { return handleUpdateQuantity(item.id, item.quantity - 1); }} data-testid={"button-decrease-quantity-".concat(item.id)}>
                        <Minus className="h-4 w-4"/>
                      </Button>
                      <span className="w-8 text-center" data-testid={"text-quantity-".concat(item.id)}>
                        {item.quantity}
                      </span>
                      <Button variant="outline" size="icon" onClick={function () { return handleUpdateQuantity(item.id, item.quantity + 1); }} data-testid={"button-increase-quantity-".concat(item.id)}>
                        <Plus className="h-4 w-4"/>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={function () { return removeItem(item.id); }} className="text-destructive hover:text-destructive" data-testid={"button-remove-item-".concat(item.id)}>
                        <Trash2 className="h-4 w-4"/>
                      </Button>
                    </div>
                  </motion.div>);
            })}
                
                <div className="flex justify-between items-center pt-4 border-t">
                  <Button variant="ghost" onClick={clearCart} data-testid="button-clear-cart">
                    <Trash2 className="h-4 w-4 mr-2"/>
                    Clear Cart
                  </Button>
                  <div className="text-xl font-bold" data-testid="text-cart-total">
                    Total: ₱{cartTotal.toFixed(2)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Checkout */}
          <div className="space-y-4">
            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2"/>
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {addresses.length > 0 ? (<Select value={selectedAddressId} onValueChange={setSelectedAddressId}>
                    <SelectTrigger data-testid="select-delivery-address">
                      <SelectValue placeholder="Select address"/>
                    </SelectTrigger>
                    <SelectContent>
                      {addresses.map(function (address) { return (<SelectItem key={address.id} value={address.id}>
                          <div>
                            <div className="font-medium">{address.label}</div>
                            <div className="text-sm text-muted-foreground">
                              {address.street}, {address.city}
                            </div>
                          </div>
                        </SelectItem>); })}
                    </SelectContent>
                  </Select>) : (<div className="text-center py-4">
                    <p className="text-muted-foreground mb-2">No addresses found</p>
                    <Link href="/customer/profile" data-testid="link-add-address">
                      <Button size="sm">Add Address</Button>
                    </Link>
                  </div>)}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2"/>
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger data-testid="select-payment-method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cod">Cash on Delivery</SelectItem>
                    <SelectItem value="gcash">GCash</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Order Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Order Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Input placeholder="Special instructions (optional)" value={notes} onChange={function (e) { return setNotes(e.target.value); }} data-testid="input-order-notes"/>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span data-testid="text-subtotal">₱{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span data-testid="text-delivery-fee">Free</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span data-testid="text-order-total">₱{cartTotal.toFixed(2)}</span>
                </div>
                
                <Button className="w-full mt-4" onClick={handlePlaceOrder} disabled={isPlacingOrder || !selectedAddressId} data-testid="button-place-order">
                  {isPlacingOrder ? "Placing Order..." : "Place Order"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>)}
    </div>);
}
