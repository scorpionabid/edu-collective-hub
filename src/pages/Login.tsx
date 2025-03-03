
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { roleDashboardPaths } from "@/types/auth";
import { redirectBasedOnRole } from "@/utils/authUtils";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, user, loading } = useAuth();
  const [resetEmail, setResetEmail] = useState("");
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the intended destination from the location state, or use the default based on role
  const from = location.state?.from?.pathname || "/";
  
  // If user is already logged in, redirect to appropriate dashboard
  useEffect(() => {
    if (user && !loading) {
      // Redirect to the dashboard appropriate for the user's role
      const dashboardPath = roleDashboardPaths[user.role] || "/";
      const redirectPath = from === "/" ? dashboardPath : from;
      navigate(redirectPath, { replace: true });
    }
  }, [user, loading, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await login(email, password);
      // The redirect will happen in the useEffect above
    } catch (error: any) {
      toast.error("Login failed", {
        description: error.message || "Please check your credentials and try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail || !resetEmail.includes('@')) {
      toast.error("Please enter a valid email");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call to send password reset email
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setResetEmailSent(true);
      toast.success("Password reset link sent", {
        description: "Please check your email"
      });
    } catch (error) {
      toast.error("Error occurred", {
        description: "Password reset link could not be sent. Please try again later."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseForgotPassword = () => {
    setForgotPasswordOpen(false);
    // Reset the state after dialog is closed
    setTimeout(() => {
      setResetEmail("");
      setResetEmailSent(false);
    }, 300);
  };

  // If already logged in, show loading indicator
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If already logged in, don't render login form (handled by useEffect above)
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>You are already logged in. Redirecting...</p>
          <Button 
            className="mt-4" 
            onClick={() => redirectBasedOnRole(user.role, navigate)}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-4 space-y-4">
        <Card className="w-full">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-bold text-center">InfoLine</CardTitle>
            <CardDescription className="text-center">
              School Management System
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Button 
                    type="button" 
                    variant="link" 
                    className="px-0 h-auto font-normal text-sm"
                    onClick={() => setForgotPasswordOpen(true)}
                  >
                    Forgot password?
                  </Button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordOpen} onOpenChange={handleCloseForgotPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address to reset your password.
            </DialogDescription>
          </DialogHeader>
          
          {!resetEmailSent ? (
            <form onSubmit={handleResetPassword} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="resetEmail">Email</Label>
                <Input
                  id="resetEmail"
                  type="email"
                  placeholder="Enter your email address"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>
              
              <DialogFooter className="pt-4">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={handleCloseForgotPassword}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send reset link"}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Password reset link sent</h3>
                <p className="text-sm text-muted-foreground">
                  A password reset link has been sent to {resetEmail}. Please check your email.
                </p>
              </div>
              <Button 
                className="mt-4" 
                onClick={handleCloseForgotPassword}
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
