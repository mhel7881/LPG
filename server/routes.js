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
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { emailService } from "./email-service";
import { loginSchema, insertUserSchema, insertOrderSchema, insertAddressSchema, insertProductSchema } from "@shared/schema";
import { generalLimiter, authLimiter, posLimiter, securityHeaders, sanitizeInput, requestLogger } from "./middleware/security";
var JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
// Middleware to verify JWT
var authenticateToken = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var authHeader, token, decoded, user, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                authHeader = req.headers.authorization;
                token = authHeader && authHeader.split(' ')[1];
                if (!token) {
                    return [2 /*return*/, res.status(401).json({ message: 'Access token required' })];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                decoded = jwt.verify(token, JWT_SECRET);
                return [4 /*yield*/, storage.getUserById(decoded.userId)];
            case 2:
                user = _a.sent();
                if (!user) {
                    return [2 /*return*/, res.status(401).json({ message: 'Invalid token' })];
                }
                req.user = user;
                next();
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                return [2 /*return*/, res.status(403).json({ message: 'Invalid token' })];
            case 4: return [2 /*return*/];
        }
    });
}); };
// Middleware to check admin role
var requireAdmin = function (req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};
export function registerRoutes(app) {
    return __awaiter(this, void 0, void 0, function () {
        var httpServer, wss, clients, error_2;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    httpServer = createServer(app);
                    // Apply security middleware
                    app.use(securityHeaders);
                    app.use(sanitizeInput);
                    app.use(requestLogger);
                    app.use(generalLimiter);
                    wss = new WebSocketServer({ server: httpServer, path: '/ws' });
                    clients = new Map();
                    wss.on('connection', function (ws, req) {
                        console.log('WebSocket connection established');
                        ws.on('message', function (data) { return __awaiter(_this, void 0, void 0, function () {
                            var message, token, decoded, user, error_3, chatMessage, receiverWs, order, customerWs, error_4;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 9, , 10]);
                                        message = JSON.parse(data.toString());
                                        if (!(message.type === 'auth')) return [3 /*break*/, 4];
                                        token = message.token;
                                        _a.label = 1;
                                    case 1:
                                        _a.trys.push([1, 3, , 4]);
                                        decoded = jwt.verify(token, JWT_SECRET);
                                        return [4 /*yield*/, storage.getUserById(decoded.userId)];
                                    case 2:
                                        user = _a.sent();
                                        if (user) {
                                            clients.set(user.id, ws);
                                            ws.send(JSON.stringify({ type: 'auth_success', userId: user.id }));
                                        }
                                        return [3 /*break*/, 4];
                                    case 3:
                                        error_3 = _a.sent();
                                        ws.send(JSON.stringify({ type: 'auth_error', message: 'Invalid token' }));
                                        return [3 /*break*/, 4];
                                    case 4:
                                        if (!(message.type === 'chat_message')) return [3 /*break*/, 6];
                                        return [4 /*yield*/, storage.createChatMessage({
                                                senderId: message.senderId,
                                                receiverId: message.receiverId,
                                                orderId: message.orderId,
                                                message: message.message,
                                                type: 'text',
                                            })];
                                    case 5:
                                        chatMessage = _a.sent();
                                        receiverWs = clients.get(message.receiverId);
                                        if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
                                            receiverWs.send(JSON.stringify({
                                                type: 'new_message',
                                                message: chatMessage,
                                            }));
                                        }
                                        _a.label = 6;
                                    case 6:
                                        if (!(message.type === 'order_update')) return [3 /*break*/, 8];
                                        return [4 /*yield*/, storage.getOrderById(message.orderId)];
                                    case 7:
                                        order = _a.sent();
                                        if (order) {
                                            customerWs = clients.get(order.customerId);
                                            if (customerWs && customerWs.readyState === WebSocket.OPEN) {
                                                customerWs.send(JSON.stringify({
                                                    type: 'order_status_update',
                                                    order: order,
                                                }));
                                            }
                                        }
                                        _a.label = 8;
                                    case 8: return [3 /*break*/, 10];
                                    case 9:
                                        error_4 = _a.sent();
                                        console.error('WebSocket message error:', error_4);
                                        return [3 /*break*/, 10];
                                    case 10: return [2 /*return*/];
                                }
                            });
                        }); });
                        ws.on('close', function () {
                            // Remove client from map
                            for (var _i = 0, _a = Array.from(clients.entries()); _i < _a.length; _i++) {
                                var _b = _a[_i], userId = _b[0], client = _b[1];
                                if (client === ws) {
                                    clients.delete(userId);
                                    break;
                                }
                            }
                        });
                    });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, storage.seedData()];
                case 2:
                    _a.sent();
                    console.log('Database seeded successfully');
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error('Seeding failed:', error_2);
                    return [3 /*break*/, 4];
                case 4:
                    // Auth routes
                    app.post('/api/auth/login', authLimiter, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, email, password, user, token, error_5;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 2, , 3]);
                                    _a = loginSchema.parse(req.body), email = _a.email, password = _a.password;
                                    return [4 /*yield*/, storage.validateUser(email, password)];
                                case 1:
                                    user = _b.sent();
                                    if (!user) {
                                        return [2 /*return*/, res.status(401).json({ message: 'Invalid credentials' })];
                                    }
                                    // Check if email is verified
                                    if (!user.emailVerified) {
                                        return [2 /*return*/, res.status(403).json({
                                                message: 'Please verify your email before logging in',
                                                emailVerified: false,
                                                email: user.email
                                            })];
                                    }
                                    token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
                                    res.json({
                                        token: token,
                                        user: {
                                            id: user.id,
                                            email: user.email,
                                            name: user.name,
                                            role: user.role,
                                            phone: user.phone,
                                            avatar: user.avatar,
                                            emailVerified: user.emailVerified,
                                        },
                                    });
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_5 = _b.sent();
                                    res.status(400).json({ message: 'Invalid request data' });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post('/api/auth/register', authLimiter, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var userData, existingUser, user, verificationToken, tokenExpires, emailError_1, error_6;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 8, , 9]);
                                    userData = insertUserSchema.parse(req.body);
                                    return [4 /*yield*/, storage.getUserByEmail(userData.email)];
                                case 1:
                                    existingUser = _a.sent();
                                    if (existingUser) {
                                        return [2 /*return*/, res.status(400).json({ message: 'User already exists' })];
                                    }
                                    return [4 /*yield*/, storage.createUser(userData)];
                                case 2:
                                    user = _a.sent();
                                    verificationToken = emailService.generateVerificationToken();
                                    tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
                                    // Set verification token
                                    return [4 /*yield*/, storage.setEmailVerificationToken(user.id, verificationToken, tokenExpires)];
                                case 3:
                                    // Set verification token
                                    _a.sent();
                                    _a.label = 4;
                                case 4:
                                    _a.trys.push([4, 6, , 7]);
                                    return [4 /*yield*/, emailService.sendVerificationEmail(user.email, verificationToken)];
                                case 5:
                                    _a.sent();
                                    return [3 /*break*/, 7];
                                case 6:
                                    emailError_1 = _a.sent();
                                    console.error('Failed to send verification email:', emailError_1);
                                    return [3 /*break*/, 7];
                                case 7:
                                    res.status(201).json({
                                        message: 'Registration successful. Please check your email to verify your account.',
                                        user: {
                                            id: user.id,
                                            email: user.email,
                                            name: user.name,
                                            role: user.role,
                                            phone: user.phone,
                                            avatar: user.avatar,
                                            emailVerified: user.emailVerified,
                                        },
                                    });
                                    return [3 /*break*/, 9];
                                case 8:
                                    error_6 = _a.sent();
                                    res.status(400).json({ message: 'Invalid request data' });
                                    return [3 /*break*/, 9];
                                case 9: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.get('/api/auth/me', authenticateToken, function (req, res) {
                        res.json({
                            user: {
                                id: req.user.id,
                                email: req.user.email,
                                name: req.user.name,
                                role: req.user.role,
                                phone: req.user.phone,
                                avatar: req.user.avatar,
                                emailVerified: req.user.emailVerified,
                            },
                        });
                    });
                    // Email verification endpoint
                    app.get('/api/auth/verify-email', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var token, user, error_7;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 3, , 4]);
                                    token = req.query.token;
                                    if (!token || typeof token !== 'string') {
                                        return [2 /*return*/, res.status(400).json({ message: 'Invalid verification token' })];
                                    }
                                    return [4 /*yield*/, storage.getUserByVerificationToken(token)];
                                case 1:
                                    user = _a.sent();
                                    if (!user) {
                                        return [2 /*return*/, res.status(400).json({ message: 'Invalid or expired verification token' })];
                                    }
                                    // Mark email as verified
                                    return [4 /*yield*/, storage.updateUserEmailVerification(user.id, true)];
                                case 2:
                                    // Mark email as verified
                                    _a.sent();
                                    res.json({
                                        message: 'Email verified successfully! You can now log in to your account.',
                                        verified: true
                                    });
                                    return [3 /*break*/, 4];
                                case 3:
                                    error_7 = _a.sent();
                                    console.error('Email verification error:', error_7);
                                    res.status(500).json({ message: 'Failed to verify email' });
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Resend verification email
                    app.post('/api/auth/resend-verification', authLimiter, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var email, user, verificationToken, tokenExpires, emailError_2, error_8;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 7, , 8]);
                                    email = req.body.email;
                                    if (!email) {
                                        return [2 /*return*/, res.status(400).json({ message: 'Email is required' })];
                                    }
                                    return [4 /*yield*/, storage.getUserByEmail(email)];
                                case 1:
                                    user = _a.sent();
                                    if (!user) {
                                        return [2 /*return*/, res.status(404).json({ message: 'User not found' })];
                                    }
                                    if (user.emailVerified) {
                                        return [2 /*return*/, res.status(400).json({ message: 'Email is already verified' })];
                                    }
                                    verificationToken = emailService.generateVerificationToken();
                                    tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
                                    // Set verification token
                                    return [4 /*yield*/, storage.setEmailVerificationToken(user.id, verificationToken, tokenExpires)];
                                case 2:
                                    // Set verification token
                                    _a.sent();
                                    _a.label = 3;
                                case 3:
                                    _a.trys.push([3, 5, , 6]);
                                    return [4 /*yield*/, emailService.sendVerificationEmail(user.email, verificationToken)];
                                case 4:
                                    _a.sent();
                                    res.json({ message: 'Verification email sent successfully' });
                                    return [3 /*break*/, 6];
                                case 5:
                                    emailError_2 = _a.sent();
                                    console.error('Failed to send verification email:', emailError_2);
                                    res.status(500).json({ message: 'Failed to send verification email' });
                                    return [3 /*break*/, 6];
                                case 6: return [3 /*break*/, 8];
                                case 7:
                                    error_8 = _a.sent();
                                    res.status(500).json({ message: 'Failed to resend verification email' });
                                    return [3 /*break*/, 8];
                                case 8: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Change password
                    app.put('/api/auth/change-password', authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, currentPassword, newPassword, isValid, hashedPassword, user, error_9;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 4, , 5]);
                                    _a = req.body, currentPassword = _a.currentPassword, newPassword = _a.newPassword;
                                    if (!currentPassword || !newPassword) {
                                        return [2 /*return*/, res.status(400).json({ message: 'Current password and new password are required' })];
                                    }
                                    if (newPassword.length < 6) {
                                        return [2 /*return*/, res.status(400).json({ message: 'New password must be at least 6 characters long' })];
                                    }
                                    return [4 /*yield*/, bcrypt.compare(currentPassword, req.user.password)];
                                case 1:
                                    isValid = _b.sent();
                                    if (!isValid) {
                                        return [2 /*return*/, res.status(400).json({ message: 'Current password is incorrect' })];
                                    }
                                    return [4 /*yield*/, bcrypt.hash(newPassword, 10)];
                                case 2:
                                    hashedPassword = _b.sent();
                                    return [4 /*yield*/, storage.updateUser(req.user.id, { password: hashedPassword })];
                                case 3:
                                    user = _b.sent();
                                    if (!user) {
                                        return [2 /*return*/, res.status(404).json({ message: 'User not found' })];
                                    }
                                    res.json({ message: 'Password changed successfully' });
                                    return [3 /*break*/, 5];
                                case 4:
                                    error_9 = _b.sent();
                                    console.error('Password change error:', error_9);
                                    res.status(500).json({ message: 'Failed to change password' });
                                    return [3 /*break*/, 5];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); });
                    // User routes
                    app.get('/api/users/addresses', authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var addresses, error_10;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, storage.getUserAddresses(req.user.id)];
                                case 1:
                                    addresses = _a.sent();
                                    res.json(addresses);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_10 = _a.sent();
                                    res.status(500).json({ message: 'Failed to fetch addresses' });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post('/api/users/addresses', authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var addressData, address, error_11;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    addressData = insertAddressSchema.parse(__assign(__assign({}, req.body), { userId: req.user.id }));
                                    return [4 /*yield*/, storage.createAddress(addressData)];
                                case 1:
                                    address = _a.sent();
                                    res.status(201).json(address);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_11 = _a.sent();
                                    res.status(400).json({ message: 'Invalid address data' });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.put('/api/users/addresses/:id', authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var id, updates, address, error_12;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    id = req.params.id;
                                    updates = req.body;
                                    return [4 /*yield*/, storage.updateAddress(id, updates)];
                                case 1:
                                    address = _a.sent();
                                    if (!address) {
                                        return [2 /*return*/, res.status(404).json({ message: 'Address not found' })];
                                    }
                                    res.json(address);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_12 = _a.sent();
                                    res.status(400).json({ message: 'Failed to update address' });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.delete('/api/users/addresses/:id', authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var id, success, error_13;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    id = req.params.id;
                                    return [4 /*yield*/, storage.deleteAddress(id)];
                                case 1:
                                    success = _a.sent();
                                    if (!success) {
                                        return [2 /*return*/, res.status(404).json({ message: 'Address not found' })];
                                    }
                                    res.json({ message: 'Address deleted successfully' });
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_13 = _a.sent();
                                    res.status(400).json({ message: 'Failed to delete address' });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.put('/api/users/me', authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, name_1, phone, updates, user, error_14;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 2, , 3]);
                                    _a = req.body, name_1 = _a.name, phone = _a.phone;
                                    updates = {};
                                    if (name_1 !== undefined)
                                        updates.name = name_1;
                                    if (phone !== undefined)
                                        updates.phone = phone;
                                    return [4 /*yield*/, storage.updateUser(req.user.id, updates)];
                                case 1:
                                    user = _b.sent();
                                    if (!user) {
                                        return [2 /*return*/, res.status(404).json({ message: 'User not found' })];
                                    }
                                    res.json({
                                        user: {
                                            id: user.id,
                                            email: user.email,
                                            name: user.name,
                                            role: user.role,
                                            phone: user.phone,
                                            avatar: user.avatar,
                                        },
                                    });
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_14 = _b.sent();
                                    res.status(400).json({ message: 'Failed to update profile' });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Product routes
                    app.get('/api/products', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var products, error_15;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, storage.getProducts()];
                                case 1:
                                    products = _a.sent();
                                    res.json(products);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_15 = _a.sent();
                                    res.status(500).json({ message: 'Failed to fetch products' });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post('/api/products', authenticateToken, requireAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var productData, product, error_16;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    productData = insertProductSchema.parse(req.body);
                                    return [4 /*yield*/, storage.createProduct(productData)];
                                case 1:
                                    product = _a.sent();
                                    res.status(201).json(product);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_16 = _a.sent();
                                    res.status(400).json({ message: 'Invalid product data' });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.put('/api/products/:id', authenticateToken, requireAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var id, updates, product, error_17;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    id = req.params.id;
                                    updates = req.body;
                                    return [4 /*yield*/, storage.updateProduct(id, updates)];
                                case 1:
                                    product = _a.sent();
                                    if (!product) {
                                        return [2 /*return*/, res.status(404).json({ message: 'Product not found' })];
                                    }
                                    res.json(product);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_17 = _a.sent();
                                    res.status(400).json({ message: 'Failed to update product' });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Cart routes
                    app.get('/api/cart', authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var cartItems, error_18;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, storage.getCartItems(req.user.id)];
                                case 1:
                                    cartItems = _a.sent();
                                    res.json(cartItems);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_18 = _a.sent();
                                    res.status(500).json({ message: 'Failed to fetch cart items' });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post('/api/cart', authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var cartItemData, cartItem, error_19;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    cartItemData = __assign(__assign({}, req.body), { userId: req.user.id });
                                    return [4 /*yield*/, storage.addCartItem(cartItemData)];
                                case 1:
                                    cartItem = _a.sent();
                                    res.status(201).json(cartItem);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_19 = _a.sent();
                                    res.status(400).json({ message: 'Failed to add item to cart' });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.put('/api/cart/:id', authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var id, quantity, cartItem, error_20;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    id = req.params.id;
                                    quantity = req.body.quantity;
                                    return [4 /*yield*/, storage.updateCartItem(id, quantity)];
                                case 1:
                                    cartItem = _a.sent();
                                    if (!cartItem) {
                                        return [2 /*return*/, res.status(404).json({ message: 'Cart item not found' })];
                                    }
                                    res.json(cartItem);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_20 = _a.sent();
                                    res.status(400).json({ message: 'Failed to update cart item' });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.delete('/api/cart/:id', authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var id, success, error_21;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    id = req.params.id;
                                    return [4 /*yield*/, storage.removeCartItem(id)];
                                case 1:
                                    success = _a.sent();
                                    if (!success) {
                                        return [2 /*return*/, res.status(404).json({ message: 'Cart item not found' })];
                                    }
                                    res.json({ message: 'Item removed from cart' });
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_21 = _a.sent();
                                    res.status(400).json({ message: 'Failed to remove item from cart' });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.delete('/api/cart', authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var error_22;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, storage.clearCart(req.user.id)];
                                case 1:
                                    _a.sent();
                                    res.json({ message: 'Cart cleared' });
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_22 = _a.sent();
                                    res.status(500).json({ message: 'Failed to clear cart' });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Order routes
                    app.get('/api/orders', authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var orders, error_23;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 5, , 6]);
                                    orders = void 0;
                                    if (!(req.user.role === 'admin')) return [3 /*break*/, 2];
                                    return [4 /*yield*/, storage.getOrders()];
                                case 1:
                                    orders = _a.sent();
                                    return [3 /*break*/, 4];
                                case 2: return [4 /*yield*/, storage.getOrdersByCustomer(req.user.id)];
                                case 3:
                                    orders = _a.sent();
                                    _a.label = 4;
                                case 4:
                                    res.json(orders);
                                    return [3 /*break*/, 6];
                                case 5:
                                    error_23 = _a.sent();
                                    res.status(500).json({ message: 'Failed to fetch orders' });
                                    return [3 /*break*/, 6];
                                case 6: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post('/api/orders', authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var orderData, order, error_24;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 4, , 5]);
                                    orderData = insertOrderSchema.parse(__assign(__assign({}, req.body), { customerId: req.user.id }));
                                    return [4 /*yield*/, storage.createOrder(orderData)];
                                case 1:
                                    order = _a.sent();
                                    // Clear cart after successful order
                                    return [4 /*yield*/, storage.clearCart(req.user.id)];
                                case 2:
                                    // Clear cart after successful order
                                    _a.sent();
                                    // Create notification
                                    return [4 /*yield*/, storage.createNotification({
                                            userId: req.user.id,
                                            title: 'Order Placed',
                                            message: "Your order ".concat(order.orderNumber, " has been placed successfully."),
                                            type: 'order_update',
                                            data: { orderId: order.id },
                                        })];
                                case 3:
                                    // Create notification
                                    _a.sent();
                                    res.status(201).json(order);
                                    return [3 /*break*/, 5];
                                case 4:
                                    error_24 = _a.sent();
                                    res.status(400).json({ message: 'Failed to create order' });
                                    return [3 /*break*/, 5];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.put('/api/orders/:id/status', authenticateToken, requireAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var id, status_1, order, customerWs, error_25;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 3, , 4]);
                                    id = req.params.id;
                                    status_1 = req.body.status;
                                    return [4 /*yield*/, storage.updateOrderStatus(id, status_1)];
                                case 1:
                                    order = _a.sent();
                                    if (!order) {
                                        return [2 /*return*/, res.status(404).json({ message: 'Order not found' })];
                                    }
                                    // Create notification for customer
                                    return [4 /*yield*/, storage.createNotification({
                                            userId: order.customerId,
                                            title: 'Order Update',
                                            message: "Your order ".concat(order.orderNumber, " status has been updated to ").concat(status_1, "."),
                                            type: 'order_update',
                                            data: { orderId: order.id },
                                        })];
                                case 2:
                                    // Create notification for customer
                                    _a.sent();
                                    customerWs = clients.get(order.customerId);
                                    if (customerWs && customerWs.readyState === WebSocket.OPEN) {
                                        customerWs.send(JSON.stringify({
                                            type: 'order_status_update',
                                            order: order,
                                        }));
                                    }
                                    res.json(order);
                                    return [3 /*break*/, 4];
                                case 3:
                                    error_25 = _a.sent();
                                    res.status(400).json({ message: 'Failed to update order status' });
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Admin location tracking routes
                    app.get('/api/admin/addresses', authenticateToken, requireAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var addresses, error_26;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, storage.getAllAddressesWithUsers()];
                                case 1:
                                    addresses = _a.sent();
                                    res.json(addresses);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_26 = _a.sent();
                                    res.status(500).json({ message: 'Failed to fetch addresses' });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.get('/api/admin/orders/tracking', authenticateToken, requireAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var orders, error_27;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, storage.getOrdersWithLocationData()];
                                case 1:
                                    orders = _a.sent();
                                    res.json(orders);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_27 = _a.sent();
                                    res.status(500).json({ message: 'Failed to fetch orders for tracking' });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Chat routes
                    app.get('/api/chat/messages', authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var orderId, messages, error_28;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    orderId = req.query.orderId;
                                    return [4 /*yield*/, storage.getChatMessages(req.user.id, orderId)];
                                case 1:
                                    messages = _a.sent();
                                    res.json(messages);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_28 = _a.sent();
                                    res.status(500).json({ message: 'Failed to fetch messages' });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post('/api/chat/messages', authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var messageData, adminUser, message, error_29;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 4, , 5]);
                                    messageData = __assign(__assign({}, req.body), { senderId: req.user.id });
                                    if (!(req.user.role === 'customer' && !messageData.receiverId)) return [3 /*break*/, 2];
                                    return [4 /*yield*/, storage.getUserByEmail('admin@gasflow.com')];
                                case 1:
                                    adminUser = _a.sent();
                                    if (adminUser) {
                                        messageData.receiverId = adminUser.id;
                                    }
                                    _a.label = 2;
                                case 2: return [4 /*yield*/, storage.createChatMessage(messageData)];
                                case 3:
                                    message = _a.sent();
                                    res.status(201).json(message);
                                    return [3 /*break*/, 5];
                                case 4:
                                    error_29 = _a.sent();
                                    res.status(400).json({ message: 'Failed to create message' });
                                    return [3 /*break*/, 5];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post('/api/chat/messages/read', authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var error_30;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, storage.markMessagesAsRead(req.user.id)];
                                case 1:
                                    _a.sent();
                                    res.json({ message: 'Messages marked as read' });
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_30 = _a.sent();
                                    res.status(500).json({ message: 'Failed to mark messages as read' });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.put('/api/chat/messages/:id', authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var id, message, updatedMessage, error_31;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    id = req.params.id;
                                    message = req.body.message;
                                    if (!message || !message.trim()) {
                                        return [2 /*return*/, res.status(400).json({ message: 'Message content is required' })];
                                    }
                                    return [4 /*yield*/, storage.updateChatMessage(id, req.user.id, message.trim())];
                                case 1:
                                    updatedMessage = _a.sent();
                                    if (!updatedMessage) {
                                        return [2 /*return*/, res.status(404).json({ message: 'Message not found or not authorized to edit' })];
                                    }
                                    res.json(updatedMessage);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_31 = _a.sent();
                                    res.status(500).json({ message: 'Failed to update message' });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.delete('/api/chat/messages/:id', authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var id, success, error_32;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    id = req.params.id;
                                    return [4 /*yield*/, storage.deleteChatMessage(id, req.user.id)];
                                case 1:
                                    success = _a.sent();
                                    if (!success) {
                                        return [2 /*return*/, res.status(404).json({ message: 'Message not found or not authorized to delete' })];
                                    }
                                    res.json({ message: 'Message deleted successfully' });
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_32 = _a.sent();
                                    res.status(500).json({ message: 'Failed to delete message' });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.delete('/api/chat/messages/:id/unsend', authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var id, success, error_33;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    id = req.params.id;
                                    return [4 /*yield*/, storage.unsendChatMessage(id, req.user.id)];
                                case 1:
                                    success = _a.sent();
                                    if (!success) {
                                        return [2 /*return*/, res.status(404).json({ message: 'Message not found or not authorized to unsend' })];
                                    }
                                    res.json({ message: 'Message unsent successfully' });
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_33 = _a.sent();
                                    res.status(500).json({ message: 'Failed to unsend message' });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Admin chat routes
                    app.get('/api/chat/customers', authenticateToken, requireAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var customers, error_34;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, storage.getChatCustomers()];
                                case 1:
                                    customers = _a.sent();
                                    res.json(customers);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_34 = _a.sent();
                                    res.status(500).json({ message: 'Failed to fetch chat customers' });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.get('/api/chat/conversation/:customerId', authenticateToken, requireAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var customerId, messages, error_35;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    customerId = req.params.customerId;
                                    return [4 /*yield*/, storage.getConversationMessages(customerId, req.user.id)];
                                case 1:
                                    messages = _a.sent();
                                    res.json(messages);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_35 = _a.sent();
                                    res.status(500).json({ message: 'Failed to fetch conversation messages' });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Notification routes
                    app.get('/api/notifications', authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var notifications, error_36;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, storage.getUserNotifications(req.user.id)];
                                case 1:
                                    notifications = _a.sent();
                                    res.json(notifications);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_36 = _a.sent();
                                    res.status(500).json({ message: 'Failed to fetch notifications' });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.put('/api/notifications/:id/read', authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var id, success, error_37;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    id = req.params.id;
                                    return [4 /*yield*/, storage.markNotificationAsRead(id)];
                                case 1:
                                    success = _a.sent();
                                    if (!success) {
                                        return [2 /*return*/, res.status(404).json({ message: 'Notification not found' })];
                                    }
                                    res.json({ message: 'Notification marked as read' });
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_37 = _a.sent();
                                    res.status(400).json({ message: 'Failed to mark notification as read' });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Receipt routes
                    app.get('/api/orders/:id/receipt', authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var id, orderDetails, error_38;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    id = req.params.id;
                                    return [4 /*yield*/, storage.getOrderDetailsForReceipt(id, req.user.id)];
                                case 1:
                                    orderDetails = _a.sent();
                                    if (!orderDetails) {
                                        return [2 /*return*/, res.status(404).json({ message: 'Order not found or access denied' })];
                                    }
                                    res.json(orderDetails);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_38 = _a.sent();
                                    res.status(500).json({ message: 'Failed to fetch order details for receipt' });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Analytics routes (admin only)
                    app.get('/api/analytics/dashboard', authenticateToken, requireAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var stats, error_39;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, storage.getDashboardStats()];
                                case 1:
                                    stats = _a.sent();
                                    res.json(stats);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_39 = _a.sent();
                                    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Delivery Schedules routes
                    app.get('/api/schedules', authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var schedules, error_40;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, storage.getDeliverySchedules(req.user.id)];
                                case 1:
                                    schedules = _a.sent();
                                    res.json(schedules);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_40 = _a.sent();
                                    res.status(500).json({ message: error_40.message });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.get('/api/admin/schedules', authenticateToken, requireAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var schedules, error_41;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, storage.getAllDeliverySchedules()];
                                case 1:
                                    schedules = _a.sent();
                                    res.json(schedules);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_41 = _a.sent();
                                    res.status(500).json({ message: error_41.message });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post('/api/schedules', authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var scheduleData, schedule, error_42;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    scheduleData = __assign(__assign({}, req.body), { userId: req.user.id });
                                    return [4 /*yield*/, storage.createDeliverySchedule(scheduleData)];
                                case 1:
                                    schedule = _a.sent();
                                    res.status(201).json(schedule);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_42 = _a.sent();
                                    res.status(400).json({ message: error_42.message });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.put('/api/schedules/:id', authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var schedule, error_43;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, storage.updateDeliverySchedule(req.params.id, req.body)];
                                case 1:
                                    schedule = _a.sent();
                                    if (!schedule) {
                                        return [2 /*return*/, res.status(404).json({ message: 'Schedule not found' })];
                                    }
                                    res.json(schedule);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_43 = _a.sent();
                                    res.status(400).json({ message: error_43.message });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.delete('/api/schedules/:id', authenticateToken, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var success, error_44;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, storage.deleteDeliverySchedule(req.params.id)];
                                case 1:
                                    success = _a.sent();
                                    if (!success) {
                                        return [2 /*return*/, res.status(404).json({ message: 'Schedule not found' })];
                                    }
                                    res.status(204).send();
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_44 = _a.sent();
                                    res.status(500).json({ message: error_44.message });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    // POS System routes
                    app.post('/api/pos/sale', posLimiter, authenticateToken, requireAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, customerId, items, totalAmount, paymentMethod, amountPaid, change, addressId, addresses, orderData, order, _i, items_1, item, product, error_45;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 9, , 10]);
                                    _a = req.body, customerId = _a.customerId, items = _a.items, totalAmount = _a.totalAmount, paymentMethod = _a.paymentMethod, amountPaid = _a.amountPaid, change = _a.change;
                                    addressId = "pos-default";
                                    if (!customerId) return [3 /*break*/, 2];
                                    return [4 /*yield*/, storage.getUserAddresses(customerId)];
                                case 1:
                                    addresses = _b.sent();
                                    if (addresses && addresses.length > 0) {
                                        addressId = addresses[0].id;
                                    }
                                    _b.label = 2;
                                case 2:
                                    orderData = {
                                        customerId: customerId || "walk-in-customer",
                                        productId: items[0].productId, // Main product
                                        addressId: addressId, // Use default or customer's address
                                        quantity: items.reduce(function (sum, item) { return sum + item.quantity; }, 0),
                                        type: items[0].type,
                                        unitPrice: (totalAmount / items.reduce(function (sum, item) { return sum + item.quantity; }, 0)).toString(),
                                        totalAmount: totalAmount.toString(),
                                        status: "delivered", // POS sales are immediate
                                        paymentMethod: paymentMethod,
                                        notes: "POS Sale - ".concat(paymentMethod).concat(paymentMethod === 'cash' ? " | Paid: \u20B1".concat(amountPaid, " | Change: \u20B1").concat(change) : '')
                                    };
                                    return [4 /*yield*/, storage.createOrder(orderData)];
                                case 3:
                                    order = _b.sent();
                                    _i = 0, items_1 = items;
                                    _b.label = 4;
                                case 4:
                                    if (!(_i < items_1.length)) return [3 /*break*/, 8];
                                    item = items_1[_i];
                                    return [4 /*yield*/, storage.getProduct(item.productId)];
                                case 5:
                                    product = _b.sent();
                                    if (!product) return [3 /*break*/, 7];
                                    return [4 /*yield*/, storage.updateProduct(item.productId, {
                                            stock: Math.max(0, product.stock - item.quantity)
                                        })];
                                case 6:
                                    _b.sent();
                                    _b.label = 7;
                                case 7:
                                    _i++;
                                    return [3 /*break*/, 4];
                                case 8:
                                    res.status(201).json({
                                        success: true,
                                        orderId: order.id,
                                        receiptNumber: order.orderNumber
                                    });
                                    return [3 /*break*/, 10];
                                case 9:
                                    error_45 = _b.sent();
                                    console.error('POS sale error:', error_45);
                                    res.status(500).json({ message: error_45.message || 'Failed to process sale' });
                                    return [3 /*break*/, 10];
                                case 10: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.get('/api/users', authenticateToken, requireAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var role_1, users, filteredUsers, error_46;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    role_1 = req.query.role;
                                    return [4 /*yield*/, storage.getAllUsers()];
                                case 1:
                                    users = _a.sent();
                                    filteredUsers = role_1 ? users.filter(function (user) { return user.role === role_1; }) : users;
                                    res.json(filteredUsers);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_46 = _a.sent();
                                    res.status(500).json({ message: error_46.message });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/, httpServer];
            }
        });
    });
}
