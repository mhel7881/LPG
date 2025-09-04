import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
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
import ForgotPasswordPage from "@/pages/forgot-password";
import ResetPasswordPage from "@/pages/reset-password";
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
import AdminLocationTracking from "@/pages/admin/location-tracking";
import ChatPage from "@/pages/chat";
import NotFound from "@/pages/not-found";
import TermsOfServicePage from "@/pages/terms-of-service";
import PrivacyPolicyPage from "@/pages/privacy-policy";

// Auth Guard Component
function ProtectedRoute({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode; 
  allowedRoles?: string[] 
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Redirect to={user.role === "admin" ? "/admin" : "/customer"} />;
  }

  return <>{children}</>;
}

// Public Route (redirects authenticated users)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Redirect to={user.role === "admin" ? "/admin" : "/customer"} />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <div className="min-h-screen bg-background">
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

            <Route path="/forgot-password">
              <PublicRoute>
                <ForgotPasswordPage />
              </PublicRoute>
            </Route>

            <Route path="/reset-password">
              <PublicRoute>
                <ResetPasswordPage />
              </PublicRoute>
            </Route>

            <Route path="/verify-email">
              <EmailVerificationPage />
            </Route>

            {/* Legal Pages - Public Routes */}
            <Route path="/terms-of-service">
              <TermsOfServicePage />
            </Route>

            <Route path="/privacy-policy">
              <PrivacyPolicyPage />
            </Route>

            {/* Root redirect */}
            <Route path="/">
              {() => {
                const { user } = useAuth();
                if (user) {
                  return <Redirect to={user.role === "admin" ? "/admin" : "/customer"} />;
                }
                return <Redirect to="/login" />;
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

            <Route path="/admin/location-tracking">
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLocationTracking />
              </ProtectedRoute>
            </Route>

            {/* Chat Route (available to both roles) */}
            <Route path="/chat">
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            </Route>

            {/* 404 Route */}
            <Route component={NotFound} />
          </Switch>
        </AnimatePresence>
      </main>
    </div>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    // Only show splash on first visit, not on refreshes
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    return !hasSeenSplash;
  });

  const handleSplashContinue = () => {
    setShowSplash(false);
    sessionStorage.setItem('hasSeenSplash', 'true');
  };

  if (showSplash) {
    return <SplashScreen onContinue={handleSplashContinue} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}

export default App;
