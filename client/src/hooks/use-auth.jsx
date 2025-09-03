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
import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
var AuthContext = createContext(undefined);
export function AuthProvider(_a) {
    var _this = this;
    var children = _a.children;
    var _b = useState(null), user = _b[0], setUser = _b[1];
    var _c = useState(null), token = _c[0], setToken = _c[1];
    var _d = useState(true), isLoading = _d[0], setIsLoading = _d[1];
    var _e = useLocation(), setLocation = _e[1];
    var toast = useToast().toast;
    useEffect(function () {
        // Check for existing token on mount
        var savedToken = localStorage.getItem("auth_token");
        if (savedToken) {
            setToken(savedToken);
            fetchUser(savedToken);
        }
        else {
            setIsLoading(false);
        }
    }, []);
    var fetchUser = function (authToken) { return __awaiter(_this, void 0, void 0, function () {
        var response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, 6, 7]);
                    return [4 /*yield*/, fetch("/api/auth/me", {
                            headers: {
                                Authorization: "Bearer ".concat(authToken),
                                "Content-Type": "application/json",
                            },
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    setUser(data.user);
                    return [3 /*break*/, 4];
                case 3:
                    // Invalid token
                    localStorage.removeItem("auth_token");
                    setToken(null);
                    _a.label = 4;
                case 4: return [3 /*break*/, 7];
                case 5:
                    error_1 = _a.sent();
                    console.error("Failed to fetch user:", error_1);
                    localStorage.removeItem("auth_token");
                    setToken(null);
                    return [3 /*break*/, 7];
                case 6:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var login = function (email, password) { return __awaiter(_this, void 0, void 0, function () {
        var response, data, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, apiRequest("POST", "/api/auth/login", {
                            email: email,
                            password: password,
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    // Check if email verification is required
                    if (data.emailVerified === false) {
                        toast({
                            title: "Email Verification Required",
                            description: "Please check your email and verify your account before logging in.",
                            variant: "destructive",
                        });
                        throw new Error("Email verification required");
                    }
                    setToken(data.token);
                    setUser(data.user);
                    localStorage.setItem("auth_token", data.token);
                    toast({
                        title: "Welcome!",
                        description: "You have been logged in successfully.",
                    });
                    // Redirect based on role
                    if (data.user.role === "admin") {
                        setLocation("/admin");
                    }
                    else {
                        setLocation("/customer");
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    if (error_2.message !== "Email verification required") {
                        toast({
                            title: "Login Failed",
                            description: error_2.message || "Invalid credentials",
                            variant: "destructive",
                        });
                    }
                    throw error_2;
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var register = function (userData) { return __awaiter(_this, void 0, void 0, function () {
        var response, data, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, apiRequest("POST", "/api/auth/register", userData)];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    // Registration successful, but email verification required
                    toast({
                        title: "Account Created!",
                        description: "Please check your email to verify your account before logging in.",
                    });
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    toast({
                        title: "Registration Failed",
                        description: error_3.message || "Failed to create account",
                        variant: "destructive",
                    });
                    throw error_3;
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var logout = function () {
        setUser(null);
        setToken(null);
        localStorage.removeItem("auth_token");
        setLocation("/login");
        toast({
            title: "Logged Out",
            description: "You have been logged out successfully.",
        });
    };
    return (<AuthContext.Provider value={{
            user: user,
            token: token,
            login: login,
            register: register,
            logout: logout,
            isLoading: isLoading,
        }}>
      {children}
    </AuthContext.Provider>);
}
export function useAuth() {
    var context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
