import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Flame, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function EmailVerificationPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { toast } = useToast();

  useEffect(() => {
    const verifyEmail = async () => {
      const urlParams = new URLSearchParams(search);
      const token = urlParams.get('token');

      if (!token) {
        setError('Invalid verification link');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);

        if (response.ok) {
          const data = await response.json();
          setIsVerified(true);
          // Clear the stored email since verification is successful
          localStorage.removeItem('pendingVerificationEmail');
          toast({
            title: "Email Verified!",
            description: "Your email has been successfully verified. You can now log in.",
          });
        } else {
          // Try to parse error response, fallback to generic message
          const errorData = await response.json().catch(() => ({ message: 'Verification failed' }));
          setError(errorData.message || 'Verification failed');
        }
      } catch (error) {
        console.error('Email verification error:', error);
        setError('Network error. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [search, toast]);

  const handleResendVerification = async () => {
    // Get email from localStorage (set during registration/login)
    const email = localStorage.getItem('pendingVerificationEmail');

    if (!email) {
      toast({
        title: "Email Required",
        description: "Please log in again to resend verification email.",
        variant: "destructive",
      });
      setLocation('/login');
      return;
    }

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast({
          title: "Verification Email Sent",
          description: "Please check your email for the verification link.",
        });
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to resend verification email' }));
        toast({
          title: "Resend Failed",
          description: errorData.message || "Failed to resend verification email.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      toast({
        title: "Network Error",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 to-secondary/10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-primary/10 p-3 rounded-full">
                <Flame className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
              <CardDescription>Verify your email address</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {isLoading && (
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground">Verifying your email...</p>
              </div>
            )}

            {!isLoading && isVerified && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center space-y-4"
              >
                <div className="flex justify-center">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-700">Email Verified!</h3>
                  <p className="text-muted-foreground">
                    Your email has been successfully verified. You can now log in to your account.
                  </p>
                </div>
                <Button
                  onClick={() => setLocation('/login')}
                  className="w-full"
                >
                  Go to Login
                </Button>
              </motion.div>
            )}

            {!isLoading && error && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center space-y-4"
              >
                <div className="flex justify-center">
                  <XCircle className="h-16 w-16 text-red-500" />
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
                  <Button
                    onClick={() => setLocation('/login')}
                    className="w-full"
                    variant="outline"
                  >
                    Go to Login
                  </Button>
                  <Button
                    onClick={handleResendVerification}
                    className="w-full"
                  >
                    Resend Verification Email
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}