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
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Flame, Loader2, Mail } from "lucide-react";
var loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});
var registerSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().optional(),
});
export default function LoginPage() {
    var _this = this;
    var _a = useState(false), isLoading = _a[0], setIsLoading = _a[1];
    var _b = useState(false), isResending = _b[0], setIsResending = _b[1];
    var _c = useState(""), resendEmail = _c[0], setResendEmail = _c[1];
    var _d = useAuth(), login = _d.login, register = _d.register;
    var toast = useToast().toast;
    var loginForm = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });
    var registerForm = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            password: "",
            name: "",
            phone: "",
        },
    });
    var onLogin = function (data) { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, login(data.email, data.password)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var onRegister = function (data) { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, register(data)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleResendVerification = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, errorData, errorData, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!resendEmail.trim()) {
                        toast({
                            title: "Email Required",
                            description: "Please enter your email address.",
                            variant: "destructive",
                        });
                        return [2 /*return*/];
                    }
                    setIsResending(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, 9, 10]);
                    return [4 /*yield*/, fetch('/api/auth/resend-verification', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ email: resendEmail }),
                        })];
                case 2:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json().catch(function () { return ({ message: 'Unknown error' }); })];
                case 3:
                    errorData = _a.sent();
                    throw new Error(errorData.message || "HTTP ".concat(response.status));
                case 4:
                    if (!response.ok) return [3 /*break*/, 5];
                    toast({
                        title: "Verification Email Sent",
                        description: "Please check your email for the verification link.",
                    });
                    setResendEmail("");
                    return [3 /*break*/, 7];
                case 5: return [4 /*yield*/, response.json()];
                case 6:
                    errorData = _a.sent();
                    toast({
                        title: "Failed to Resend",
                        description: errorData.message || "Failed to resend verification email.",
                        variant: "destructive",
                    });
                    _a.label = 7;
                case 7: return [3 /*break*/, 10];
                case 8:
                    error_3 = _a.sent();
                    toast({
                        title: "Network Error",
                        description: "Please try again later.",
                        variant: "destructive",
                    });
                    return [3 /*break*/, 10];
                case 9:
                    setIsResending(false);
                    return [7 /*endfinally*/];
                case 10: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 to-secondary/10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-primary/10 p-3 rounded-full">
                <Flame className="h-8 w-8 text-primary"/>
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Welcome to GasFlow</CardTitle>
              <CardDescription>Your reliable LPG delivery service</CardDescription>
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="login" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
                <TabsTrigger value="register" data-testid="tab-register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input id="login-email" type="email" placeholder="Enter your email" {...loginForm.register("email")} data-testid="input-login-email"/>
                    {loginForm.formState.errors.email && (<p className="text-sm text-destructive" data-testid="error-login-email">
                        {loginForm.formState.errors.email.message}
                      </p>)}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input id="login-password" type="password" placeholder="Enter your password" {...loginForm.register("password")} data-testid="input-login-password"/>
                    {loginForm.formState.errors.password && (<p className="text-sm text-destructive" data-testid="error-login-password">
                        {loginForm.formState.errors.password.message}
                      </p>)}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-login-submit">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    Sign In
                  </Button>
                </form>
                
                <Alert>
                  <AlertDescription>
                    <strong>Demo Credentials:</strong><br />
                    Customer: customer@demo.com / demo123<br />
                    Admin: admin@gasflow.com / admin123
                  </AlertDescription>
                </Alert>

                <Alert>
                  <AlertDescription>
                    <div className="space-y-2">
                      <p><strong>Need to verify your email?</strong></p>
                      <div className="flex space-x-2">
                        <Input type="email" placeholder="Enter your email" value={resendEmail} onChange={function (e) { return setResendEmail(e.target.value); }} className="flex-1"/>
                        <Button type="button" variant="outline" size="sm" onClick={handleResendVerification} disabled={isResending}>
                          {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                          <Mail className="mr-2 h-4 w-4"/>
                          Resend
                        </Button>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              </TabsContent>
              
              <TabsContent value="register" className="space-y-4">
                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Full Name</Label>
                    <Input id="register-name" type="text" placeholder="Enter your full name" {...registerForm.register("name")} data-testid="input-register-name"/>
                    {registerForm.formState.errors.name && (<p className="text-sm text-destructive" data-testid="error-register-name">
                        {registerForm.formState.errors.name.message}
                      </p>)}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input id="register-email" type="email" placeholder="Enter your email" {...registerForm.register("email")} data-testid="input-register-email"/>
                    {registerForm.formState.errors.email && (<p className="text-sm text-destructive" data-testid="error-register-email">
                        {registerForm.formState.errors.email.message}
                      </p>)}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-phone">Phone Number (Optional)</Label>
                    <Input id="register-phone" type="tel" placeholder="Enter your phone number" {...registerForm.register("phone")} data-testid="input-register-phone"/>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input id="register-password" type="password" placeholder="Create a password" {...registerForm.register("password")} data-testid="input-register-password"/>
                    {registerForm.formState.errors.password && (<p className="text-sm text-destructive" data-testid="error-register-password">
                        {registerForm.formState.errors.password.message}
                      </p>)}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-register-submit">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>);
}
