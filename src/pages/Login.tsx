import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { roleDashboardPaths } from "@/types/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, user, profile } = useAuth();
  const [resetEmail, setResetEmail] = useState("");
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  // If user is already logged in, redirect to appropriate dashboard
  useEffect(() => {
    if (user && profile) {
      const redirectPath = roleDashboardPaths[profile.role] || "/login";
      navigate(redirectPath);
    }
  }, [user, profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail || !resetEmail.includes('@')) {
      toast.error("Zəhmət olmasa düzgün email daxil edin");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call to send password reset email
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setResetEmailSent(true);
      toast.success("Şifrə bərpa linki göndərildi", {
        description: "Zəhmət olmasa emailinizi yoxlayın"
      });
    } catch (error) {
      toast.error("Xəta baş verdi", {
        description: "Şifrə bərpa linki göndərilmədi. Zəhmət olmasa bir az sonra yenidən cəhd edin."
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

  // If already logged in, don't render login form (handled by useEffect above)
  if (user) return null;

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
                    Şifrəni unutmusunuz?
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
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordOpen} onOpenChange={handleCloseForgotPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Şifrəni bərpa et</DialogTitle>
            <DialogDescription>
              Şifrənizi bərpa etmək üçün email ünvanınızı daxil edin.
            </DialogDescription>
          </DialogHeader>
          
          {!resetEmailSent ? (
            <form onSubmit={handleResetPassword} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="resetEmail">Email</Label>
                <Input
                  id="resetEmail"
                  type="email"
                  placeholder="Email ünvanınızı daxil edin"
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
                  Ləğv et
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Göndərilir..." : "Bərpa linkini göndər"}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Şifrə bərpa linki göndərildi</h3>
                <p className="text-sm text-muted-foreground">
                  {resetEmail} ünvanına şifrə bərpa linki göndərildi. Zəhmət olmasa emailinizi yoxlayın.
                </p>
              </div>
              <Button 
                className="mt-4" 
                onClick={handleCloseForgotPassword}
              >
                Bağla
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
