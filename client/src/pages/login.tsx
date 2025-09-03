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
import { Checkbox } from "@/components/ui/checkbox";
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
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the Terms of Service to continue",
  }),
  acceptPrivacy: z.boolean().refine((val) => val === true, {
    message: "You must accept the Privacy Policy to continue",
  }),
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
      acceptTerms: false,
      acceptPrivacy: false,
    },
  });

  const onLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
    } catch (error) {
      // Error handling is done in the login function
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
        acceptTerms: data.acceptTerms,
        acceptPrivacy: data.acceptPrivacy,
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
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
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl mb-4 shadow-lg"
          >
            <Flame className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-gray-600">
            {isSignUp 
              ? "Sign up to get started with GasFlow" 
              : "Sign in to your GasFlow account"
            }
          </p>
        </div>

        {/* Main Form Card */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur">
          <CardContent className="p-8">
            {!isSignUp ? (
              /* LOGIN FORM */
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-6" data-testid="form-login">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="login-email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      className="mt-1 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
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
                    <Label htmlFor="login-password" className="text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors pr-12"
                        {...loginForm.register("password")}
                        data-testid="input-login-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
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
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isLoading}
                  data-testid="button-login-submit"
                >
                  {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>

                {/* Forgot Password */}
                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                    onClick={() => {
                      toast({
                        title: "Password Reset",
                        description: "Contact support for password reset assistance.",
                      });
                    }}
                  >
                    Forgot your password?
                  </button>
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
                      className="mt-1 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
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
                      className="mt-1 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
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
                      className="mt-1 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                      {...registerForm.register("phone")}
                      data-testid="input-register-phone"
                    />
                  </div>

                  <div>
                    <Label htmlFor="register-password" className="text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors pr-12"
                        {...registerForm.register("password")}
                        data-testid="input-register-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {registerForm.formState.errors.password && (
                      <p className="text-sm text-red-600 mt-1" data-testid="error-register-password">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Terms and Privacy Agreement */}
                <div className="space-y-4 pt-2 border-t border-gray-100">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="accept-terms"
                        {...registerForm.register("acceptTerms")}
                        data-testid="checkbox-accept-terms"
                        className="mt-0.5"
                      />
                      <Label
                        htmlFor="accept-terms"
                        className="text-sm leading-5 cursor-pointer text-gray-700"
                      >
                        I agree to the{" "}
                        <Link
                          href="/terms-of-service"
                          className="text-orange-600 hover:text-orange-700 font-medium underline"
                        >
                          Terms of Service
                        </Link>
                      </Label>
                    </div>
                    {registerForm.formState.errors.acceptTerms && (
                      <p className="text-sm text-red-600 ml-6" data-testid="error-accept-terms">
                        {registerForm.formState.errors.acceptTerms.message}
                      </p>
                    )}

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="accept-privacy"
                        {...registerForm.register("acceptPrivacy")}
                        data-testid="checkbox-accept-privacy"
                        className="mt-0.5"
                      />
                      <Label
                        htmlFor="accept-privacy"
                        className="text-sm leading-5 cursor-pointer text-gray-700"
                      >
                        I agree to the{" "}
                        <Link
                          href="/privacy-policy"
                          className="text-orange-600 hover:text-orange-700 font-medium underline"
                        >
                          Privacy Policy
                        </Link>
                      </Label>
                    </div>
                    {registerForm.formState.errors.acceptPrivacy && (
                      <p className="text-sm text-red-600 ml-6" data-testid="error-accept-privacy">
                        {registerForm.formState.errors.acceptPrivacy.message}
                      </p>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                      By creating an account, you confirm that you are at least 18 years old.
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
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
        {resendEmail && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-6"
          >
            <Card className="border-0 shadow-lg bg-blue-50/80">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Email Verification</h3>
                </div>
                <p className="text-blue-800 mb-4">
                  Didn't receive the verification email? We can send it again.
                </p>
                <div className="flex space-x-3">
                  <Button
                    onClick={handleResendVerification}
                    disabled={isResending}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Resend Email
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setResendEmail("")}
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    Cancel
                  </Button>
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