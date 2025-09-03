// Web Push Notifications utility
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
export var requestNotificationPermission = function () { return __awaiter(void 0, void 0, void 0, function () {
    var permission;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!("Notification" in window)) {
                    console.warn("This browser does not support notifications");
                    return [2 /*return*/, "denied"];
                }
                if (Notification.permission === "granted") {
                    return [2 /*return*/, "granted"];
                }
                if (Notification.permission === "denied") {
                    return [2 /*return*/, "denied"];
                }
                return [4 /*yield*/, Notification.requestPermission()];
            case 1:
                permission = _a.sent();
                return [2 /*return*/, permission];
        }
    });
}); };
export var showNotification = function (title, options) {
    if (Notification.permission !== "granted") {
        console.warn("Notification permission not granted");
        return null;
    }
    return new Notification(title, __assign({ icon: "/favicon.ico", badge: "/favicon.ico" }, options));
};
export var subscribeToNotifications = function () { return __awaiter(void 0, void 0, void 0, function () {
    var registration, subscription, permission, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
                    console.warn("Push messaging is not supported");
                    return [2 /*return*/, null];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 8, , 9]);
                return [4 /*yield*/, navigator.serviceWorker.ready];
            case 2:
                registration = _a.sent();
                return [4 /*yield*/, registration.pushManager.getSubscription()];
            case 3:
                subscription = _a.sent();
                if (!!subscription) return [3 /*break*/, 7];
                return [4 /*yield*/, requestNotificationPermission()];
            case 4:
                permission = _a.sent();
                if (permission !== "granted") {
                    console.warn("Notification permission denied");
                    return [2 /*return*/, null];
                }
                return [4 /*yield*/, registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY ||
                            "BEl62iUYgUivxIkv69yViEuiBIa40HI6DLldtRhJBA-B2AH2xGlJDJdFAZnSyIwEqE9_8v2U2FqFxN9_1gMWKs")
                    })];
            case 5:
                // Subscribe to push notifications
                subscription = _a.sent();
                // Send subscription to server
                return [4 /*yield*/, fetch("/api/notifications/subscribe", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(subscription),
                    })];
            case 6:
                // Send subscription to server
                _a.sent();
                _a.label = 7;
            case 7: return [2 /*return*/, subscription];
            case 8:
                error_1 = _a.sent();
                console.error("Failed to subscribe to push notifications:", error_1);
                return [2 /*return*/, null];
            case 9: return [2 /*return*/];
        }
    });
}); };
// Convert VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String) {
    var padding = "=".repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
        .replace(/\-/g, "+")
        .replace(/_/g, "/");
    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);
    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
export var unsubscribeFromNotifications = function () { return __awaiter(void 0, void 0, void 0, function () {
    var registration, subscription, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!("serviceWorker" in navigator)) {
                    return [2 /*return*/, false];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 6, , 7]);
                return [4 /*yield*/, navigator.serviceWorker.getRegistration()];
            case 2:
                registration = _a.sent();
                if (!registration) return [3 /*break*/, 5];
                return [4 /*yield*/, registration.pushManager.getSubscription()];
            case 3:
                subscription = _a.sent();
                if (!subscription) return [3 /*break*/, 5];
                return [4 /*yield*/, subscription.unsubscribe()];
            case 4: return [2 /*return*/, _a.sent()];
            case 5: return [2 /*return*/, true];
            case 6:
                error_2 = _a.sent();
                console.error("Failed to unsubscribe from push notifications:", error_2);
                return [2 /*return*/, false];
            case 7: return [2 /*return*/];
        }
    });
}); };
