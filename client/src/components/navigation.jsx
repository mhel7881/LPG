import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Moon, Sun, ShoppingCart, Bell, Home, Package, Settings, LogIn, User, Menu, X, Calendar } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
export function Navigation() {
    var location = useLocation()[0];
    var _a = useTheme(), theme = _a.theme, setTheme = _a.setTheme;
    var _b = useAuth(), user = _b.user, logout = _b.logout;
    var items = useCart().items;
    var isMobile = useIsMobile();
    var _c = useState(false), mobileMenuOpen = _c[0], setMobileMenuOpen = _c[1];
    var toggleTheme = function () {
        setTheme(theme === "dark" ? "light" : "dark");
    };
    var cartItemCount = items.reduce(function (sum, item) { return sum + item.quantity; }, 0);
    var CustomerNavItems = function () { return (<>
      <Link href="/customer" data-testid="link-customer-dashboard">
        <Button variant={location === "/customer" ? "default" : "ghost"} size="sm" className="justify-start">
          <Home className="h-4 w-4 mr-2"/>
          Dashboard
        </Button>
      </Link>
      <Link href="/customer/products" data-testid="link-customer-products">
        <Button variant={location === "/customer/products" ? "default" : "ghost"} size="sm" className="justify-start">
          <Package className="h-4 w-4 mr-2"/>
          Products
        </Button>
      </Link>
      <Link href="/customer/orders" data-testid="link-customer-orders">
        <Button variant={location === "/customer/orders" ? "default" : "ghost"} size="sm" className="justify-start">
          <Package className="h-4 w-4 mr-2"/>
          Orders
        </Button>
      </Link>
      <Link href="/customer/schedules" data-testid="link-customer-schedules">
        <Button variant={location === "/customer/schedules" ? "default" : "ghost"} size="sm" className="justify-start">
          <Calendar className="h-4 w-4 mr-2"/>
          Schedules
        </Button>
      </Link>
      <Link href="/customer/profile" data-testid="link-customer-profile">
        <Button variant={location === "/customer/profile" ? "default" : "ghost"} size="sm" className="justify-start">
          <User className="h-4 w-4 mr-2"/>
          Profile
        </Button>
      </Link>
    </>); };
    var AdminNavItems = function () { return (<>
      <Link href="/admin" data-testid="link-admin-dashboard">
        <Button variant={location === "/admin" ? "default" : "ghost"} size="sm" className="justify-start">
          <Home className="h-4 w-4 mr-2"/>
          Dashboard
        </Button>
      </Link>
      <Link href="/admin/orders" data-testid="link-admin-orders">
        <Button variant={location === "/admin/orders" ? "default" : "ghost"} size="sm" className="justify-start">
          <Package className="h-4 w-4 mr-2"/>
          Orders
        </Button>
      </Link>
      <Link href="/admin/inventory" data-testid="link-admin-inventory">
        <Button variant={location === "/admin/inventory" ? "default" : "ghost"} size="sm" className="justify-start">
          <Package className="h-4 w-4 mr-2"/>
          Inventory
        </Button>
      </Link>
      <Link href="/admin/analytics" data-testid="link-admin-analytics">
        <Button variant={location === "/admin/analytics" ? "default" : "ghost"} size="sm" className="justify-start">
          <Settings className="h-4 w-4 mr-2"/>
          Analytics
        </Button>
      </Link>
      <Link href="/admin/pos" data-testid="link-admin-pos">
        <Button variant={location === "/admin/pos" ? "default" : "ghost"} size="sm" className="justify-start">
          <ShoppingCart className="h-4 w-4 mr-2"/>
          POS System
        </Button>
      </Link>
    </>); };
    if (!user) {
        return (<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
            <img src="/flame-logo.png" alt="GasFlow" className="h-6 w-6"/>
            <span className="font-bold text-lg">GasFlow</span>
          </Link>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} data-testid="button-theme-toggle">
              {theme === "dark" ? <Sun className="h-4 w-4"/> : <Moon className="h-4 w-4"/>}
            </Button>
            <Link href="/login" data-testid="link-login">
              <Button size="sm">
                <LogIn className="h-4 w-4 mr-2"/>
                Login
              </Button>
            </Link>
          </div>
        </div>
      </header>);
    }
    if (isMobile) {
        return (<>
        {/* Mobile Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={function () { return setMobileMenuOpen(!mobileMenuOpen); }} data-testid="button-mobile-menu">
                {mobileMenuOpen ? <X className="h-4 w-4"/> : <Menu className="h-4 w-4"/>}
              </Button>
              <img src="/flame-logo.png" alt="GasFlow" className="h-6 w-6"/>
              <span className="font-bold text-lg">GasFlow</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {user.role === "customer" && (<Link href="/customer/cart" data-testid="link-cart">
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="h-4 w-4"/>
                    {cartItemCount > 0 && (<Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs" data-testid="text-cart-count">
                        {cartItemCount}
                      </Badge>)}
                  </Button>
                </Link>)}
              <Button variant="ghost" size="icon" data-testid="button-notifications">
                <Bell className="h-4 w-4"/>
              </Button>
              <Avatar className="h-8 w-8" data-testid="avatar-user">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (<div className="fixed inset-0 top-14 z-40 bg-background/80 backdrop-blur-sm">
            <div className="fixed left-0 top-14 h-full w-64 bg-card border-r p-4 space-y-2 slide-in">
              {user.role === "admin" ? <AdminNavItems /> : <CustomerNavItems />}
              
              <div className="pt-4 border-t space-y-2">
                <Button variant="ghost" size="sm" onClick={toggleTheme} className="w-full justify-start" data-testid="button-mobile-theme-toggle">
                  {theme === "dark" ? <Sun className="h-4 w-4 mr-2"/> : <Moon className="h-4 w-4 mr-2"/>}
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </Button>
                <Button variant="ghost" size="sm" onClick={logout} className="w-full justify-start text-destructive hover:text-destructive" data-testid="button-logout">
                  <LogIn className="h-4 w-4 mr-2"/>
                  Logout
                </Button>
              </div>
            </div>
          </div>)}

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t">
          <div className="flex justify-around py-2">
            {user.role === "customer" ? (<>
                <Link href="/customer" data-testid="link-mobile-dashboard">
                  <Button variant={location === "/customer" ? "default" : "ghost"} size="sm" className="flex flex-col h-auto py-2 px-4">
                    <Home className="h-4 w-4 mb-1"/>
                    <span className="text-xs">Home</span>
                  </Button>
                </Link>
                <Link href="/customer/products" data-testid="link-mobile-products">
                  <Button variant={location === "/customer/products" ? "default" : "ghost"} size="sm" className="flex flex-col h-auto py-2 px-4">
                    <Package className="h-4 w-4 mb-1"/>
                    <span className="text-xs">Products</span>
                  </Button>
                </Link>
                <Link href="/customer/orders" data-testid="link-mobile-orders">
                  <Button variant={location === "/customer/orders" ? "default" : "ghost"} size="sm" className="flex flex-col h-auto py-2 px-4">
                    <Package className="h-4 w-4 mb-1"/>
                    <span className="text-xs">Orders</span>
                  </Button>
                </Link>
                <Link href="/customer/profile" data-testid="link-mobile-profile">
                  <Button variant={location === "/customer/profile" ? "default" : "ghost"} size="sm" className="flex flex-col h-auto py-2 px-4">
                    <User className="h-4 w-4 mb-1"/>
                    <span className="text-xs">Profile</span>
                  </Button>
                </Link>
              </>) : (<>
                <Link href="/admin" data-testid="link-mobile-admin-dashboard">
                  <Button variant={location === "/admin" ? "default" : "ghost"} size="sm" className="flex flex-col h-auto py-2 px-4">
                    <Home className="h-4 w-4 mb-1"/>
                    <span className="text-xs">Dashboard</span>
                  </Button>
                </Link>
                <Link href="/admin/orders" data-testid="link-mobile-admin-orders">
                  <Button variant={location === "/admin/orders" ? "default" : "ghost"} size="sm" className="flex flex-col h-auto py-2 px-4">
                    <Package className="h-4 w-4 mb-1"/>
                    <span className="text-xs">Orders</span>
                  </Button>
                </Link>
                <Link href="/admin/inventory" data-testid="link-mobile-admin-inventory">
                  <Button variant={location === "/admin/inventory" ? "default" : "ghost"} size="sm" className="flex flex-col h-auto py-2 px-4">
                    <Package className="h-4 w-4 mb-1"/>
                    <span className="text-xs">Inventory</span>
                  </Button>
                </Link>
                <Link href="/admin/analytics" data-testid="link-mobile-admin-analytics">
                  <Button variant={location === "/admin/analytics" ? "default" : "ghost"} size="sm" className="flex flex-col h-auto py-2 px-4">
                    <Settings className="h-4 w-4 mb-1"/>
                    <span className="text-xs">Analytics</span>
                  </Button>
                </Link>
              </>)}
          </div>
        </nav>
      </>);
    }
    // Desktop Navigation
    return (<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2" data-testid="link-desktop-home">
            <img src="/flame-logo.png" alt="GasFlow" className="h-6 w-6"/>
            <span className="font-bold text-lg">GasFlow</span>
          </Link>
          
          <nav className="flex items-center space-x-2">
            {user.role === "admin" ? <AdminNavItems /> : <CustomerNavItems />}
          </nav>
        </div>
        
        <div className="flex items-center space-x-2">
          {user.role === "customer" && (<Link href="/customer/cart" data-testid="link-desktop-cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-4 w-4"/>
                {cartItemCount > 0 && (<Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs" data-testid="text-desktop-cart-count">
                    {cartItemCount}
                  </Badge>)}
              </Button>
            </Link>)}
          <Button variant="ghost" size="icon" data-testid="button-desktop-notifications">
            <Bell className="h-4 w-4"/>
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleTheme} data-testid="button-desktop-theme-toggle">
            {theme === "dark" ? <Sun className="h-4 w-4"/> : <Moon className="h-4 w-4"/>}
          </Button>
          <Avatar className="h-8 w-8" data-testid="avatar-desktop-user">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Button variant="ghost" size="sm" onClick={logout} className="text-destructive hover:text-destructive" data-testid="button-desktop-logout">
            Logout
          </Button>
        </div>
      </div>
    </header>);
}
