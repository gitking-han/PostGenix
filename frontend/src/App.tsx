import { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, QueryCache } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";

// Public pages
import LandingPage from "./pages/LandingPage";
import FeaturesPage from "./pages/FeaturesPage";
import PricingPage from "./pages/PricingPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import SecurityPage from "./pages/SecurityPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import PublicPortfolioPage from "./pages/PublicPortfolioPage";
import AboutPage from "./pages/AboutPage";
import BlogPage from "./pages/BlogPage";
import BlogDetailPage from "./pages/BlogDetailPage";
import CareersPage from "./pages/CareersPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import CookiesPage from "./pages/CookiesPage";
import OAuthSuccess from "@/pages/OAuthSuccess";

// Dashboard pages
import DashboardPage from "./pages/dashboard/DashboardPage";
import WritePage from "./pages/dashboard/WritePage";
import PostsPage from "./pages/dashboard/PostsPage";
import PortfolioManagePage from "./pages/dashboard/PortfolioManagePage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import BillingPage from "./pages/dashboard/BillingPage";
import ProfilePage from "./pages/dashboard/ProfilePage";
import NotFound from "./pages/NotFound";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ViewPost from "./pages/dashboard/ViewPost";
import { useEffect } from "react";
/**
 * UTILITY: Check if the JWT token is expired
 */
// ... keep all your imports at the top exactly as they are

/**
 * UTILITY: Check if the JWT token is expired
 */
const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const { exp } = JSON.parse(jsonPayload);
    return Date.now() >= exp * 1000;
  } catch (error) {
    return true;
  }
};

/**
 * GLOBAL LOGOUT
 */
const logoutUser = () => {
  localStorage.removeItem("authToken");
  window.location.href = "/login";
};

/**
 * QUERY CLIENT
 */
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any) => {
      if (error?.status === 401 || error?.response?.status === 401) {
        logoutUser();
      }
    },
  }),
});

interface RouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: RouteProps) => {
  const token = localStorage.getItem("authToken");
  const location = useLocation();
  if (!token || isTokenExpired(token)) {
    localStorage.removeItem("authToken");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

const PublicRoute = ({ children }: RouteProps) => {
  const token = localStorage.getItem("authToken");
  if (token && !isTokenExpired(token)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

// --- CORRECTED APP COMPONENT ---
const App = () => {
  
useEffect(() => {
  
  if (window.Paddle) {
    window.Paddle.Environment.set('sandbox'); 
    
    window.Paddle.Initialize({ 
      token: import.meta.env.VITE_PADDLE_CLIENT_TOKEN, 
    });
    console.log("Paddle Initialized in Sandbox");
  }
}, []);


  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="PostGenix-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* --- Public General Routes --- */}
              <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/security" element={<SecurityPage />} />
              <Route path="/portfolio/:username" element={<PublicPortfolioPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:id" element={<BlogDetailPage />} />
              <Route path="/careers" element={<CareersPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/cookies" element={<CookiesPage />} />
              <Route path="/oauth-success" element={<OAuthSuccess />} />

              {/* --- Public Auth Routes --- */}
              <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
              <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

              {/* --- Dashboard Routes (Protected) --- */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/dashboard/write" element={<ProtectedRoute><WritePage /></ProtectedRoute>} />
              <Route path="/dashboard/posts" element={<ProtectedRoute><PostsPage /></ProtectedRoute>} />
              <Route path="/dashboard/portfolio" element={<ProtectedRoute><PortfolioManagePage /></ProtectedRoute>} />
              <Route path="/dashboard/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/dashboard/billing" element={<ProtectedRoute><BillingPage /></ProtectedRoute>} />
              <Route path="/dashboard/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
              <Route path="/dashboard/posts/:id" element={<ProtectedRoute><ViewPost /></ProtectedRoute>} />

              {/* --- 404 Route --- */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;