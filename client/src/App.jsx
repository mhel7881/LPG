import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { CartProvider } from "@/hooks/use-cart";
import { WebSocketProvider } from "@/hooks/use-websocket";
import { OfflineProvider } from "@/hooks/use-offline";
import { Navigation } from "@/components/navigation";
import SplashScreen from "@/components/splash-screen";
// Pages
import LoginPage from "@/pages/login";
import EmailVerificationPage from "@/pages/email-verification";
import CustomerDashboard from "@/pages/customer/dashboard";
import CustomerProducts from "@/pages/customer/products";
import CustomerCart from "@/pages/customer/cart";
import CustomerOrders from "@/pages/customer/orders";
import CustomerSchedules from "@/pages/customer/schedules";
import CustomerProfile from "@/pages/customer/profile";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminOrders from "@/pages/admin/orders";
import AdminInventory from "@/pages/admin/inventory";
import AdminAnalytics from "@/pages/admin/analytics";
import AdminPOS from "@/pages/admin/pos";
import ChatPage from "@/pages/chat";
import NotFound from "@/pages/not-found";
// Auth Guard Component
function ProtectedRoute(_a) {
    var children = _a.children, allowedRoles = _a.allowedRoles;
    var _b = useAuth(), user = _b.user, isLoading = _b.isLoading;
    if (isLoading) {
        return (<div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>);
    }
    if (!user) {
        return <Redirect to="/login"/>;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Redirect to={user.role === "admin" ? "/admin" : "/customer"}/>;
    }
    return <>{children}</>;
}
// Public Route (redirects authenticated users)
function PublicRoute(_a) {
    var children = _a.children;
    var _b = useAuth(), user = _b.user, isLoading = _b.isLoading;
    if (isLoading) {
        return (<div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>);
    }
    if (user) {
        return <Redirect to={user.role === "admin" ? "/admin" : "/customer"}/>;
    }
    return <>{children}</>;
}
function AppRoutes() {
    return (<div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <AnimatePresence mode="wait">
          <Switch>
            {/* Public Routes */}
            <Route path="/login">
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            </Route>

            <Route path="/verify-email">
              <EmailVerificationPage />
            </Route>

            {/* Root redirect */}
            <Route path="/">
              {function () {
            var user = useAuth().user;
            if (user) {
                return <Redirect to={user.role === "admin" ? "/admin" : "/customer"}/>;
            }
            return <Redirect to="/login"/>;
        }}
            </Route>

            {/* Customer Routes */}
            <Route path="/customer">
              <ProtectedRoute allowedRoles={["customer"]}>
                <CustomerDashboard />
              </ProtectedRoute>
            </Route>

            <Route path="/customer/products">
              <ProtectedRoute allowedRoles={["customer"]}>
                <CustomerProducts />
              </ProtectedRoute>
            </Route>

            <Route path="/customer/cart">
              <ProtectedRoute allowedRoles={["customer"]}>
                <CustomerCart />
              </ProtectedRoute>
            </Route>

            <Route path="/customer/orders">
              <ProtectedRoute allowedRoles={["customer"]}>
                <CustomerOrders />
              </ProtectedRoute>
            </Route>

            <Route path="/customer/schedules">
              <ProtectedRoute allowedRoles={["customer"]}>
                <CustomerSchedules />
              </ProtectedRoute>
            </Route>

            <Route path="/customer/profile">
              <ProtectedRoute allowedRoles={["customer"]}>
                <CustomerProfile />
              </ProtectedRoute>
            </Route>

            {/* Admin Routes */}
            <Route path="/admin">
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            </Route>

            <Route path="/admin/orders">
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminOrders />
              </ProtectedRoute>
            </Route>

            <Route path="/admin/inventory">
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminInventory />
              </ProtectedRoute>
            </Route>

            <Route path="/admin/analytics">
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminAnalytics />
              </ProtectedRoute>
            </Route>

            <Route path="/admin/pos">
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminPOS />
              </ProtectedRoute>
            </Route>

            {/* Chat Route (available to both roles) */}
            <Route path="/chat">
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            </Route>

            {/* 404 Route */}
            <Route component={NotFound}/>
          </Switch>
        </AnimatePresence>
      </main>
    </div>);
}
function App() {
    var _a = useState(true), showSplash = _a[0], setShowSplash = _a[1];
    useEffect(function () {
        // Always show splash screen on every page load
        setShowSplash(true);
    }, []);
    var handleSplashContinue = function () {
        setShowSplash(false);
    };
    if (showSplash) {
        return <SplashScreen onContinue={handleSplashContinue}/>;
    }
    return (<QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="gasflow-ui-theme">
        <TooltipProvider>
          <AuthProvider>
            <OfflineProvider>
              <CartProvider>
                <WebSocketProvider>
                  <AppRoutes />
                  <Toaster />
                </WebSocketProvider>
              </CartProvider>
            </OfflineProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>);
}
export default App;
