import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Moon, Sun, Ghost } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
const navigation = [
  { name: "Features", href: "/features" },
  { name: "How it Works", href: "/how-it-works" },
  { name: "Pricing", href: "/pricing" },
  { name: "Security", href: "/security" },
];

export function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm"
          : "bg-transparent"
        }`}
    >
      <div className="section-container">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
            
              
              {/* <img src="/logo.png" alt="sitlogo" width={150} height={80} /> */}

              <Ghost className="w-8 h-8 text-accent transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Post<span className="text-accent">Genix</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors duration-200 animated-underline ${location.pathname === item.href
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="accent" size="sm">
                Start Writing Free
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-full"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden transition-all duration-300 overflow-hidden ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <div className="glass border-t border-border/50">
          <div className="section-container py-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${location.pathname === item.href
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-border/50 flex flex-col gap-2">
              <Link to="/login" onClick={() => setIsOpen(false)} className="block">
                <Button variant="outline" className="w-full">
                  Log in
                </Button>
              </Link>

              <Link to="/signup" onClick={() => setIsOpen(false)} className="block">
                <Button variant="accent" className="w-full">
                  Start Writing Free
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </nav>
  );
}
