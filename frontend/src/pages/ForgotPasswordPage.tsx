import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Ghost, ArrowRight, Mail, Loader2, CheckCircle2, RefreshCw, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/components/ThemeProvider";
import { Moon, Sun } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_API_URL;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [resendTimer, setResendTimer] = useState<number>(0);
  const { theme, setTheme } = useTheme();

  // Handle countdown for resend button
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        setIsSubmitted(true);
        setResendTimer(60); // 60 seconds cooldown
        toast.success("Reset link sent successfully!");
      } else {
        toast.error(data.error || "Failed to send reset link.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Theme Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="fixed top-4 right-4 z-50 rounded-full"
      >
        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>

      {/* Left Side - Form / Success State */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md transition-all duration-500">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <Ghost className="w-10 h-10 text-accent" />
            <span className="text-2xl font-bold text-foreground">
              Post<span className="text-accent">Genix</span>
            </span>
          </Link>

          {!isSubmitted ? (
            /* --- STEP 1: ENTER EMAIL --- */
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-3xl font-bold text-foreground mb-2">Forgot Password?</h1>
              <p className="text-muted-foreground mb-8">
                Enter your email and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 pl-10"
                      required
                    />
                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                  </div>
                </div>

                <Button type="submit" variant="hero" size="lg" className="w-full group" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          ) : (
            /* --- STEP 2: SUCCESS / RESEND --- */
            <div className="animate-in fade-in zoom-in-95 duration-500 text-center">
              <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-accent" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Check your email</h1>
              <p className="text-muted-foreground mb-8">
                We've sent a password reset link to <br />
                <span className="font-medium text-foreground">{email}</span>
              </p>

              <div className="space-y-4">
                <Button 
                  onClick={() => handleSubmit()} 
                  variant="outline" 
                  size="lg" 
                  className="w-full gap-2"
                  disabled={isLoading || resendTimer > 0}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className={`w-4 h-4 ${resendTimer > 0 ? '' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                  )}
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Email"}
                </Button>

                <Button 
                  variant="ghost" 
                  className="gap-2" 
                  onClick={() => setIsSubmitted(false)}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Try another email
                </Button>
              </div>
            </div>
          )}

          <p className="text-center text-sm text-muted-foreground mt-8">
            Wait, I remember it!{" "}
            <Link to="/login" className="text-accent hover:underline font-medium">
              Back to login
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex flex-1 bg-primary items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center text-primary-foreground max-w-md">
          <Ghost className="w-20 h-20 text-accent mx-auto mb-8 animate-float" />
          <h2 className="text-3xl font-bold mb-4">Secure Password Recovery.</h2>
          <p className="text-primary-foreground/80">
            PostGenix uses advanced encryption to ensure your account credentials remain private and protected.
          </p>
        </div>
      </div>
    </div>
  );
}