var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, desc, and, or, count, sum, sql as drizzleSql, gt } from "drizzle-orm";
import { users, addresses, products, orders, cartItems, chatMessages, notifications, deliverySchedules } from "@shared/schema";
import bcrypt from "bcrypt";
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set");
}
var sql = postgres(process.env.DATABASE_URL);
var db = drizzle(sql);
var DrizzleStorage = /** @class */ (function () {
    function DrizzleStorage() {
    }
    DrizzleStorage.prototype.getUserById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(users).where(eq(users.id, id)).limit(1)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DrizzleStorage.prototype.getUserByEmail = function (email) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(users).where(eq(users.email, email)).limit(1)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DrizzleStorage.prototype.getAllUsers = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(users).orderBy(desc(users.createdAt))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DrizzleStorage.prototype.createUser = function (user) {
        return __awaiter(this, void 0, void 0, function () {
            var hashedPassword, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, bcrypt.hash(user.password, 10)];
                    case 1:
                        hashedPassword = _a.sent();
                        return [4 /*yield*/, db.insert(users).values(__assign(__assign({}, user), { password: hashedPassword })).returning()];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DrizzleStorage.prototype.updateUser = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!updates.password) return [3 /*break*/, 2];
                        _a = updates;
                        return [4 /*yield*/, bcrypt.hash(updates.password, 10)];
                    case 1:
                        _a.password = _b.sent();
                        _b.label = 2;
                    case 2: return [4 /*yield*/, db.update(users).set(__assign(__assign({}, updates), { updatedAt: new Date() })).where(eq(users.id, id)).returning()];
                    case 3:
                        result = _b.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DrizzleStorage.prototype.validateUser = function (email, password) {
        return __awaiter(this, void 0, void 0, function () {
            var user, isValid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getUserByEmail(email)];
                    case 1:
                        user = _a.sent();
                        if (!user)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, bcrypt.compare(password, user.password)];
                    case 2:
                        isValid = _a.sent();
                        return [2 /*return*/, isValid ? user : null];
                }
            });
        });
    };
    DrizzleStorage.prototype.getUserAddresses = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(addresses).where(eq(addresses.userId, userId))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DrizzleStorage.prototype.createAddress = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.insert(addresses).values(address).returning()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DrizzleStorage.prototype.updateAddress = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.update(addresses).set(updates).where(eq(addresses.id, id)).returning()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DrizzleStorage.prototype.deleteAddress = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.delete(addresses).where(eq(addresses.id, id)).returning()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.length > 0];
                }
            });
        });
    };
    DrizzleStorage.prototype.getAllAddressesWithUsers = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select({
                            id: addresses.id,
                            label: addresses.label,
                            street: addresses.street,
                            city: addresses.city,
                            province: addresses.province,
                            zipCode: addresses.zipCode,
                            coordinates: addresses.coordinates,
                            isDefault: addresses.isDefault,
                            user: {
                                id: users.id,
                                name: users.name,
                                email: users.email,
                                phone: users.phone,
                            }
                        })
                            .from(addresses)
                            .innerJoin(users, eq(addresses.userId, users.id))];
                    case 1:
                        result = _a.sent();
                        // Filter out null coordinates in memory for now
                        return [2 /*return*/, result.filter(function (addr) { return addr.coordinates != null; })];
                }
            });
        });
    };
    DrizzleStorage.prototype.getProducts = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(products).where(eq(products.isActive, true))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DrizzleStorage.prototype.getProduct = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(products).where(eq(products.id, id)).limit(1)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DrizzleStorage.prototype.getProductById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(products).where(eq(products.id, id)).limit(1)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DrizzleStorage.prototype.createProduct = function (product) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.insert(products).values(product).returning()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DrizzleStorage.prototype.updateProduct = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.update(products).set(__assign(__assign({}, updates), { updatedAt: new Date() })).where(eq(products.id, id)).returning()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DrizzleStorage.prototype.updateProductStock = function (id, stock) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.update(products).set({
                            stock: stock,
                            updatedAt: new Date(),
                        }).where(eq(products.id, id)).returning()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DrizzleStorage.prototype.getOrders = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(orders).orderBy(desc(orders.createdAt))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DrizzleStorage.prototype.getOrdersByCustomer = function (customerId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(orders)
                            .where(eq(orders.customerId, customerId))
                            .orderBy(desc(orders.createdAt))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DrizzleStorage.prototype.getOrderById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(orders).where(eq(orders.id, id)).limit(1)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DrizzleStorage.prototype.createOrder = function (order) {
        return __awaiter(this, void 0, void 0, function () {
            var orderNumber, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        orderNumber = "GF-".concat(new Date().getFullYear(), "-").concat(String(Date.now()).slice(-6));
                        return [4 /*yield*/, db.insert(orders).values(__assign(__assign({}, order), { orderNumber: orderNumber })).returning()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DrizzleStorage.prototype.updateOrderStatus = function (id, status) {
        return __awaiter(this, void 0, void 0, function () {
            var updates, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updates = { status: status, updatedAt: new Date() };
                        if (status === 'delivered') {
                            updates.deliveredAt = new Date();
                        }
                        return [4 /*yield*/, db.update(orders).set(updates).where(eq(orders.id, id)).returning()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DrizzleStorage.prototype.getOrdersWithLocationData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select({
                            id: orders.id,
                            orderNumber: orders.orderNumber,
                            status: orders.status,
                            createdAt: orders.createdAt,
                            customer: {
                                id: users.id,
                                name: users.name,
                                email: users.email,
                                phone: users.phone,
                            },
                            address: {
                                id: addresses.id,
                                street: addresses.street,
                                city: addresses.city,
                                province: addresses.province,
                                zipCode: addresses.zipCode,
                                coordinates: addresses.coordinates,
                            }
                        })
                            .from(orders)
                            .innerJoin(users, eq(orders.customerId, users.id))
                            .leftJoin(addresses, eq(orders.addressId, addresses.id))
                            .orderBy(desc(orders.createdAt))];
                    case 1:
                        result = _a.sent();
                        // Filter in memory for active orders with coordinates
                        return [2 /*return*/, result.filter(function (order) {
                                var _a;
                                return ((_a = order.address) === null || _a === void 0 ? void 0 : _a.coordinates) != null &&
                                    ['pending', 'processing', 'out_for_delivery'].includes(order.status);
                            })];
                }
            });
        });
    };
    DrizzleStorage.prototype.getCartItems = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(cartItems).where(eq(cartItems.userId, userId))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DrizzleStorage.prototype.addCartItem = function (item) {
        return __awaiter(this, void 0, void 0, function () {
            var existing, result, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(cartItems)
                            .where(and(eq(cartItems.userId, item.userId), eq(cartItems.productId, item.productId), eq(cartItems.type, item.type))).limit(1)];
                    case 1:
                        existing = _a.sent();
                        if (!(existing.length > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, db.update(cartItems)
                                .set({ quantity: (existing[0].quantity || 0) + (item.quantity || 1) })
                                .where(eq(cartItems.id, existing[0].id))
                                .returning()];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                    case 3: return [4 /*yield*/, db.insert(cartItems).values(item).returning()];
                    case 4:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DrizzleStorage.prototype.updateCartItem = function (id, quantity) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.update(cartItems)
                            .set({ quantity: quantity })
                            .where(eq(cartItems.id, id))
                            .returning()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DrizzleStorage.prototype.removeCartItem = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.delete(cartItems).where(eq(cartItems.id, id)).returning()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.length > 0];
                }
            });
        });
    };
    DrizzleStorage.prototype.clearCart = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.delete(cartItems).where(eq(cartItems.userId, userId)).returning()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.length > 0];
                }
            });
        });
    };
    DrizzleStorage.prototype.getChatMessages = function (userId, orderId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!orderId) return [3 /*break*/, 2];
                        return [4 /*yield*/, db.select().from(chatMessages)
                                .where(and(eq(chatMessages.orderId, orderId), eq(chatMessages.isDeleted, false)))
                                .orderBy(chatMessages.createdAt)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2: return [4 /*yield*/, db.select().from(chatMessages)
                            .where(and(or(eq(chatMessages.senderId, userId), eq(chatMessages.receiverId, userId)), eq(chatMessages.isDeleted, false)))
                            .orderBy(chatMessages.createdAt)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DrizzleStorage.prototype.createChatMessage = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.insert(chatMessages).values(message).returning()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DrizzleStorage.prototype.updateChatMessage = function (messageId, userId, newMessage) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.update(chatMessages)
                            .set({
                            message: newMessage,
                            isEdited: true,
                            editedAt: new Date()
                        })
                            .where(and(eq(chatMessages.id, messageId), eq(chatMessages.senderId, userId), // Only sender can edit their own messages
                        eq(chatMessages.isDeleted, false)))
                            .returning()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.length > 0 ? result[0] : null];
                }
            });
        });
    };
    DrizzleStorage.prototype.deleteChatMessage = function (messageId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.update(chatMessages)
                            .set({
                            isDeleted: true,
                            deletedAt: new Date()
                        })
                            .where(and(eq(chatMessages.id, messageId), eq(chatMessages.senderId, userId), // Only sender can delete their own messages
                        eq(chatMessages.isDeleted, false)))
                            .returning()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.length > 0];
                }
            });
        });
    };
    DrizzleStorage.prototype.unsendChatMessage = function (messageId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.delete(chatMessages)
                            .where(and(eq(chatMessages.id, messageId), eq(chatMessages.senderId, userId) // Only sender can unsend their own messages
                        ))
                            .returning()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.length > 0];
                }
            });
        });
    };
    DrizzleStorage.prototype.markMessagesAsRead = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.update(chatMessages)
                            .set({ isRead: true })
                            .where(eq(chatMessages.receiverId, userId))
                            .returning()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.length > 0];
                }
            });
        });
    };
    // Get list of customers who have sent messages to admin
    DrizzleStorage.prototype.getChatCustomers = function () {
        return __awaiter(this, void 0, void 0, function () {
            var latestMessages, result, _i, latestMessages_1, item, customerMessages, unreadCount;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db
                            .select({
                            customerId: chatMessages.senderId,
                            maxTime: drizzleSql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["max(", ")"], ["max(", ")"])), chatMessages.createdAt).as('max_time')
                        })
                            .from(chatMessages)
                            .innerJoin(users, eq(chatMessages.senderId, users.id))
                            .where(and(eq(users.role, 'customer'), eq(chatMessages.isDeleted, false)))
                            .groupBy(chatMessages.senderId)];
                    case 1:
                        latestMessages = _b.sent();
                        result = [];
                        _i = 0, latestMessages_1 = latestMessages;
                        _b.label = 2;
                    case 2:
                        if (!(_i < latestMessages_1.length)) return [3 /*break*/, 6];
                        item = latestMessages_1[_i];
                        return [4 /*yield*/, db.select({
                                customerId: chatMessages.senderId,
                                customer: {
                                    id: users.id,
                                    name: users.name,
                                    email: users.email,
                                    avatar: users.avatar,
                                },
                                lastMessage: chatMessages.message,
                                lastMessageTime: chatMessages.createdAt,
                            })
                                .from(chatMessages)
                                .innerJoin(users, eq(chatMessages.senderId, users.id))
                                .where(and(eq(chatMessages.senderId, item.customerId), drizzleSql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["", " = ", "::timestamp"], ["", " = ", "::timestamp"])), chatMessages.createdAt, item.maxTime), eq(chatMessages.isDeleted, false)))
                                .limit(1)];
                    case 3:
                        customerMessages = _b.sent();
                        if (!(customerMessages.length > 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, db.select({
                                count: drizzleSql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["count(*)"], ["count(*)"]))).as('count')
                            })
                                .from(chatMessages)
                                .where(and(eq(chatMessages.senderId, item.customerId), eq(chatMessages.isRead, false), eq(chatMessages.isDeleted, false)))];
                    case 4:
                        unreadCount = _b.sent();
                        result.push(__assign(__assign({}, customerMessages[0]), { unreadCount: ((_a = unreadCount[0]) === null || _a === void 0 ? void 0 : _a.count) || 0 }));
                        _b.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 2];
                    case 6: return [2 /*return*/, result.sort(function (a, b) { return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime(); })];
                }
            });
        });
    };
    // Get messages for a specific conversation between admin and customer
    DrizzleStorage.prototype.getConversationMessages = function (customerId, adminId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select({
                            id: chatMessages.id,
                            senderId: chatMessages.senderId,
                            receiverId: chatMessages.receiverId,
                            orderId: chatMessages.orderId,
                            message: chatMessages.message,
                            type: chatMessages.type,
                            isRead: chatMessages.isRead,
                            isEdited: chatMessages.isEdited,
                            isDeleted: chatMessages.isDeleted,
                            editedAt: chatMessages.editedAt,
                            deletedAt: chatMessages.deletedAt,
                            createdAt: chatMessages.createdAt,
                            sender: {
                                id: users.id,
                                name: users.name,
                                role: users.role,
                            }
                        })
                            .from(chatMessages)
                            .innerJoin(users, eq(chatMessages.senderId, users.id))
                            .where(and(or(and(eq(chatMessages.senderId, customerId), eq(chatMessages.receiverId, adminId)), and(eq(chatMessages.senderId, adminId), eq(chatMessages.receiverId, customerId))), eq(chatMessages.isDeleted, false)))
                            .orderBy(chatMessages.createdAt)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DrizzleStorage.prototype.getUserNotifications = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(notifications)
                            .where(eq(notifications.userId, userId))
                            .orderBy(desc(notifications.createdAt))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DrizzleStorage.prototype.createNotification = function (notification) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.insert(notifications).values(notification).returning()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DrizzleStorage.prototype.markNotificationAsRead = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.update(notifications)
                            .set({ isRead: true })
                            .where(eq(notifications.id, id))
                            .returning()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.length > 0];
                }
            });
        });
    };
    DrizzleStorage.prototype.getDashboardStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var today, salesResult, pendingResult, customersResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return [4 /*yield*/, db.select({
                                totalSales: sum(orders.totalAmount),
                                totalOrders: count(orders.id),
                            }).from(orders).where(eq(orders.status, 'delivered'))];
                    case 1:
                        salesResult = (_a.sent())[0];
                        return [4 /*yield*/, db.select({
                                pendingOrders: count(orders.id),
                            }).from(orders).where(eq(orders.status, 'pending'))];
                    case 2:
                        pendingResult = (_a.sent())[0];
                        return [4 /*yield*/, db.select({
                                activeCustomers: count(users.id),
                            }).from(users).where(eq(users.role, 'customer'))];
                    case 3:
                        customersResult = (_a.sent())[0];
                        return [2 /*return*/, {
                                totalSales: Number(salesResult.totalSales) || 0,
                                totalOrders: Number(salesResult.totalOrders) || 0,
                                pendingOrders: Number(pendingResult.pendingOrders) || 0,
                                activeCustomers: Number(customersResult.activeCustomers) || 0,
                            }];
                }
            });
        });
    };
    DrizzleStorage.prototype.getOrderDetailsForReceipt = function (orderId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select({
                            order: {
                                id: orders.id,
                                orderNumber: orders.orderNumber,
                                createdAt: orders.createdAt,
                                deliveredAt: orders.deliveredAt,
                                quantity: orders.quantity,
                                type: orders.type,
                                unitPrice: orders.unitPrice,
                                totalAmount: orders.totalAmount,
                                paymentMethod: orders.paymentMethod,
                                paymentStatus: orders.paymentStatus,
                                status: orders.status,
                                notes: orders.notes,
                            },
                            product: {
                                name: products.name,
                                weight: products.weight,
                            },
                            customer: {
                                name: users.name,
                                email: users.email,
                                phone: users.phone,
                            },
                            address: {
                                street: addresses.street,
                                city: addresses.city,
                                province: addresses.province,
                                zipCode: addresses.zipCode,
                            }
                        })
                            .from(orders)
                            .innerJoin(users, eq(orders.customerId, users.id))
                            .leftJoin(products, eq(orders.productId, products.id))
                            .leftJoin(addresses, eq(orders.addressId, addresses.id))
                            .where(and(eq(orders.id, orderId), eq(orders.customerId, userId) // Ensure user can only access their own orders
                        ))
                            .limit(1)];
                    case 1:
                        result = _a.sent();
                        if (result.length === 0) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    // Delivery Schedules
    DrizzleStorage.prototype.getDeliverySchedules = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(deliverySchedules)
                            .where(eq(deliverySchedules.userId, userId))
                            .orderBy(desc(deliverySchedules.createdAt))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DrizzleStorage.prototype.getAllDeliverySchedules = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(deliverySchedules)
                            .orderBy(desc(deliverySchedules.nextDelivery))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DrizzleStorage.prototype.getDeliveryScheduleById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(deliverySchedules)
                            .where(eq(deliverySchedules.id, id))
                            .limit(1)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DrizzleStorage.prototype.createDeliverySchedule = function (schedule) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.insert(deliverySchedules)
                            .values(schedule)
                            .returning()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DrizzleStorage.prototype.updateDeliverySchedule = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.update(deliverySchedules)
                            .set(__assign(__assign({}, updates), { updatedAt: new Date() }))
                            .where(eq(deliverySchedules.id, id))
                            .returning()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DrizzleStorage.prototype.deleteDeliverySchedule = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.delete(deliverySchedules)
                            .where(eq(deliverySchedules.id, id))
                            .returning()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.length > 0];
                }
            });
        });
    };
    DrizzleStorage.prototype.updateUserEmailVerification = function (id, verified) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.update(users)
                            .set({
                            emailVerified: verified,
                            emailVerificationToken: null,
                            emailVerificationExpires: null,
                            updatedAt: new Date(),
                        })
                            .where(eq(users.id, id))
                            .returning()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DrizzleStorage.prototype.setEmailVerificationToken = function (id, token, expires) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.update(users)
                            .set({
                            emailVerificationToken: token,
                            emailVerificationExpires: expires,
                            updatedAt: new Date(),
                        })
                            .where(eq(users.id, id))
                            .returning()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DrizzleStorage.prototype.getUserByVerificationToken = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select()
                            .from(users)
                            .where(and(eq(users.emailVerificationToken, token), gt(users.emailVerificationExpires, new Date())))
                            .limit(1)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DrizzleStorage.prototype.clearEmailVerificationToken = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.update(users)
                            .set({
                            emailVerificationToken: null,
                            emailVerificationExpires: null,
                            updatedAt: new Date(),
                        })
                            .where(eq(users.id, id))
                            .returning()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    DrizzleStorage.prototype.seedData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var testResult, adminResult, adminUser, error_1, customerExists, customerUser, existingProducts;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, db.select().from(users).limit(1)];
                    case 1:
                        testResult = _a.sent();
                        console.log('Database connection test:', testResult.length, 'users found');
                        return [4 /*yield*/, db.select().from(users).where(eq(users.email, 'admin@gasflow.com')).limit(1)];
                    case 2:
                        adminResult = _a.sent();
                        if (!(adminResult.length === 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.createUser({
                                email: 'admin@gasflow.com',
                                password: 'admin123',
                                name: 'Admin User',
                                role: 'admin',
                                phone: '+63 912 345 6789',
                            })];
                    case 3:
                        adminUser = _a.sent();
                        // Mark admin as email verified
                        return [4 /*yield*/, this.updateUserEmailVerification(adminUser.id, true)];
                    case 4:
                        // Mark admin as email verified
                        _a.sent();
                        console.log('Admin user created and verified');
                        return [3 /*break*/, 6];
                    case 5:
                        console.log('Admin user already exists');
                        _a.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        error_1 = _a.sent();
                        console.error('Database connection or seeding error:', error_1);
                        // Don't throw error, let app continue running
                        return [2 /*return*/];
                    case 8: return [4 /*yield*/, this.getUserByEmail('customer@demo.com')];
                    case 9:
                        customerExists = _a.sent();
                        if (!!customerExists) return [3 /*break*/, 12];
                        return [4 /*yield*/, this.createUser({
                                email: 'customer@demo.com',
                                password: 'demo123',
                                name: 'John Doe',
                                role: 'customer',
                                phone: '+63 917 123 4567',
                            })];
                    case 10:
                        customerUser = _a.sent();
                        // Mark customer as email verified
                        return [4 /*yield*/, this.updateUserEmailVerification(customerUser.id, true)];
                    case 11:
                        // Mark customer as email verified
                        _a.sent();
                        _a.label = 12;
                    case 12: return [4 /*yield*/, this.getProducts()];
                    case 13:
                        existingProducts = _a.sent();
                        if (!(existingProducts.length === 0)) return [3 /*break*/, 17];
                        return [4 /*yield*/, this.createProduct({
                                name: '7kg LPG Tank',
                                description: 'Compact tank ideal for small families',
                                weight: '7kg',
                                newPrice: '950.00',
                                swapPrice: '650.00',
                                stock: 8,
                                isActive: true,
                            })];
                    case 14:
                        _a.sent();
                        return [4 /*yield*/, this.createProduct({
                                name: '11kg LPG Tank',
                                description: 'Premium quality LPG tank perfect for home cooking',
                                weight: '11kg',
                                newPrice: '1200.00',
                                swapPrice: '900.00',
                                stock: 45,
                                isActive: true,
                            })];
                    case 15:
                        _a.sent();
                        return [4 /*yield*/, this.createProduct({
                                name: '22kg LPG Tank',
                                description: 'Heavy-duty tank for commercial use',
                                weight: '22kg',
                                newPrice: '2400.00',
                                swapPrice: '1800.00',
                                stock: 2,
                                isActive: true,
                            })];
                    case 16:
                        _a.sent();
                        _a.label = 17;
                    case 17: return [2 /*return*/];
                }
            });
        });
    };
    return DrizzleStorage;
}());
export { DrizzleStorage };
export var storage = new DrizzleStorage();
var templateObject_1, templateObject_2, templateObject_3;
