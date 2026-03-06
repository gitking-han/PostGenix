import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Ghost, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/components/ThemeProvider";
import { Moon, Sun } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_API_URL;

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Password updated! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        toast.error(data.error || "The reset link is invalid or has expired.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="fixed top-4 right-4 z-50 rounded-full"
      >
        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8">
            <Ghost className="w-10 h-10 text-accent" />
            <span className="text-2xl font-bold">PostGenix</span>
          </div>

          <h1 className="text-3xl font-bold mb-2">Create New Password</h1>
          <p className="text-muted-foreground mb-8">
            Please enter your new password below. Make it strong!
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pr-12"
                  required
                  minLength={5}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-12 w-12"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5 text-muted-foreground" /> : <Eye className="w-5 h-5 text-muted-foreground" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-12"
                required
              />
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reset Password"}
            </Button>
          </form>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-primary items-center justify-center p-8 relative">
        <div className="text-center text-primary-foreground max-w-sm">
          <CheckCircle2 className="w-20 h-20 text-accent mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Security First.</h2>
          <p className="opacity-80">
            Updating your password regularly helps keep your viral content and profile data safe from unauthorized access.
          </p>
        </div>
      </div>
    </div>
  );
}