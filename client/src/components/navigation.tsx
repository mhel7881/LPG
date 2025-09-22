import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { getAuthHeaders } from "@/lib/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2 } from "lucide-react";
import {
  Flame,
  Moon,
  Sun,
  ShoppingCart,
  Bell,
  Home,
  Package,
  Settings,
  LogIn,
  User,
  Menu,
  X,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export function Navigation() {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const { items } = useCart();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch notifications for badge count
  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const response = await fetch("/api/notifications", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch notifications");
      return response.json();
    },
    enabled: !!user, // Only fetch if user is logged in
  });

  const unreadNotificationsCount = notifications.filter((n: any) => !n.read).length;

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PUT",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to mark notification as read");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  // Delete notification
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to delete notification");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const CustomerNavItems = () => (
    <>
      <Link href="/customer" data-testid="link-customer-dashboard">
        <Button 
          variant={location === "/customer" ? "default" : "ghost"} 
          size="sm"
          className="justify-start"
        >
          <Home className="h-4 w-4 mr-2" />
          Dashboard
        </Button>
      </Link>
      <Link href="/customer/products" data-testid="link-customer-products">
        <Button 
          variant={location === "/customer/products" ? "default" : "ghost"} 
          size="sm"
          className="justify-start"
        >
          <Package className="h-4 w-4 mr-2" />
          Products
        </Button>
      </Link>
      <Link href="/customer/orders" data-testid="link-customer-orders">
        <Button 
          variant={location === "/customer/orders" ? "default" : "ghost"} 
          size="sm"
          className="justify-start"
        >
          <Package className="h-4 w-4 mr-2" />
          Orders
        </Button>
      </Link>
      <Link href="/customer/schedules" data-testid="link-customer-schedules">
        <Button 
          variant={location === "/customer/schedules" ? "default" : "ghost"} 
          size="sm"
          className="justify-start"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Schedules
        </Button>
      </Link>
      <Link href="/customer/profile" data-testid="link-customer-profile">
        <Button 
          variant={location === "/customer/profile" ? "default" : "ghost"} 
          size="sm"
          className="justify-start"
        >
          <User className="h-4 w-4 mr-2" />
          Profile
        </Button>
      </Link>
    </>
  );

  const AdminNavItems = () => (
    <>
      <Link href="/admin" data-testid="link-admin-dashboard">
        <Button
          variant={location === "/admin" ? "default" : "ghost"}
          size="sm"
          className="justify-start"
        >
          <Home className="h-4 w-4 mr-2" />
          Dashboard
        </Button>
      </Link>
      <Link href="/admin/orders" data-testid="link-admin-orders">
        <Button
          variant={location === "/admin/orders" ? "default" : "ghost"}
          size="sm"
          className="justify-start"
        >
          <Package className="h-4 w-4 mr-2" />
          Orders
        </Button>
      </Link>
      <Link href="/admin/inventory" data-testid="link-admin-inventory">
        <Button
          variant={location === "/admin/inventory" ? "default" : "ghost"}
          size="sm"
          className="justify-start"
        >
          <Package className="h-4 w-4 mr-2" />
          Inventory
        </Button>
      </Link>
      <Link href="/admin/analytics" data-testid="link-admin-analytics">
        <Button
          variant={location === "/admin/analytics" ? "default" : "ghost"}
          size="sm"
          className="justify-start"
        >
          <Settings className="h-4 w-4 mr-2" />
          Analytics
        </Button>
      </Link>
      {/* <Link href="/admin/pos" data-testid="link-admin-pos">
        <Button
          variant={location === "/admin/pos" ? "default" : "ghost"}
          size="sm"
          className="justify-start"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          POS System
        </Button>
      </Link> */}
      <Link href="/admin/profile" data-testid="link-admin-profile">
        <Button
          variant={location === "/admin/profile" ? "default" : "ghost"}
          size="sm"
          className="justify-start"
        >
          <User className="h-4 w-4 mr-2" />
          Profile
        </Button>
      </Link>
    </>
  );

  if (!user) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between pr-6">
          <Link href="/" className="flex items-center space-x-2 ml-6" data-testid="link-home">
            <img src="/flame-logo.png" alt="GasFlow" className="h-6 w-6" />
            <span className="font-bold text-lg">GasFlow</span>
          </Link>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Link href="/login" data-testid="link-login">
              <Button size="sm">
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            </Link>
          </div>
        </div>
      </header>
    );
  }

  if (isMobile) {
    return (
      <>
        {/* Mobile Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="button-mobile-menu"
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
              <img src="/flame-logo.png" alt="GasFlow" className="h-6 w-6" />
              <span className="font-bold text-lg">GasFlow</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {user.role === "customer" && (
                <Link href="/customer/cart" data-testid="link-cart">
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="h-4 w-4" />
                    {cartItemCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                        data-testid="text-cart-count"
                      >
                        {cartItemCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
              )}
              <Link href="/customer/profile?tab=notifications" data-testid="link-notifications">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
                      <Bell className="h-4 w-4" />
                      {unreadNotificationsCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                          data-testid="badge-notification-count"
                        >
                          {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <div className="flex items-center justify-between p-2">
                      <h4 className="font-medium">Notifications</h4>
                      {unreadNotificationsCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {unreadNotificationsCount} new
                        </Badge>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    <ScrollArea className="h-80">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((notification: any) => (
                          <DropdownMenuItem
                            key={notification.id}
                            className={`flex flex-col items-start p-3 cursor-pointer ${
                              !notification.read ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                            }`}
                            onClick={(e) => {
                              // Prevent click if clicking on delete button
                              if ((e.target as HTMLElement).closest('[data-delete-button]')) {
                                return;
                              }
                              if (!notification.read) {
                                markAsReadMutation.mutate(notification.id);
                              }
                            }}
                          >
                            <div className="flex items-start justify-between w-full">
                              <div className="flex-1">
                                <p className="text-sm font-medium">{notification.title}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(notification.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2 ml-2">
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotificationMutation.mutate(notification.id);
                                  }}
                                  disabled={deleteNotificationMutation.isPending}
                                  data-delete-button
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </DropdownMenuItem>
                        ))
                      )}
                    </ScrollArea>
                    {notifications.length > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/customer/profile?tab=notifications" className="w-full text-center">
                            View all notifications
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </Link>
              <Avatar className="h-8 w-8" data-testid="avatar-user">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 top-0 z-40 bg-background/80 backdrop-blur-sm">
            <div className="fixed left-0 top-0 h-full w-64 bg-card border-r p-4 space-y-2 slide-in pt-16">
              {user.role === "admin" ? <AdminNavItems /> : <CustomerNavItems />}
              
              <div className="pt-4 border-t space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className="w-full justify-start"
                  data-testid="button-mobile-theme-toggle"
                >
                  {theme === "dark" ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="w-full justify-start text-destructive hover:text-destructive"
                  data-testid="button-logout"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t">
          <div className="flex justify-around py-2">
            {user.role === "customer" ? (
              <>
                <Link href="/customer" data-testid="link-mobile-dashboard">
                  <Button
                    variant={location === "/customer" ? "default" : "ghost"}
                    size="sm"
                    className="flex flex-col h-auto py-2 px-4"
                  >
                    <Home className="h-4 w-4 mb-1" />
                    <span className="text-xs">Home</span>
                  </Button>
                </Link>
                <Link href="/customer/products" data-testid="link-mobile-products">
                  <Button
                    variant={location === "/customer/products" ? "default" : "ghost"}
                    size="sm"
                    className="flex flex-col h-auto py-2 px-4"
                  >
                    <Package className="h-4 w-4 mb-1" />
                    <span className="text-xs">Products</span>
                  </Button>
                </Link>
                <Link href="/customer/orders" data-testid="link-mobile-orders">
                  <Button
                    variant={location === "/customer/orders" ? "default" : "ghost"}
                    size="sm"
                    className="flex flex-col h-auto py-2 px-4"
                  >
                    <Package className="h-4 w-4 mb-1" />
                    <span className="text-xs">Orders</span>
                  </Button>
                </Link>
                <Link href="/customer/profile" data-testid="link-mobile-profile">
                  <Button
                    variant={location === "/customer/profile" ? "default" : "ghost"}
                    size="sm"
                    className="flex flex-col h-auto py-2 px-4"
                  >
                    <User className="h-4 w-4 mb-1" />
                    <span className="text-xs">Profile</span>
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/admin" data-testid="link-mobile-admin-dashboard">
                  <Button
                    variant={location === "/admin" ? "default" : "ghost"}
                    size="sm"
                    className="flex flex-col h-auto py-2 px-4"
                  >
                    <Home className="h-4 w-4 mb-1" />
                    <span className="text-xs">Dashboard</span>
                  </Button>
                </Link>
                <Link href="/admin/orders" data-testid="link-mobile-admin-orders">
                  <Button
                    variant={location === "/admin/orders" ? "default" : "ghost"}
                    size="sm"
                    className="flex flex-col h-auto py-2 px-4"
                  >
                    <Package className="h-4 w-4 mb-1" />
                    <span className="text-xs">Orders</span>
                  </Button>
                </Link>
                <Link href="/admin/inventory" data-testid="link-mobile-admin-inventory">
                  <Button
                    variant={location === "/admin/inventory" ? "default" : "ghost"}
                    size="sm"
                    className="flex flex-col h-auto py-2 px-4"
                  >
                    <Package className="h-4 w-4 mb-1" />
                    <span className="text-xs">Inventory</span>
                  </Button>
                </Link>
                <Link href="/admin/profile" data-testid="link-mobile-admin-profile">
                  <Button
                    variant={location === "/admin/profile" ? "default" : "ghost"}
                    size="sm"
                    className="flex flex-col h-auto py-2 px-4"
                  >
                    <User className="h-4 w-4 mb-1" />
                    <span className="text-xs">Profile</span>
                  </Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </>
    );
  }

  // Desktop Navigation
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2 " data-testid="link-desktop-home">
            <img src="/flame-logo.png" alt="GasFlow" className="h-6 w-6 ml-3" />
            <span className="font-bold text-lg">GasFlow</span>
          </Link>
          
          <nav className="flex items-center space-x-2">
            {user.role === "admin" ? <AdminNavItems /> : <CustomerNavItems />}
          </nav>
        </div>
        
        <div className="flex items-center space-x-2">
          {user.role === "customer" && (
            <Link href="/customer/cart" data-testid="link-desktop-cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-4 w-4" />
                {cartItemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                    data-testid="text-desktop-cart-count"
                  >
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </Link>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" data-testid="button-desktop-notifications">
                <Bell className="h-4 w-4" />
                {unreadNotificationsCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                    data-testid="badge-desktop-notification-count"
                  >
                    {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between p-2">
                <h4 className="font-medium">Notifications</h4>
                {unreadNotificationsCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {unreadNotificationsCount} new
                  </Badge>
                )}
              </div>
              <DropdownMenuSeparator />
              <ScrollArea className="h-80">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification: any) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className={`flex flex-col items-start p-3 cursor-pointer ${
                        !notification.read ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                      }`}
                      onClick={(e) => {
                        // Prevent click if clicking on delete button
                        if ((e.target as HTMLElement).closest('[data-delete-button]')) {
                          return;
                        }
                        if (!notification.read) {
                          markAsReadMutation.mutate(notification.id);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between w-full">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-2">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotificationMutation.mutate(notification.id);
                            }}
                            disabled={deleteNotificationMutation.isPending}
                            data-delete-button
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </ScrollArea>
              {notifications.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/customer/profile?tab=notifications" className="w-full text-center">
                      View all notifications
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            data-testid="button-desktop-theme-toggle"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Avatar className="h-8 w-8" data-testid="avatar-desktop-user">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-destructive hover:text-destructive"
            data-testid="button-desktop-logout"
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
