import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
var WebSocketContext = createContext(undefined);
export function WebSocketProvider(_a) {
    var children = _a.children;
    var _b = useState(false), isConnected = _b[0], setIsConnected = _b[1];
    var _c = useState(null), lastMessage = _c[0], setLastMessage = _c[1];
    var _d = useAuth(), user = _d.user, token = _d.token;
    var toast = useToast().toast;
    var ws = useRef(null);
    var reconnectTimeoutRef = useRef();
    var connect = function () {
        if (!token)
            return;
        var protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        var wsUrl = "".concat(protocol, "//").concat(window.location.host, "/ws");
        try {
            ws.current = new WebSocket(wsUrl);
            ws.current.onopen = function () {
                var _a;
                console.log("WebSocket connected");
                setIsConnected(true);
                // Authenticate with server
                if (token) {
                    (_a = ws.current) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify({
                        type: "auth",
                        token: token,
                    }));
                }
            };
            ws.current.onmessage = function (event) {
                try {
                    var message = JSON.parse(event.data);
                    setLastMessage(message);
                    // Handle different message types
                    switch (message.type) {
                        case "auth_success":
                            console.log("WebSocket authenticated");
                            break;
                        case "auth_error":
                            console.error("WebSocket auth error:", message.message);
                            break;
                        case "new_message":
                            toast({
                                title: "New Message",
                                description: "You have received a new message.",
                            });
                            break;
                        case "order_status_update":
                            toast({
                                title: "Order Update",
                                description: "Order ".concat(message.order.orderNumber, " status updated to ").concat(message.order.status, "."),
                            });
                            break;
                        default:
                            console.log("Received WebSocket message:", message);
                    }
                }
                catch (error) {
                    console.error("Failed to parse WebSocket message:", error);
                }
            };
            ws.current.onclose = function () {
                console.log("WebSocket disconnected");
                setIsConnected(false);
                // Attempt to reconnect after 3 seconds
                if (token) {
                    reconnectTimeoutRef.current = setTimeout(function () {
                        connect();
                    }, 3000);
                }
            };
            ws.current.onerror = function (error) {
                console.error("WebSocket error:", error);
                setIsConnected(false);
            };
        }
        catch (error) {
            console.error("Failed to create WebSocket connection:", error);
        }
    };
    useEffect(function () {
        if (user && token) {
            connect();
        }
        return function () {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [user, token]);
    var sendMessage = function (message) {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(message));
        }
        else {
            console.warn("WebSocket is not connected");
        }
    };
    return (<WebSocketContext.Provider value={{
            isConnected: isConnected,
            sendMessage: sendMessage,
            lastMessage: lastMessage,
        }}>
      {children}
    </WebSocketContext.Provider>);
}
export function useWebSocket() {
    var context = useContext(WebSocketContext);
    if (context === undefined) {
        throw new Error("useWebSocket must be used within a WebSocketProvider");
    }
    return context;
}
