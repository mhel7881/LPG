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
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket";
import { getAuthHeaders } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Send, MessageSquare, Users, Circle, ArrowLeft, MoreVertical, Edit3, Trash2, Check, X, RotateCcw } from "lucide-react";
export default function ChatPage() {
    var _this = this;
    var _a, _b, _c, _d, _e;
    var _f = useState(null), selectedOrderId = _f[0], setSelectedOrderId = _f[1];
    var _g = useState(null), selectedCustomerId = _g[0], setSelectedCustomerId = _g[1];
    var _h = useState(""), newMessage = _h[0], setNewMessage = _h[1];
    var _j = useState(null), activeChat = _j[0], setActiveChat = _j[1];
    var _k = useState(null), editingMessageId = _k[0], setEditingMessageId = _k[1];
    var _l = useState(""), editedMessage = _l[0], setEditedMessage = _l[1];
    var messagesEndRef = useRef(null);
    var user = useAuth().user;
    var _m = useWebSocket(), isConnected = _m.isConnected, sendMessage = _m.sendMessage, lastMessage = _m.lastMessage;
    var toast = useToast().toast;
    var queryClient = useQueryClient();
    // Fetch orders for context
    var _o = useQuery({
        queryKey: ["/api/orders"],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("/api/orders", {
                            headers: getAuthHeaders(),
                        })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error("Failed to fetch orders");
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
    }).data, orders = _o === void 0 ? [] : _o;
    // Fetch customers for admin chat list (only for admin users)
    var _p = useQuery({
        queryKey: ["/api/chat/customers"],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if ((user === null || user === void 0 ? void 0 : user.role) !== 'admin')
                            return [2 /*return*/, []];
                        return [4 /*yield*/, fetch("/api/chat/customers", {
                                headers: getAuthHeaders(),
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error("Failed to fetch chat customers");
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        enabled: (user === null || user === void 0 ? void 0 : user.role) === 'admin',
    }).data, chatCustomers = _p === void 0 ? [] : _p;
    // Fetch chat messages
    var _q = useQuery({
        queryKey: ["/api/chat/messages", selectedOrderId, selectedCustomerId],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var url, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = "/api/chat/messages";
                        if ((user === null || user === void 0 ? void 0 : user.role) === 'admin' && selectedCustomerId) {
                            url = "/api/chat/conversation/".concat(selectedCustomerId);
                        }
                        else if (selectedOrderId) {
                            url = "/api/chat/messages?orderId=".concat(selectedOrderId);
                        }
                        return [4 /*yield*/, fetch(url, {
                                headers: getAuthHeaders(),
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error("Failed to fetch messages");
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
    }), _r = _q.data, messages = _r === void 0 ? [] : _r, messagesLoading = _q.isLoading;
    // Send message mutation
    var sendMessageMutation = useMutation({
        mutationFn: function (messageData) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("/api/chat/messages", {
                            method: "POST",
                            headers: getAuthHeaders(),
                            body: JSON.stringify(messageData),
                        })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error("Failed to send message");
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
            setNewMessage("");
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to send message",
                variant: "destructive",
            });
        },
    });
    // Mark messages as read
    var markAsReadMutation = useMutation({
        mutationFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("/api/chat/messages/read", {
                            method: "POST",
                            headers: getAuthHeaders(),
                        })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error("Failed to mark messages as read");
                        return [2 /*return*/];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
        },
    });
    // Edit message mutation
    var editMessageMutation = useMutation({
        mutationFn: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var response;
            var messageId = _b.messageId, message = _b.message;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, fetch("/api/chat/messages/".concat(messageId), {
                            method: "PUT",
                            headers: getAuthHeaders(),
                            body: JSON.stringify({ message: message }),
                        })];
                    case 1:
                        response = _c.sent();
                        if (!response.ok)
                            throw new Error("Failed to edit message");
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
            setEditingMessageId(null);
            setEditedMessage("");
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to edit message",
                variant: "destructive",
            });
        },
    });
    // Delete message mutation
    var deleteMessageMutation = useMutation({
        mutationFn: function (messageId) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("/api/chat/messages/".concat(messageId), {
                            method: "DELETE",
                            headers: getAuthHeaders(),
                        })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error("Failed to delete message");
                        return [2 /*return*/];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to delete message",
                variant: "destructive",
            });
        },
    });
    // Unsend message mutation
    var unsendMessageMutation = useMutation({
        mutationFn: function (messageId) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("/api/chat/messages/".concat(messageId, "/unsend"), {
                            method: "DELETE",
                            headers: getAuthHeaders(),
                        })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error("Failed to unsend message");
                        return [2 /*return*/];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
            toast({
                title: "Success",
                description: "Message unsent successfully",
            });
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to unsend message",
                variant: "destructive",
            });
        },
    });
    // Handle WebSocket messages
    useEffect(function () {
        if ((lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.type) === "new_message") {
            queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
            // Show notification if not in active chat
            if (lastMessage.message.senderId !== (user === null || user === void 0 ? void 0 : user.id)) {
                toast({
                    title: "New Message",
                    description: lastMessage.message.message.slice(0, 50) + "...",
                });
            }
        }
    }, [lastMessage, queryClient, user === null || user === void 0 ? void 0 : user.id, toast]);
    // Auto scroll to bottom
    useEffect(function () {
        var _a;
        (_a = messagesEndRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    // Mark messages as read when viewing
    useEffect(function () {
        if (messages.length > 0 && activeChat) {
            var unreadMessages = messages.filter(function (msg) {
                return !msg.isRead && msg.receiverId === (user === null || user === void 0 ? void 0 : user.id);
            });
            if (unreadMessages.length > 0) {
                markAsReadMutation.mutate();
            }
        }
    }, [messages, activeChat, user === null || user === void 0 ? void 0 : user.id]);
    var handleSendMessage = function () {
        if (!newMessage.trim())
            return;
        var messageData = {
            message: newMessage.trim(),
        };
        // For admin chatting with specific customer
        if ((user === null || user === void 0 ? void 0 : user.role) === 'admin' && selectedCustomerId) {
            messageData.receiverId = selectedCustomerId;
        }
        else if (selectedOrderId) {
            messageData.orderId = selectedOrderId;
            // Find the order to get recipient
            var order = orders.find(function (o) { return o.id === selectedOrderId; });
            if (order && (user === null || user === void 0 ? void 0 : user.role) === "admin") {
                messageData.receiverId = order.customerId;
            }
        }
        else if ((user === null || user === void 0 ? void 0 : user.role) === "customer") {
            // Customer sending to admin - find admin user
            // For now, we'll use a placeholder admin ID
            messageData.receiverId = "admin";
        }
        // Send via WebSocket for real-time delivery
        if (isConnected) {
            sendMessage({
                type: "chat_message",
                senderId: user === null || user === void 0 ? void 0 : user.id,
                receiverId: messageData.receiverId,
                orderId: messageData.orderId,
                message: messageData.message,
            });
        }
        // Also send via HTTP for persistence
        sendMessageMutation.mutate(messageData);
    };
    var handleKeyPress = function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };
    var handleEditMessage = function (message) {
        setEditingMessageId(message.id);
        setEditedMessage(message.message);
    };
    var handleSaveEdit = function () {
        if (!editedMessage.trim() || !editingMessageId)
            return;
        editMessageMutation.mutate({
            messageId: editingMessageId,
            message: editedMessage.trim(),
        });
    };
    var handleCancelEdit = function () {
        setEditingMessageId(null);
        setEditedMessage("");
    };
    var handleDeleteMessage = function (messageId) {
        if (confirm("Are you sure you want to delete this message?")) {
            deleteMessageMutation.mutate(messageId);
        }
    };
    var handleUnsendMessage = function (messageId) {
        if (confirm("Are you sure you want to unsend this message? This will permanently remove it for everyone.")) {
            unsendMessageMutation.mutate(messageId);
        }
    };
    // Get unique chat threads
    var chatThreads = messages.reduce(function (threads, message) {
        var threadKey = message.orderId || "general";
        var existingThread = threads.find(function (t) { return t.key === threadKey; });
        if (!existingThread) {
            var order = message.orderId ? orders.find(function (o) { return o.id === message.orderId; }) : null;
            threads.push({
                key: threadKey,
                orderId: message.orderId,
                order: order,
                lastMessage: message,
                unreadCount: messages.filter(function (m) {
                    return (m.orderId || "general") === threadKey &&
                        !m.isRead &&
                        m.receiverId === (user === null || user === void 0 ? void 0 : user.id);
                }).length,
            });
        }
        else {
            if (new Date(message.createdAt) > new Date(existingThread.lastMessage.createdAt)) {
                existingThread.lastMessage = message;
            }
        }
        return threads;
    }, []);
    var currentMessages = selectedOrderId
        ? messages.filter(function (msg) { return msg.orderId === selectedOrderId; })
        : messages.filter(function (msg) { return !msg.orderId; });
    return (<div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
      <div className="max-w-6xl mx-auto">
        {/* Mobile: Show chat list or messages */}
        <div className="md:hidden">
          {!activeChat ? (<div className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Messages</h1>
                <div className="flex items-center space-x-2">
                  <Circle className={"h-3 w-3 ".concat(isConnected ? 'text-green-500' : 'text-red-500')}/>
                  <span className="text-sm text-muted-foreground">
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>

              {/* General Chat Option */}
              <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={function () {
                setSelectedOrderId(null);
                setActiveChat("general");
            }}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-primary"/>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">General Support</h3>
                      <p className="text-sm text-muted-foreground">
                        Chat with {(user === null || user === void 0 ? void 0 : user.role) === "admin" ? "customers" : "support team"}
                      </p>
                    </div>
                    {((_a = chatThreads.find(function (t) { return t.key === "general"; })) === null || _a === void 0 ? void 0 : _a.unreadCount) > 0 && (<Badge variant="destructive" className="h-5 w-5 rounded-full p-0 text-xs">
                        {(_b = chatThreads.find(function (t) { return t.key === "general"; })) === null || _b === void 0 ? void 0 : _b.unreadCount}
                      </Badge>)}
                  </div>
                </CardContent>
              </Card>

              {/* Order-specific chats */}
              {(user === null || user === void 0 ? void 0 : user.role) === "admin" && orders.length > 0 && (<div className="space-y-2">
                  <h2 className="font-semibold text-muted-foreground">Order Chats</h2>
                  {orders.map(function (order) {
                    var _a;
                    var thread = chatThreads.find(function (t) { return t.orderId === order.id; });
                    if (!thread)
                        return null;
                    return (<Card key={order.id} className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={function () {
                            setSelectedOrderId(order.id);
                            setActiveChat(order.id);
                        }}>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="h-6 w-6 text-blue-600"/>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium" data-testid={"text-order-chat-".concat(order.id)}>
                                {order.orderNumber}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {(_a = order.product) === null || _a === void 0 ? void 0 : _a.name} • {order.status}
                              </p>
                            </div>
                            {thread.unreadCount > 0 && (<Badge variant="destructive" className="h-5 w-5 rounded-full p-0 text-xs">
                                {thread.unreadCount}
                              </Badge>)}
                          </div>
                        </CardContent>
                      </Card>);
                })}
                </div>)}
            </div>) : (
        /* Mobile Chat View */
        <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="icon" onClick={function () { return setActiveChat(null); }} data-testid="button-back-to-chats">
                  <ArrowLeft className="h-4 w-4"/>
                </Button>
                <div className="flex-1">
                  <h1 className="font-semibold">
                    {selectedOrderId
                ? ((_c = orders.find(function (o) { return o.id === selectedOrderId; })) === null || _c === void 0 ? void 0 : _c.orderNumber) || "Order Chat"
                : "General Support"}
                  </h1>
                  <div className="flex items-center space-x-2">
                    <Circle className={"h-2 w-2 ".concat(isConnected ? 'text-green-500' : 'text-red-500')}/>
                    <span className="text-xs text-muted-foreground">
                      {isConnected ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <Card className="h-96">
                <CardContent className="p-0 h-full flex flex-col">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messagesLoading ? (<div className="text-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                      </div>) : currentMessages.length === 0 ? (<div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
                        <p className="text-muted-foreground">No messages yet</p>
                        <p className="text-sm text-muted-foreground">Start a conversation</p>
                      </div>) : (currentMessages.map(function (message) { return (<motion.div key={message.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={"flex ".concat(message.senderId === (user === null || user === void 0 ? void 0 : user.id) ? 'justify-end' : 'justify-start')}>
                          <div className={"max-w-xs lg:max-w-md ".concat(message.senderId === (user === null || user === void 0 ? void 0 : user.id)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted', " rounded-lg p-3 group relative")}>
                            {editingMessageId === message.id ? (<div className="space-y-2">
                                <Input value={editedMessage} onChange={function (e) { return setEditedMessage(e.target.value); }} className="text-sm bg-transparent border-muted-foreground/30" onKeyPress={function (e) {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            handleSaveEdit();
                        }
                        if (e.key === "Escape") {
                            handleCancelEdit();
                        }
                    }} autoFocus/>
                                <div className="flex justify-end space-x-1">
                                  <Button size="sm" variant="ghost" onClick={handleSaveEdit} className="h-6 px-2">
                                    <Check className="h-3 w-3"/>
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="h-6 px-2">
                                    <X className="h-3 w-3"/>
                                  </Button>
                                </div>
                              </div>) : (<>
                                <p className="text-sm" data-testid={"text-message-".concat(message.id)}>
                                  {message.message}
                                  {message.isEdited && (<span className="text-xs opacity-60 ml-2">(edited)</span>)}
                                </p>
                                <p className={"text-xs mt-1 ".concat(message.senderId === (user === null || user === void 0 ? void 0 : user.id)
                        ? 'text-primary-foreground/70'
                        : 'text-muted-foreground')}>
                                  {new Date(message.createdAt).toLocaleTimeString()}
                                </p>
                                {message.senderId === (user === null || user === void 0 ? void 0 : user.id) && (<div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                                    <Button size="sm" variant="ghost" onClick={function () { return handleEditMessage(message); }} className="h-6 w-6 p-0" title="Edit message">
                                      <Edit3 className="h-3 w-3"/>
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={function () { return handleDeleteMessage(message.id); }} className="h-6 w-6 p-0" title="Delete message">
                                      <Trash2 className="h-3 w-3"/>
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={function () { return handleUnsendMessage(message.id); }} className="h-6 w-6 p-0" title="Unsend message">
                                      <RotateCcw className="h-3 w-3"/>
                                    </Button>
                                  </div>)}
                              </>)}
                          </div>
                        </motion.div>); }))}
                    <div ref={messagesEndRef}/>
                  </div>

                  {/* Message Input */}
                  <div className="border-t p-4">
                    <div className="flex space-x-2">
                      <Input placeholder="Type a message..." value={newMessage} onChange={function (e) { return setNewMessage(e.target.value); }} onKeyPress={handleKeyPress} className="flex-1" data-testid="input-new-message"/>
                      <Button onClick={handleSendMessage} disabled={!newMessage.trim() || sendMessageMutation.isPending} data-testid="button-send-message">
                        <Send className="h-4 w-4"/>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>)}
        </div>

        {/* Desktop: Show both panels */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 h-[600px]">
          {/* Chat List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Messages
                <div className="flex items-center space-x-2">
                  <Circle className={"h-3 w-3 ".concat(isConnected ? 'text-green-500' : 'text-red-500')}/>
                  <span className="text-xs text-muted-foreground">
                    {isConnected ? 'Online' : 'Offline'}
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {(user === null || user === void 0 ? void 0 : user.role) === 'admin' && chatCustomers.length > 0 ? (
        /* Admin Customer List */
        <>
                    <div className="p-3 border-b">
                      <h3 className="font-medium text-sm">Customer Conversations</h3>
                    </div>
                    {chatCustomers.map(function (customerData) { return (<div key={customerData.customerId} className={"p-3 cursor-pointer hover:bg-accent/50 transition-colors border-b ".concat(selectedCustomerId === customerData.customerId ? 'bg-accent' : '')} onClick={function () {
                    setSelectedCustomerId(customerData.customerId);
                    setSelectedOrderId(null);
                    setActiveChat(customerData.customerId);
                }}>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-primary/10">
                              {customerData.customer.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium text-sm truncate">{customerData.customer.name}</h4>
                              <span className="text-xs text-muted-foreground">
                                {new Date(customerData.lastMessageTime).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              {customerData.lastMessage}
                            </p>
                          </div>
                          {customerData.unreadCount > 0 && (<Badge variant="destructive" className="h-5 w-5 rounded-full p-0 text-xs">
                              {customerData.unreadCount}
                            </Badge>)}
                        </div>
                      </div>); })}
                  </>) : (<div className={"p-3 cursor-pointer hover:bg-accent/50 transition-colors ".concat(selectedOrderId === null && selectedCustomerId === null ? 'bg-accent' : '')} onClick={function () {
                setSelectedOrderId(null);
                setSelectedCustomerId(null);
            }}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-primary"/>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">General Support</p>
                        <p className="text-xs text-muted-foreground">
                          {(user === null || user === void 0 ? void 0 : user.role) === "admin" ? "Customer support" : "Get help"}
                        </p>
                      </div>
                    </div>
                  </div>)}

                {/* Order Chats for Admin - Only show if no customers */}
                {(user === null || user === void 0 ? void 0 : user.role) === "admin" && chatCustomers.length === 0 && orders.map(function (order) {
            var _a;
            var thread = chatThreads.find(function (t) { return t.orderId === order.id; });
            if (!thread)
                return null;
            return (<div key={order.id} className={"p-3 cursor-pointer hover:bg-accent/50 transition-colors ".concat(selectedOrderId === order.id ? 'bg-accent' : '')} onClick={function () { return setSelectedOrderId(order.id); }}>
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {order.orderNumber.slice(-2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-sm" data-testid={"text-desktop-order-chat-".concat(order.id)}>
                            {order.orderNumber}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(_a = order.product) === null || _a === void 0 ? void 0 : _a.name}
                          </p>
                        </div>
                        {thread.unreadCount > 0 && (<Badge variant="destructive" className="h-4 w-4 rounded-full p-0 text-xs">
                            {thread.unreadCount}
                          </Badge>)}
                      </div>
                    </div>);
        })}
              </div>
            </CardContent>
          </Card>

          {/* Chat Messages */}
          <div className="col-span-2">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {selectedCustomerId
            ? "Chat with ".concat(((_d = chatCustomers.find(function (c) { return c.customerId === selectedCustomerId; })) === null || _d === void 0 ? void 0 : _d.customer.name) || 'Customer')
            : selectedOrderId
                ? ((_e = orders.find(function (o) { return o.id === selectedOrderId; })) === null || _e === void 0 ? void 0 : _e.orderNumber) || "Order Chat"
                : "General Support"}
                  </CardTitle>
                  <Button variant="ghost" size="icon" data-testid="button-chat-options">
                    <MoreVertical className="h-4 w-4"/>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 h-full flex flex-col">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messagesLoading ? (<div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-muted-foreground mt-2">Loading messages...</p>
                    </div>) : currentMessages.length === 0 ? (<div className="text-center py-8">
                      <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4"/>
                      <h3 className="font-semibold mb-2">No messages yet</h3>
                      <p className="text-muted-foreground">
                        Start a conversation by sending a message below
                      </p>
                    </div>) : (currentMessages.map(function (message) { return (<motion.div key={message.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={"flex ".concat(message.senderId === (user === null || user === void 0 ? void 0 : user.id) ? 'justify-end' : 'justify-start')}>
                        <div className={"max-w-sm lg:max-w-md ".concat(message.senderId === (user === null || user === void 0 ? void 0 : user.id)
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted', " rounded-lg p-3 group relative")}>
                          {editingMessageId === message.id ? (<div className="space-y-2">
                              <Input value={editedMessage} onChange={function (e) { return setEditedMessage(e.target.value); }} className="text-sm bg-transparent border-muted-foreground/30" onKeyPress={function (e) {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        handleSaveEdit();
                    }
                    if (e.key === "Escape") {
                        handleCancelEdit();
                    }
                }} autoFocus/>
                              <div className="flex justify-end space-x-1">
                                <Button size="sm" variant="ghost" onClick={handleSaveEdit} className="h-6 px-2">
                                  <Check className="h-3 w-3"/>
                                </Button>
                                <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="h-6 px-2">
                                  <X className="h-3 w-3"/>
                                </Button>
                              </div>
                            </div>) : (<>
                              <p className="text-sm" data-testid={"text-desktop-message-".concat(message.id)}>
                                {message.message}
                                {message.isEdited && (<span className="text-xs opacity-60 ml-2">(edited)</span>)}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <p className={"text-xs ".concat(message.senderId === (user === null || user === void 0 ? void 0 : user.id)
                    ? 'text-primary-foreground/70'
                    : 'text-muted-foreground')}>
                                  {new Date(message.createdAt).toLocaleTimeString()}
                                </p>
                                {message.senderId === (user === null || user === void 0 ? void 0 : user.id) && (<div className={"text-xs ".concat(message.isRead ? 'text-primary-foreground/70' : 'text-primary-foreground')}>
                                    {message.isRead ? 'Read' : 'Sent'}
                                  </div>)}
                              </div>
                              {message.senderId === (user === null || user === void 0 ? void 0 : user.id) && (<div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                                  <Button size="sm" variant="ghost" onClick={function () { return handleEditMessage(message); }} className="h-6 w-6 p-0">
                                    <Edit3 className="h-3 w-3"/>
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={function () { return handleDeleteMessage(message.id); }} className="h-6 w-6 p-0">
                                    <Trash2 className="h-3 w-3"/>
                                  </Button>
                                </div>)}
                            </>)}
                        </div>
                      </motion.div>); }))}
                  <div ref={messagesEndRef}/>
                </div>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex space-x-3">
                    <Input placeholder="Type your message..." value={newMessage} onChange={function (e) { return setNewMessage(e.target.value); }} onKeyPress={handleKeyPress} className="flex-1" data-testid="input-desktop-new-message"/>
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim() || sendMessageMutation.isPending} data-testid="button-desktop-send-message">
                      <Send className="h-4 w-4"/>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>);
}
