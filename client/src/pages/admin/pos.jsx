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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getAuthHeaders } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Plus, Minus, Trash2, Package, CreditCard, Receipt, User } from "lucide-react";
export default function AdminPOS() {
    var _this = this;
    var _a = useState([]), cart = _a[0], setCart = _a[1];
    var _b = useState(null), selectedCustomer = _b[0], setSelectedCustomer = _b[1];
    var _c = useState("cash"), paymentMethod = _c[0], setPaymentMethod = _c[1];
    var _d = useState(""), amountPaid = _d[0], setAmountPaid = _d[1];
    var _e = useState(false), isProcessingPayment = _e[0], setIsProcessingPayment = _e[1];
    var _f = useState(false), isCustomerDialogOpen = _f[0], setIsCustomerDialogOpen = _f[1];
    var toast = useToast().toast;
    var queryClient = useQueryClient();
    // Fetch products
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
    }), _h = _g.data, products = _h === void 0 ? [] : _h, productsLoading = _g.isLoading;
    // Fetch customers for lookup
    var _j = useQuery({
        queryKey: ["/api/customers"],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("/api/users?role=customer", {
                            headers: getAuthHeaders(),
                        })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error("Failed to fetch customers");
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
    }).data, customers = _j === void 0 ? [] : _j;
    // Process sale mutation
    var processSaleMutation = useMutation({
        mutationFn: function (saleData) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("/api/pos/sale", {
                            method: "POST",
                            headers: getAuthHeaders(),
                            body: JSON.stringify(saleData),
                        })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error("Failed to process sale");
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/products"] });
            clearCart();
            toast({
                title: "Sale Processed",
                description: "Transaction completed successfully.",
            });
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to process sale",
                variant: "destructive",
            });
        },
    });
    var addToCart = function (product, type) {
        var price = type === "new" ? parseFloat(product.newPrice) : parseFloat(product.swapPrice);
        var existingItem = cart.find(function (item) {
            return item.productId === product.id && item.type === type;
        });
        if (existingItem) {
            if (existingItem.quantity >= product.stock) {
                toast({
                    title: "Insufficient Stock",
                    description: "Only ".concat(product.stock, " units available."),
                    variant: "destructive",
                });
                return;
            }
            setCart(cart.map(function (item) {
                return item.productId === product.id && item.type === type
                    ? __assign(__assign({}, item), { quantity: item.quantity + 1, subtotal: (item.quantity + 1) * price }) : item;
            }));
        }
        else {
            var newItem = {
                productId: product.id,
                product: product,
                quantity: 1,
                type: type,
                subtotal: price,
            };
            setCart(__spreadArray(__spreadArray([], cart, true), [newItem], false));
        }
    };
    var updateQuantity = function (productId, type, newQuantity) {
        if (newQuantity <= 0) {
            removeFromCart(productId, type);
            return;
        }
        var product = products.find(function (p) { return p.id === productId; });
        if (!product)
            return;
        if (newQuantity > product.stock) {
            toast({
                title: "Insufficient Stock",
                description: "Only ".concat(product.stock, " units available."),
                variant: "destructive",
            });
            return;
        }
        var price = type === "new" ? parseFloat(product.newPrice) : parseFloat(product.swapPrice);
        setCart(cart.map(function (item) {
            return item.productId === productId && item.type === type
                ? __assign(__assign({}, item), { quantity: newQuantity, subtotal: newQuantity * price }) : item;
        }));
    };
    var removeFromCart = function (productId, type) {
        setCart(cart.filter(function (item) {
            return !(item.productId === productId && item.type === type);
        }));
    };
    var clearCart = function () {
        setCart([]);
        setSelectedCustomer(null);
        setAmountPaid("");
    };
    var calculateTotal = function () {
        return cart.reduce(function (total, item) { return total + item.subtotal; }, 0);
    };
    var calculateChange = function () {
        var total = calculateTotal();
        var paid = parseFloat(amountPaid) || 0;
        return Math.max(0, paid - total);
    };
    var canProcessSale = function () {
        var total = calculateTotal();
        var paid = parseFloat(amountPaid) || 0;
        return cart.length > 0 && (paymentMethod !== "cash" || paid >= total);
    };
    var handleProcessSale = function () { return __awaiter(_this, void 0, void 0, function () {
        var saleData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!canProcessSale())
                        return [2 /*return*/];
                    setIsProcessingPayment(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    saleData = {
                        customerId: selectedCustomer === null || selectedCustomer === void 0 ? void 0 : selectedCustomer.id,
                        items: cart.map(function (item) { return ({
                            productId: item.productId,
                            quantity: item.quantity,
                            type: item.type,
                            price: item.subtotal / item.quantity,
                        }); }),
                        totalAmount: calculateTotal(),
                        paymentMethod: paymentMethod,
                        amountPaid: paymentMethod === "cash" ? parseFloat(amountPaid) : calculateTotal(),
                        change: paymentMethod === "cash" ? calculateChange() : 0,
                    };
                    return [4 /*yield*/, processSaleMutation.mutateAsync(saleData)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    setIsProcessingPayment(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Point of Sale</h1>
          <p className="text-muted-foreground">Process in-store sales and manage inventory</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={clearCart} disabled={cart.length === 0}>
            <Trash2 className="h-4 w-4 mr-2"/>
            Clear Cart
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Products Grid */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2"/>
                Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              {productsLoading ? (<div className="grid md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(function (i) { return (<div key={i} className="border rounded-lg p-4 animate-pulse">
                      <div className="h-4 bg-muted rounded mb-3"></div>
                      <div className="h-3 bg-muted rounded mb-2 w-3/4"></div>
                      <div className="h-8 bg-muted rounded"></div>
                    </div>); })}
                </div>) : (<div className="grid md:grid-cols-2 gap-4">
                  {products.map(function (product) { return (<Card key={product.id} className="border-2 hover:border-primary transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold" data-testid={"text-product-name-".concat(product.id)}>
                              {product.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">{product.weight}</p>
                          </div>
                          <Badge variant={product.stock > 5 ? "default" : "destructive"}>
                            {product.stock} in stock
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>New Tank:</span>
                            <span className="font-medium">₱{product.newPrice}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Tank Swap:</span>
                            <span className="font-medium">₱{product.swapPrice}</span>
                          </div>
                        </div>

                        <div className="flex space-x-2 mt-4">
                          <Button size="sm" className="flex-1" onClick={function () { return addToCart(product, "new"); }} disabled={product.stock === 0} data-testid={"button-add-new-".concat(product.id)}>
                            <Plus className="h-4 w-4 mr-1"/>
                            New
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1" onClick={function () { return addToCart(product, "swap"); }} disabled={product.stock === 0} data-testid={"button-add-swap-".concat(product.id)}>
                            <Plus className="h-4 w-4 mr-1"/>
                            Swap
                          </Button>
                        </div>
                      </CardContent>
                    </Card>); })}
                </div>)}
            </CardContent>
          </Card>
        </div>

        {/* Cart and Checkout */}
        <div className="space-y-6">
          {/* Cart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2"/>
                  Cart ({cart.length})
                </div>
                <span className="text-lg font-bold" data-testid="text-cart-total">
                  ₱{calculateTotal().toFixed(2)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (<div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
                  <p className="text-muted-foreground">Cart is empty</p>
                  <p className="text-sm text-muted-foreground">Add products to start a sale</p>
                </div>) : (<div className="space-y-3">
                  {cart.map(function (item, index) { return (<div key={"".concat(item.productId, "-").concat(item.type)} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm" data-testid={"text-cart-item-".concat(index)}>
                          {item.product.name} ({item.type === "new" ? "New" : "Swap"})
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          ₱{(item.subtotal / item.quantity).toFixed(2)} each
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" onClick={function () { return updateQuantity(item.productId, item.type, item.quantity - 1); }} data-testid={"button-decrease-".concat(index)}>
                          <Minus className="h-3 w-3"/>
                        </Button>
                        <span className="w-8 text-center text-sm" data-testid={"text-quantity-".concat(index)}>
                          {item.quantity}
                        </span>
                        <Button size="sm" variant="outline" onClick={function () { return updateQuantity(item.productId, item.type, item.quantity + 1); }} data-testid={"button-increase-".concat(index)}>
                          <Plus className="h-3 w-3"/>
                        </Button>
                      </div>

                      <div className="text-right">
                        <p className="font-medium text-sm" data-testid={"text-subtotal-".concat(index)}>
                          ₱{item.subtotal.toFixed(2)}
                        </p>
                        <Button size="sm" variant="ghost" onClick={function () { return removeFromCart(item.productId, item.type); }} data-testid={"button-remove-".concat(index)}>
                          <Trash2 className="h-3 w-3"/>
                        </Button>
                      </div>
                    </div>); })}
                </div>)}
            </CardContent>
          </Card>

          {/* Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2"/>
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedCustomer ? (<div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium" data-testid="text-selected-customer">
                      {selectedCustomer.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedCustomer.email}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={function () { return setSelectedCustomer(null); }}>
                    Remove
                  </Button>
                </div>) : (<Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full" data-testid="button-select-customer">
                      <User className="h-4 w-4 mr-2"/>
                      Select Customer (Optional)
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Select Customer</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {customers.map(function (customer) { return (<div key={customer.id} className="p-3 border rounded-lg cursor-pointer hover:bg-accent" onClick={function () {
                    setSelectedCustomer(customer);
                    setIsCustomerDialogOpen(false);
                }}>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">{customer.email}</p>
                        </div>); })}
                    </div>
                  </DialogContent>
                </Dialog>)}
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2"/>
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="payment-method">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={function (value) { return setPaymentMethod(value); }}>
                  <SelectTrigger data-testid="select-payment-method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="gcash">GCash</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentMethod === "cash" && (<div>
                  <Label htmlFor="amount-paid">Amount Paid</Label>
                  <Input id="amount-paid" type="number" placeholder="0.00" value={amountPaid} onChange={function (e) { return setAmountPaid(e.target.value); }} data-testid="input-amount-paid"/>
                  {amountPaid && (<p className="text-sm text-muted-foreground mt-1">
                      Change: ₱{calculateChange().toFixed(2)}
                    </p>)}
                </div>)}

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold" data-testid="text-final-total">
                    ₱{calculateTotal().toFixed(2)}
                  </span>
                </div>
                
                <Button className="w-full" size="lg" disabled={!canProcessSale() || isProcessingPayment} onClick={handleProcessSale} data-testid="button-process-sale">
                  {isProcessingPayment ? ("Processing...") : (<>
                      <Receipt className="h-4 w-4 mr-2"/>
                      Process Sale
                    </>)}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>);
}
