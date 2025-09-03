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
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { saveToIndexedDB, getFromIndexedDB } from "@/lib/indexeddb";
var CartContext = createContext(undefined);
export function CartProvider(_a) {
    var _this = this;
    var children = _a.children;
    var _b = useState([]), items = _b[0], setItems = _b[1];
    var _c = useState(false), isLoading = _c[0], setIsLoading = _c[1];
    var _d = useAuth(), user = _d.user, token = _d.token;
    var toast = useToast().toast;
    // Load cart from IndexedDB on mount
    useEffect(function () {
        if (user) {
            loadCartFromIndexedDB();
        }
    }, [user]);
    // Sync with server when online
    useEffect(function () {
        if (user && token && navigator.onLine) {
            syncWithServer();
        }
    }, [user, token]);
    var loadCartFromIndexedDB = function () { return __awaiter(_this, void 0, void 0, function () {
        var cartData, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!user)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, getFromIndexedDB("cart", user.id)];
                case 2:
                    cartData = _a.sent();
                    if (cartData) {
                        setItems(cartData.items || []);
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error("Failed to load cart from IndexedDB:", error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var saveCartToIndexedDB = function (cartItems) { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!user)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, saveToIndexedDB("cart", user.id, { items: cartItems, updatedAt: new Date() })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error("Failed to save cart to IndexedDB:", error_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var syncWithServer = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, serverItems, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!user || !token)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, fetch("/api/cart", {
                            headers: {
                                Authorization: "Bearer ".concat(token),
                            },
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 5];
                    return [4 /*yield*/, response.json()];
                case 3:
                    serverItems = _a.sent();
                    setItems(serverItems);
                    return [4 /*yield*/, saveCartToIndexedDB(serverItems)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_3 = _a.sent();
                    console.error("Failed to sync cart with server:", error_3);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var addItem = function (productId_1, type_1) {
        var args_1 = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args_1[_i - 2] = arguments[_i];
        }
        return __awaiter(_this, __spreadArray([productId_1, type_1], args_1, true), void 0, function (productId, type, quantity) {
            var tempItem, newItems, response, actualItem_1, error_4;
            if (quantity === void 0) { quantity = 1; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!user)
                            return [2 /*return*/];
                        setIsLoading(true);
                        tempItem = {
                            id: "temp-".concat(Date.now()),
                            productId: productId,
                            quantity: quantity,
                            type: type,
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, 7, 8]);
                        newItems = __spreadArray(__spreadArray([], items, true), [tempItem], false);
                        setItems(newItems);
                        return [4 /*yield*/, saveCartToIndexedDB(newItems)];
                    case 2:
                        _a.sent();
                        if (!(navigator.onLine && token)) return [3 /*break*/, 5];
                        return [4 /*yield*/, apiRequest("POST", "/api/cart", {
                                productId: productId,
                                quantity: quantity,
                                type: type,
                            })];
                    case 3:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 4:
                        actualItem_1 = _a.sent();
                        // Replace temp item with actual item
                        setItems(function (prev) { return prev.map(function (item) {
                            return item.id === tempItem.id ? actualItem_1 : item;
                        }); });
                        _a.label = 5;
                    case 5:
                        toast({
                            title: "Added to Cart",
                            description: "Item has been added to your cart.",
                        });
                        return [3 /*break*/, 8];
                    case 6:
                        error_4 = _a.sent();
                        // Revert optimistic update
                        setItems(function (prev) { return prev.filter(function (item) { return item.id !== tempItem.id; }); });
                        toast({
                            title: "Error",
                            description: error_4.message || "Failed to add item to cart",
                            variant: "destructive",
                        });
                        return [3 /*break*/, 8];
                    case 7:
                        setIsLoading(false);
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    var updateItem = function (id, quantity) { return __awaiter(_this, void 0, void 0, function () {
        var newItems, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!user)
                        return [2 /*return*/];
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 7, 8]);
                    newItems = items.map(function (item) {
                        return item.id === id ? __assign(__assign({}, item), { quantity: quantity }) : item;
                    });
                    setItems(newItems);
                    return [4 /*yield*/, saveCartToIndexedDB(newItems)];
                case 2:
                    _a.sent();
                    if (!(navigator.onLine && token)) return [3 /*break*/, 4];
                    return [4 /*yield*/, apiRequest("PUT", "/api/cart/".concat(id), { quantity: quantity })];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [3 /*break*/, 8];
                case 5:
                    error_5 = _a.sent();
                    // Revert optimistic update
                    return [4 /*yield*/, loadCartFromIndexedDB()];
                case 6:
                    // Revert optimistic update
                    _a.sent();
                    toast({
                        title: "Error",
                        description: error_5.message || "Failed to update cart item",
                        variant: "destructive",
                    });
                    return [3 /*break*/, 8];
                case 7:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    var removeItem = function (id) { return __awaiter(_this, void 0, void 0, function () {
        var newItems, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!user)
                        return [2 /*return*/];
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 7, 8]);
                    newItems = items.filter(function (item) { return item.id !== id; });
                    setItems(newItems);
                    return [4 /*yield*/, saveCartToIndexedDB(newItems)];
                case 2:
                    _a.sent();
                    if (!(navigator.onLine && token)) return [3 /*break*/, 4];
                    return [4 /*yield*/, apiRequest("DELETE", "/api/cart/".concat(id), {})];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    toast({
                        title: "Item Removed",
                        description: "Item has been removed from your cart.",
                    });
                    return [3 /*break*/, 8];
                case 5:
                    error_6 = _a.sent();
                    // Revert optimistic update
                    return [4 /*yield*/, loadCartFromIndexedDB()];
                case 6:
                    // Revert optimistic update
                    _a.sent();
                    toast({
                        title: "Error",
                        description: error_6.message || "Failed to remove cart item",
                        variant: "destructive",
                    });
                    return [3 /*break*/, 8];
                case 7:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    var clearCart = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!user)
                        return [2 /*return*/];
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 7]);
                    setItems([]);
                    return [4 /*yield*/, saveCartToIndexedDB([])];
                case 2:
                    _a.sent();
                    if (!(navigator.onLine && token)) return [3 /*break*/, 4];
                    return [4 /*yield*/, apiRequest("DELETE", "/api/cart", {})];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    toast({
                        title: "Cart Cleared",
                        description: "All items have been removed from your cart.",
                    });
                    return [3 /*break*/, 7];
                case 5:
                    error_7 = _a.sent();
                    toast({
                        title: "Error",
                        description: error_7.message || "Failed to clear cart",
                        variant: "destructive",
                    });
                    return [3 /*break*/, 7];
                case 6:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    return (<CartContext.Provider value={{
            items: items,
            addItem: addItem,
            updateItem: updateItem,
            removeItem: removeItem,
            clearCart: clearCart,
            isLoading: isLoading,
            syncWithServer: syncWithServer,
        }}>
      {children}
    </CartContext.Provider>);
}
export function useCart() {
    var context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
