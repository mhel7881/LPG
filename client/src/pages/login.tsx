import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Flame, Loader2, Mail, Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function LoginPage() {
  const [location, setLocation] = useLocation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const { login, register } = useAuth();
  const { toast } = useToast();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      phone: "",
    },
  });

  const onLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      setShowResendVerification(false);
    } catch (error: any) {
      // If email verification is required, show resend option
      if (error.message?.includes('verification') || error.message?.includes('verified')) {
        setResendEmail(data.email);
        setShowResendVerification(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onRegister = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await register({
        email: data.email,
        password: data.password,
        name: data.name,
        phone: data.phone,
      });

      // Registration successful, switch back to login
      setIsSignUp(false);
    } catch (error) {
      // Error handling is done in the register function
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!resendEmail) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsResending(true);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail }),
      });

      if (response.ok) {
        toast({
          title: "Verification email sent!",
          description: "Please check your email for the verification link.",
        });
        setResendEmail("");
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.message || "Failed to send verification email",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const switchToSignUp = () => {
    setIsSignUp(true);
    loginForm.reset();
  };

  const switchToLogin = () => {
    setIsSignUp(false);
    registerForm.reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg"
          >
            <img src="/solane-tank.png" alt="Logo" className="h-8 w-8 object-contain" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {isSignUp ? "Create Account" : "Welcome"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isSignUp 
              ? "Sign up to get starteh " 
              : "Sign in to your GasFlow account"
            }
          </p>
        </div>

        {/* Main Form Card */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur">
          <CardContent className="p-8">
            {!isSignUp ? (
              /* LOGIN FORM */
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-6" data-testid="form-login">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="login-email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email Address
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      className="mt-1 h-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:bg-white dark:focus:bg-gray-600 transition-colors"
                      {...loginForm.register("email")}
                      data-testid="input-login-email"
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-sm text-red-600 mt-1" data-testid="error-login-email">
                        {loginForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="login-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Password
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="h-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:bg-white dark:focus:bg-gray-600 transition-colors pr-12"
                        {...loginForm.register("password")}
                        data-testid="input-login-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-red-600 mt-1" data-testid="error-login-password">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isLoading}
                  data-testid="button-login-submit"
                >
                  {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>

                {/* Forgot Password */}
                <div className="text-center">
                  <Link href="/forgot-password">
                    <button
                      type="button"
                      className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Forgot your password?
                    </button>
                  </Link>
                </div>
              </form>
            ) : (
              /* SIGNUP FORM */
              <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-6" data-testid="form-register">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="register-name" className="text-sm font-medium text-gray-700">
                      Full Name
                    </Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="Enter your full name"
                      className="mt-1 h-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:bg-white dark:focus:bg-gray-600 transition-colors"
                      {...registerForm.register("name")}
                      data-testid="input-register-name"
                    />
                    {registerForm.formState.errors.name && (
                      <p className="text-sm text-red-600 mt-1" data-testid="error-register-name">
                        {registerForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="register-email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="Enter your email"
                      className="mt-1 h-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:bg-white dark:focus:bg-gray-600 transition-colors"
                      {...registerForm.register("email")}
                      data-testid="input-register-email"
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-sm text-red-600 mt-1" data-testid="error-register-email">
                        {registerForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="register-phone" className="text-sm font-medium text-gray-700">
                      Phone Number <span className="text-gray-400 font-normal">(optional)</span>
                    </Label>
                    <Input
                      id="register-phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      className="mt-1 h-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:bg-white dark:focus:bg-gray-600 transition-colors"
                      {...registerForm.register("phone")}
                      data-testid="input-register-phone"
                    />
                  </div>

                  <div>
                    <Label htmlFor="register-password" className="text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Create a strong password"
                      className="mt-1 h-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:bg-white dark:focus:bg-gray-600 transition-colors"
                      {...registerForm.register("password")}
                      data-testid="input-register-password"
                    />
                    {registerForm.formState.errors.password && (
                      <p className="text-sm text-red-600 mt-1" data-testid="error-register-password">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                </div>


                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isLoading}
                  data-testid="button-register-submit"
                >
                  {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Email Verification Resend */}
        {showResendVerification && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-6"
          >
            <Card className="border-0 shadow-lg bg-blue-50/80">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Email Verification Required</h3>
                </div>
                <p className="text-blue-800 mb-4">
                  Your email address needs to be verified before you can log in. Didn't receive the verification email? We can send it again.
                </p>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="resend-email" className="text-sm font-medium text-blue-900">
                      Email Address
                    </Label>
                    <Input
                      id="resend-email"
                      type="email"
                      placeholder="Enter your email address"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      className="mt-1 bg-white border-blue-300 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      onClick={handleResendVerification}
                      disabled={isResending || !resendEmail}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Resend Verification Email
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowResendVerification(false);
                        setResendEmail("");
                      }}
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Bottom Sign Up/Login Toggle */}
        <div className="mt-8 text-center">
          {!isSignUp ? (
            <p className="text-gray-600">
              Don't have an account?{" "}
              <button
                onClick={switchToSignUp}
                className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p className="text-gray-600">
              Already have an account?{" "}
              <button
                onClick={switchToLogin}
                className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}