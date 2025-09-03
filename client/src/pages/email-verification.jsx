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
import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Flame, CheckCircle, XCircle, Loader2 } from "lucide-react";
export default function EmailVerificationPage() {
    var _this = this;
    var _a = useState(true), isLoading = _a[0], setIsLoading = _a[1];
    var _b = useState(false), isVerified = _b[0], setIsVerified = _b[1];
    var _c = useState(null), error = _c[0], setError = _c[1];
    var _d = useLocation(), setLocation = _d[1];
    var search = useSearch();
    var toast = useToast().toast;
    useEffect(function () {
        var verifyEmail = function () { return __awaiter(_this, void 0, void 0, function () {
            var urlParams, token, response, data, errorData, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        urlParams = new URLSearchParams(search);
                        token = urlParams.get('token');
                        if (!token) {
                            setError('Invalid verification link');
                            setIsLoading(false);
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, 8, 9]);
                        return [4 /*yield*/, fetch("/api/auth/verify-email?token=".concat(token))];
                    case 2:
                        response = _a.sent();
                        if (!response.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _a.sent();
                        setIsVerified(true);
                        toast({
                            title: "Email Verified!",
                            description: "Your email has been successfully verified. You can now log in.",
                        });
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, response.json().catch(function () { return ({ message: 'Verification failed' }); })];
                    case 5:
                        errorData = _a.sent();
                        setError(errorData.message || 'Verification failed');
                        _a.label = 6;
                    case 6: return [3 /*break*/, 9];
                    case 7:
                        error_1 = _a.sent();
                        console.error('Email verification error:', error_1);
                        setError('Network error. Please try again.');
                        return [3 /*break*/, 9];
                    case 8:
                        setIsLoading(false);
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/];
                }
            });
        }); };
        verifyEmail();
    }, [search, toast]);
    var handleResendVerification = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // This would typically require the user's email
            // For now, we'll just show a message
            toast({
                title: "Resend Verification",
                description: "Please contact support to resend verification email.",
            });
            return [2 /*return*/];
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
              <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
              <CardDescription>Verify your email address</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {isLoading && (<div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary"/>
                <p className="text-muted-foreground">Verifying your email...</p>
              </div>)}

            {!isLoading && isVerified && (<motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="text-center space-y-4">
                <div className="flex justify-center">
                  <CheckCircle className="h-16 w-16 text-green-500"/>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-700">Email Verified!</h3>
                  <p className="text-muted-foreground">
                    Your email has been successfully verified. You can now log in to your account.
                  </p>
                </div>
                <Button onClick={function () { return setLocation('/login'); }} className="w-full">
                  Go to Login
                </Button>
              </motion.div>)}

            {!isLoading && error && (<motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="text-center space-y-4">
                <div className="flex justify-center">
                  <XCircle className="h-16 w-16 text-red-500"/>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-700">Verification Failed</h3>
                  <p className="text-muted-foreground">{error}</p>
                </div>
                <Alert>
                  <AlertDescription>
                    The verification link may have expired or is invalid.
                    Please try logging in again or contact support.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Button onClick={function () { return setLocation('/login'); }} className="w-full" variant="outline">
                    Go to Login
                  </Button>
                  <Button onClick={handleResendVerification} className="w-full">
                    Resend Verification Email
                  </Button>
                </div>
              </motion.div>)}
          </CardContent>
        </Card>
      </motion.div>
    </div>);
}
