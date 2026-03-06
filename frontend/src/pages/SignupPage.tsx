import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Ghost, ArrowRight, Eye, EyeOff, CheckCircle2, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { toast } from "sonner";

const benefits = [
  "5 AI-generated LinkedIn posts per day",
  "Secure portfolio with content protection",
  "One-click LinkedIn publishing",
  "No credit card required",
];

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/createuser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
 
      if (data.success) {
        localStorage.setItem("authToken", data.authToken);
        toast.success("Account created successfully!");
        setTimeout(() => {
          
          window.location.href = "/dashboard";
        }, 1000);
      } else {
        if (data.errors) {
          data.errors.forEach((err: any) => toast.error(err.msg));
        } else if (data.error) {
          toast.error(data.error);
        } else {
          toast.error("Signup failed");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error. Try again later.");
    } finally {
      setLoading(false);
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

      {/* Left Side - Branding */}
      <div className="hidden lg:flex flex-1 bg-primary items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-primary-foreground max-w-md">
          <Ghost className="w-20 h-20 text-accent mb-8 animate-float" />
          <h2 className="text-3xl font-bold mb-4">Start Growing on LinkedIn</h2>
          <p className="text-primary-foreground/80 mb-8">
            Join thousands of LinkedIn creators who write viral posts and protect their content with PostGenix.
          </p>
          <ul className="space-y-4">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <Ghost className="w-10 h-10 text-accent" />
            <span className="text-2xl font-bold text-foreground">
              Post<span className="text-accent">Genix</span>
            </span>
          </Link>

          <h1 className="text-3xl font-bold text-foreground mb-2">Create your account</h1>
          <p className="text-muted-foreground mb-8">
            Start writing viral LinkedIn posts today.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12"
                required
              />
            </div>

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
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
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
                  {showPassword ? <EyeOff className="w-5 h-5 text-muted-foreground" /> : <Eye className="w-5 h-5 text-muted-foreground" />}
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked as boolean)}
                className="mt-0.5"
              />
              <Label htmlFor="terms" className="text-sm text-muted-foreground font-normal cursor-pointer">
                I agree to the{" "}
                <Link to="/terms" className="text-accent hover:underline">Terms of Service</Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-accent hover:underline">Privacy Policy</Link>
              </Label>
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full group" disabled={!agreed || loading}>
              {loading ? "Creating account..." : "Create account"}
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Already have an account?{" "}
            <Link to="/login" className="text-accent hover:underline font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
