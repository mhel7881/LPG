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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Filter, Package, ShoppingCart, Info } from "lucide-react";
export default function CustomerProducts() {
    var _this = this;
    var _a = useState(""), searchTerm = _a[0], setSearchTerm = _a[1];
    var _b = useState("name"), sortBy = _b[0], setSortBy = _b[1];
    var _c = useCart(), addItem = _c.addItem, cartLoading = _c.isLoading;
    var toast = useToast().toast;
    var _d = useQuery({
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
    }), _e = _d.data, products = _e === void 0 ? [] : _e, isLoading = _d.isLoading;
    var filteredProducts = products
        .filter(function (product) {
        var _a;
        return product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ((_a = product.description) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchTerm.toLowerCase()));
    })
        .sort(function (a, b) {
        switch (sortBy) {
            case "price-low":
                return parseFloat(a.swapPrice) - parseFloat(b.swapPrice);
            case "price-high":
                return parseFloat(b.swapPrice) - parseFloat(a.swapPrice);
            case "weight":
                return parseFloat(a.weight) - parseFloat(b.weight);
            default:
                return a.name.localeCompare(b.name);
        }
    });
    var handleAddToCart = function (productId, type) { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, addItem(productId, type, 1)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error("Failed to add item to cart:", error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var getStockStatus = function (stock) {
        if (stock === 0)
            return { label: "Out of Stock", class: "bg-red-100 text-red-800" };
        if (stock <= 5)
            return { label: "Low Stock", class: "bg-yellow-100 text-yellow-800" };
        return { label: "In Stock", class: "bg-green-100 text-green-800" };
    };
    return (<div className="container mx-auto px-4 py-6 space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">LPG Products</h1>
          <p className="text-muted-foreground">Choose from our premium LPG tanks</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
          <Input placeholder="Search products..." value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }} className="pl-10" data-testid="input-search-products"/>
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-48" data-testid="select-sort-products">
            <Filter className="h-4 w-4 mr-2"/>
            <SelectValue placeholder="Sort by"/>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="price-low">Price (Low to High)</SelectItem>
            <SelectItem value="price-high">Price (High to Low)</SelectItem>
            <SelectItem value="weight">Weight</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      {isLoading ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map(function (_, i) { return (<Card key={i} className="overflow-hidden">
              <div className="w-full h-48 bg-muted animate-pulse"></div>
              <CardContent className="p-4 space-y-3">
                <div className="h-4 bg-muted rounded animate-pulse"></div>
                <div className="h-3 bg-muted rounded animate-pulse w-3/4"></div>
                <div className="h-8 bg-muted rounded animate-pulse"></div>
              </CardContent>
            </Card>); })}
        </div>) : (<motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          {filteredProducts.map(function (product, index) {
                var stockStatus = getStockStatus(product.stock);
                return (<motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  {/* Product Image */}
                  <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    {product.image ? (<img src={product.image} alt={product.name} className="w-full h-full object-cover"/>) : (<img src="/solane-tank.png" alt={product.name} className="w-full h-full object-contain p-4"/>)}
                  </div>
                  
                  <CardContent className="p-4">
                    {/* Product Header */}
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-foreground" data-testid={"text-product-name-".concat(product.id)}>
                        {product.name}
                      </h3>
                      <Badge className={stockStatus.class} data-testid={"badge-stock-status-".concat(product.id)}>
                        {stockStatus.label}
                      </Badge>
                    </div>
                    
                    {/* Product Description */}
                    <p className="text-muted-foreground text-sm mb-3" data-testid={"text-product-description-".concat(product.id)}>
                      {product.description}
                    </p>
                    
                    {/* Pricing */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">New:</span>
                          <span className="font-semibold text-foreground" data-testid={"text-new-price-".concat(product.id)}>
                            ₱{product.newPrice}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">Swap:</span>
                          <span className="font-semibold text-primary" data-testid={"text-swap-price-".concat(product.id)}>
                            ₱{product.swapPrice}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Weight</div>
                        <div className="font-medium text-foreground" data-testid={"text-product-weight-".concat(product.id)}>
                          {product.weight}
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <Button className="flex-1" onClick={function () { return handleAddToCart(product.id, "new"); }} disabled={product.stock === 0 || cartLoading} data-testid={"button-add-new-".concat(product.id)}>
                          <Plus className="h-4 w-4 mr-1"/>
                          Add New (₱{product.newPrice})
                        </Button>
                        <Button variant="outline" size="icon" data-testid={"button-product-info-".concat(product.id)}>
                          <Info className="h-4 w-4"/>
                        </Button>
                      </div>
                      
                      <Button variant="outline" className="w-full" onClick={function () { return handleAddToCart(product.id, "swap"); }} disabled={product.stock === 0 || cartLoading} data-testid={"button-add-swap-".concat(product.id)}>
                        <ShoppingCart className="h-4 w-4 mr-2"/>
                        Add Swap (₱{product.swapPrice})
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>);
            })}
        </motion.div>)}

      {/* Empty State */}
      {!isLoading && filteredProducts.length === 0 && (<Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
            <h3 className="font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Try adjusting your search terms" : "No products are currently available"}
            </p>
          </CardContent>
        </Card>)}
    </div>);
}
