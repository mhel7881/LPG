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
import { 
  Send, 
  MessageSquare, 
  Users, 
  Circle,
  ArrowLeft,
  MoreVertical,
  Edit3,
  Trash2,
  Check,
  X,
  RotateCcw
} from "lucide-react";

interface ChatMessage {
  id: string;
  senderId: string;
  receiverId?: string;
  orderId?: string;
  message: string;
  type: string;
  isRead: boolean;
  isEdited?: boolean;
  isDeleted?: boolean;
  editedAt?: string;
  deletedAt?: string;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    role: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  status: string;
  product?: {
    name: string;
  };
}

interface Customer {
  customerId: string;
  customer: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export default function ChatPage() {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedMessage, setEditedMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuth();
  const { isConnected, sendMessage, lastMessage } = useWebSocket();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch orders for context
  const { data: orders = [] } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      const response = await fetch("/api/orders", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch orders");
      return response.json();
    },
  });

  // Fetch customers for admin chat list (only for admin users)
  const { data: chatCustomers = [] } = useQuery({
    queryKey: ["/api/chat/customers"],
    queryFn: async () => {
      if (user?.role !== 'admin') return [];
      const response = await fetch("/api/chat/customers", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch chat customers");
      return response.json();
    },
    enabled: user?.role === 'admin',
  });

  // Fetch chat messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/chat/messages", selectedOrderId, selectedCustomerId],
    queryFn: async () => {
      let url = "/api/chat/messages";
      
      if (user?.role === 'admin' && selectedCustomerId) {
        url = `/api/chat/conversation/${selectedCustomerId}`;
      } else if (selectedOrderId) {
        url = `/api/chat/messages?orderId=${selectedOrderId}`;
      }
      
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json();
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: {
      receiverId?: string;
      orderId?: string;
      message: string;
    }) => {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(messageData),
      });
      if (!response.ok) throw new Error("Failed to send message");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      setNewMessage("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Mark messages as read
  const markAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/chat/messages/read", {
        method: "POST",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to mark messages as read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
    },
  });

  // Edit message mutation
  const editMessageMutation = useMutation({
    mutationFn: async ({ messageId, message }: { messageId: string; message: string }) => {
      const response = await fetch(`/api/chat/messages/${messageId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ message }),
      });
      if (!response.ok) throw new Error("Failed to edit message");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      setEditingMessageId(null);
      setEditedMessage("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to edit message",
        variant: "destructive",
      });
    },
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const response = await fetch(`/api/chat/messages/${messageId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to delete message");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete message",
        variant: "destructive",
      });
    },
  });

  // Unsend message mutation
  const unsendMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const response = await fetch(`/api/chat/messages/${messageId}/unsend`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to unsend message");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      toast({
        title: "Success",
        description: "Message unsent successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to unsend message",
        variant: "destructive",
      });
    },
  });

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage?.type === "new_message") {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      
      // Show notification if not in active chat
      if (lastMessage.message.senderId !== user?.id) {
        toast({
          title: "New Message",
          description: lastMessage.message.message.slice(0, 50) + "...",
        });
      }
    }
  }, [lastMessage, queryClient, user?.id, toast]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read when viewing
  useEffect(() => {
    if (messages.length > 0 && activeChat) {
      const unreadMessages = messages.filter((msg: ChatMessage) => 
        !msg.isRead && msg.receiverId === user?.id
      );
      if (unreadMessages.length > 0) {
        markAsReadMutation.mutate();
      }
    }
  }, [messages, activeChat, user?.id]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const messageData: any = {
      message: newMessage.trim(),
    };

    // For admin chatting with specific customer
    if (user?.role === 'admin' && selectedCustomerId) {
      messageData.receiverId = selectedCustomerId;
    } else if (selectedOrderId) {
      messageData.orderId = selectedOrderId;
      
      // Find the order to get recipient
      const order = orders.find((o: Order) => o.id === selectedOrderId);
      if (order && user?.role === "admin") {
        messageData.receiverId = order.customerId;
      }
    } else if (user?.role === "customer") {
      // Customer sending to admin - find admin user
      // For now, we'll use a placeholder admin ID
      messageData.receiverId = "admin";
    }

    // Send via WebSocket for real-time delivery
    if (isConnected) {
      sendMessage({
        type: "chat_message",
        senderId: user?.id,
        receiverId: messageData.receiverId,
        orderId: messageData.orderId,
        message: messageData.message,
      });
    }

    // Also send via HTTP for persistence
    sendMessageMutation.mutate(messageData);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEditMessage = (message: ChatMessage) => {
    setEditingMessageId(message.id);
    setEditedMessage(message.message);
  };

  const handleSaveEdit = () => {
    if (!editedMessage.trim() || !editingMessageId) return;
    
    editMessageMutation.mutate({
      messageId: editingMessageId,
      message: editedMessage.trim(),
    });
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditedMessage("");
  };

  const handleDeleteMessage = (messageId: string) => {
    if (confirm("Are you sure you want to delete this message?")) {
      deleteMessageMutation.mutate(messageId);
    }
  };

  const handleUnsendMessage = (messageId: string) => {
    if (confirm("Are you sure you want to unsend this message? This will permanently remove it for everyone.")) {
      unsendMessageMutation.mutate(messageId);
    }
  };

  // Get unique chat threads
  const chatThreads = messages.reduce((threads: any[], message: ChatMessage) => {
    const threadKey = message.orderId || "general";
    const existingThread = threads.find(t => t.key === threadKey);
    
    if (!existingThread) {
      const order = message.orderId ? orders.find((o: Order) => o.id === message.orderId) : null;
      threads.push({
        key: threadKey,
        orderId: message.orderId,
        order,
        lastMessage: message,
        unreadCount: messages.filter((m: ChatMessage) => 
          (m.orderId || "general") === threadKey && 
          !m.isRead && 
          m.receiverId === user?.id
        ).length,
      });
    } else {
      if (new Date(message.createdAt) > new Date(existingThread.lastMessage.createdAt)) {
        existingThread.lastMessage = message;
      }
    }
    
    return threads;
  }, []);

  const currentMessages = selectedOrderId 
    ? messages.filter((msg: ChatMessage) => msg.orderId === selectedOrderId)
    : messages.filter((msg: ChatMessage) => !msg.orderId);

  return (
    <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
      <div className="max-w-6xl mx-auto">
        {/* Mobile: Show chat list or messages */}
        <div className="md:hidden">
          {!activeChat ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Messages</h1>
                <div className="flex items-center space-x-2">
                  <Circle className={`h-3 w-3 ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
                  <span className="text-sm text-muted-foreground">
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>

              {/* General Chat Option */}
              <Card 
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => {
                  setSelectedOrderId(null);
                  setActiveChat("general");
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">General Support</h3>
                      <p className="text-sm text-muted-foreground">
                        Chat with {user?.role === "admin" ? "customers" : "support team"}
                      </p>
                    </div>
                    {chatThreads.find((t: any) => t.key === "general")?.unreadCount > 0 && (
                      <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 text-xs">
                        {chatThreads.find((t: any) => t.key === "general")?.unreadCount}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Order-specific chats */}
              {user?.role === "admin" && orders.length > 0 && (
                <div className="space-y-2">
                  <h2 className="font-semibold text-muted-foreground">Order Chats</h2>
                  {orders.map((order: Order) => {
                    const thread = chatThreads.find((t: any) => t.orderId === order.id);
                    if (!thread) return null;

                    return (
                      <Card 
                        key={order.id}
                        className="cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => {
                          setSelectedOrderId(order.id);
                          setActiveChat(order.id);
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium" data-testid={`text-order-chat-${order.id}`}>
                                {order.orderNumber}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {order.product?.name} • {order.status}
                              </p>
                            </div>
                            {thread.unreadCount > 0 && (
                              <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 text-xs">
                                {thread.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Mobile Chat View */
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setActiveChat(null)}
                  data-testid="button-back-to-chats"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <h1 className="font-semibold">
                    {selectedOrderId 
                      ? orders.find((o: Order) => o.id === selectedOrderId)?.orderNumber || "Order Chat"
                      : "General Support"
                    }
                  </h1>
                  <div className="flex items-center space-x-2">
                    <Circle className={`h-2 w-2 ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
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
                    {messagesLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                      </div>
                    ) : currentMessages.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No messages yet</p>
                        <p className="text-sm text-muted-foreground">Start a conversation</p>
                      </div>
                    ) : (
                      currentMessages.map((message: ChatMessage) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md ${
                            message.senderId === user?.id 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          } rounded-lg p-3 group relative`}>
                            {editingMessageId === message.id ? (
                              <div className="space-y-2">
                                <Input
                                  value={editedMessage}
                                  onChange={(e) => setEditedMessage(e.target.value)}
                                  className="text-sm bg-transparent border-muted-foreground/30"
                                  onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      handleSaveEdit();
                                    }
                                    if (e.key === "Escape") {
                                      handleCancelEdit();
                                    }
                                  }}
                                  autoFocus
                                />
                                <div className="flex justify-end space-x-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleSaveEdit}
                                    className="h-6 px-2"
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleCancelEdit}
                                    className="h-6 px-2"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="text-sm" data-testid={`text-message-${message.id}`}>
                                  {message.message}
                                  {message.isEdited && (
                                    <span className="text-xs opacity-60 ml-2">(edited)</span>
                                  )}
                                </p>
                                <p className={`text-xs mt-1 ${
                                  message.senderId === user?.id 
                                    ? 'text-primary-foreground/70' 
                                    : 'text-muted-foreground'
                                }`}>
                                  {new Date(message.createdAt).toLocaleTimeString()}
                                </p>
                                {message.senderId === user?.id && (
                                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleEditMessage(message)}
                                      className="h-6 w-6 p-0"
                                      title="Edit message"
                                    >
                                      <Edit3 className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDeleteMessage(message.id)}
                                      className="h-6 w-6 p-0"
                                      title="Delete message"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleUnsendMessage(message.id)}
                                      className="h-6 w-6 p-0"
                                      title="Unsend message"
                                    >
                                      <RotateCcw className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </motion.div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="border-t p-4">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1"
                        data-testid="input-new-message"
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sendMessageMutation.isPending}
                        data-testid="button-send-message"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Desktop: Show both panels */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 h-[600px]">
          {/* Chat List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Messages
                <div className="flex items-center space-x-2">
                  <Circle className={`h-3 w-3 ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
                  <span className="text-xs text-muted-foreground">
                    {isConnected ? 'Online' : 'Offline'}
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {user?.role === 'admin' && chatCustomers.length > 0 ? (
                  /* Admin Customer List */
                  <>
                    <div className="p-3 border-b">
                      <h3 className="font-medium text-sm">Customer Conversations</h3>
                    </div>
                    {chatCustomers.map((customerData: Customer) => (
                      <div 
                        key={customerData.customerId}
                        className={`p-3 cursor-pointer hover:bg-accent/50 transition-colors border-b ${
                          selectedCustomerId === customerData.customerId ? 'bg-accent' : ''
                        }`}
                        onClick={() => {
                          setSelectedCustomerId(customerData.customerId);
                          setSelectedOrderId(null);
                          setActiveChat(customerData.customerId);
                        }}
                      >
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
                          {customerData.unreadCount > 0 && (
                            <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 text-xs">
                              {customerData.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div 
                    className={`p-3 cursor-pointer hover:bg-accent/50 transition-colors ${
                      selectedOrderId === null && selectedCustomerId === null ? 'bg-accent' : ''
                    }`}
                    onClick={() => {
                      setSelectedOrderId(null);
                      setSelectedCustomerId(null);
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">General Support</p>
                        <p className="text-xs text-muted-foreground">
                          {user?.role === "admin" ? "Customer support" : "Get help"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Chats for Admin - Only show if no customers */}
                {user?.role === "admin" && chatCustomers.length === 0 && orders.map((order: Order) => {
                  const thread = chatThreads.find((t: any) => t.orderId === order.id);
                  if (!thread) return null;

                  return (
                    <div 
                      key={order.id}
                      className={`p-3 cursor-pointer hover:bg-accent/50 transition-colors ${
                        selectedOrderId === order.id ? 'bg-accent' : ''
                      }`}
                      onClick={() => setSelectedOrderId(order.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {order.orderNumber.slice(-2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-sm" data-testid={`text-desktop-order-chat-${order.id}`}>
                            {order.orderNumber}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.product?.name}
                          </p>
                        </div>
                        {thread.unreadCount > 0 && (
                          <Badge variant="destructive" className="h-4 w-4 rounded-full p-0 text-xs">
                            {thread.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
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
                      ? `Chat with ${chatCustomers.find((c: Customer) => c.customerId === selectedCustomerId)?.customer.name || 'Customer'}`
                      : selectedOrderId 
                        ? orders.find((o: Order) => o.id === selectedOrderId)?.orderNumber || "Order Chat"
                        : "General Support"
                    }
                  </CardTitle>
                  <Button variant="ghost" size="icon" data-testid="button-chat-options">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 h-full flex flex-col">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messagesLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-muted-foreground mt-2">Loading messages...</p>
                    </div>
                  ) : currentMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">No messages yet</h3>
                      <p className="text-muted-foreground">
                        Start a conversation by sending a message below
                      </p>
                    </div>
                  ) : (
                    currentMessages.map((message: ChatMessage) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-sm lg:max-w-md ${
                          message.senderId === user?.id 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        } rounded-lg p-3 group relative`}>
                          {editingMessageId === message.id ? (
                            <div className="space-y-2">
                              <Input
                                value={editedMessage}
                                onChange={(e) => setEditedMessage(e.target.value)}
                                className="text-sm bg-transparent border-muted-foreground/30"
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleSaveEdit();
                                  }
                                  if (e.key === "Escape") {
                                    handleCancelEdit();
                                  }
                                }}
                                autoFocus
                              />
                              <div className="flex justify-end space-x-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={handleSaveEdit}
                                  className="h-6 px-2"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={handleCancelEdit}
                                  className="h-6 px-2"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="text-sm" data-testid={`text-desktop-message-${message.id}`}>
                                {message.message}
                                {message.isEdited && (
                                  <span className="text-xs opacity-60 ml-2">(edited)</span>
                                )}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <p className={`text-xs ${
                                  message.senderId === user?.id 
                                    ? 'text-primary-foreground/70' 
                                    : 'text-muted-foreground'
                                }`}>
                                  {new Date(message.createdAt).toLocaleTimeString()}
                                </p>
                                {message.senderId === user?.id && (
                                  <div className={`text-xs ${
                                    message.isRead ? 'text-primary-foreground/70' : 'text-primary-foreground'
                                  }`}>
                                    {message.isRead ? 'Read' : 'Sent'}
                                  </div>
                                )}
                              </div>
                              {message.senderId === user?.id && (
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEditMessage(message)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteMessage(message.id)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex space-x-3">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                      data-testid="input-desktop-new-message"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendMessageMutation.isPending}
                      data-testid="button-desktop-send-message"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
