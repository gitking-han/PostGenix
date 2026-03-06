import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import {
  Ghost,
  LayoutDashboard,
  PenTool,
  FileText,
  Briefcase,
  Settings,
  CreditCard,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  User
} from "lucide-react";
import { toast } from "sonner";


const sidebarLinks = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Write", href: "/dashboard/write", icon: PenTool },
  { name: "Posts", href: "/dashboard/posts", icon: FileText },
  { name: "Portfolio", href: "/dashboard/portfolio", icon: Briefcase },
  { name: "Profile", href: "/dashboard/profile", icon: User },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/login";
    toast.success("Logged out successfully");
  };



  return (
     <div className="min-h-screen bg-background flex overflow-x-hidden"> {/* Added overflow-x-hidden */}
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-r border-border bg-sidebar transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"
          }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <Ghost className="w-8 h-8 text-accent flex-shrink-0" />
            {!isCollapsed && (
              <span className="text-lg font-bold text-sidebar-foreground">
                Post<span className="text-accent">Genix</span>
              </span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="iconSm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-sidebar-foreground"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.name}
                to={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  } ${isCollapsed ? "justify-center" : ""}`}
                title={isCollapsed ? link.name : undefined}
              >
                <link.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span>{link.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-sidebar-border space-y-2">
          <Button
            variant="ghost"
            size={isCollapsed ? "icon" : "default"}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`text-sidebar-foreground ${isCollapsed ? "" : "w-full justify-start gap-3"}`}
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
            {!isCollapsed && (theme === "dark" ? "Light Mode" : "Dark Mode")}
          </Button>

          <Button
            variant="ghost"
            size={isCollapsed ? "icon" : "default"}
            onClick={() => setShowLogoutModal(true)}
            className={`text-sidebar-foreground ${isCollapsed ? "" : "w-full justify-start gap-3"}`}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && "Log out"}
          </Button>

        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-xl border-b border-border z-50 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <Ghost className="w-8 h-8 text-accent" />
          <span className="text-lg font-bold text-foreground">
            Ghost<span className="text-accent">folio</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
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
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="rounded-full"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed top-16 left-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border z-50 transform transition-transform duration-300 ${isMobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <nav className="p-4 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  }`}
              >
                <link.icon className="w-5 h-5" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">

          <Button
            onClick={() => setShowLogoutModal(true)}
            variant="ghost"
            className="w-full justify-start gap-3 text-sidebar-foreground"
          >
            <LogOut className="w-5 h-5" />
            Log out
          </Button>

        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 w-full"> {/* Added min-w-0 and w-full */}
        <main className="flex-1 pt-16 lg:pt-0 w-full overflow-x-hidden"> {/* Added w-full and overflow-x-hidden */}
          {children}
        </main>
      </div>
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg p-6 w-80 shadow-lg">
            <h2 className="text-lg font-bold mb-4">Confirm Logout</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to log out?
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                Log out
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
