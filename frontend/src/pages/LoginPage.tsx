import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Ghost, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { Moon, Sun } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { theme, setTheme } = useTheme();
const BACKEND_URL = import.meta.env.VITE_API_URL;

// Remove the BACKEND_URL logic. Just use the local path.
const handleGoogleLogin = () => {
  // Vite will see /api and automatically proxy this to localhost:5000
  window.location.href = "/api/auth/google"; 
};

const handleLinkedInLogin = () => {
  window.location.href = "/api/auth/linkedin";
};


  const handleSubmit = async (e) => { 
    e.preventDefault();

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Logged in successfully");

        localStorage.setItem("authToken", data.authToken);
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      } else {
        toast.error(data.error || "Invalid credentials");
        console.log(data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };


  return (
    <>
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

        {/* Left Side - Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 mb-8">
              <Ghost className="w-10 h-10 text-accent" />
              <span className="text-2xl font-bold text-foreground">
                Post<span className="text-accent">Genix</span>
              </span>
            </Link>

            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back</h1>
            <p className="text-muted-foreground mb-8">
              Log in to your account to continue writing LinkedIn posts.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-sm text-accent hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pr-12"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-12 w-12"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <Eye className="w-5 h-5 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" variant="hero" size="lg" className="w-full group">
                Log in
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-12" onClick={handleGoogleLogin}>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button variant="outline" className="h-12" onClick={handleLinkedInLogin}>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-8">
              Don't have an account?{" "}
              <Link to="/signup" className="text-accent hover:underline font-medium">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side - Branding */}
        <div className="hidden lg:flex flex-1 bg-primary items-center justify-center p-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 text-center text-primary-foreground max-w-md">
            <Ghost className="w-20 h-20 text-accent mx-auto mb-8 animate-float" />
            <h2 className="text-3xl font-bold mb-4">Write LinkedIn Posts That Go Viral.</h2>
            <p className="text-primary-foreground/80">
              Join thousands of LinkedIn creators who write, publish, and protect their content with PostGenix.
            </p>
          </div>
        </div>
      </div>

    </>

  );

}


