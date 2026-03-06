import React, { useEffect } from "react";
import { toast } from "sonner";

const OAuthSuccess: React.FC = () => {
  useEffect(() => {
    // Get token from URL query params
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      // Store JWT token in localStorage
      localStorage.setItem("authToken", token);

      // Show success toast
      toast.success("Logged in successfully 🎉");

      // Redirect to dashboard after short delay so user can see toast
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    } else {
      toast.error("Login failed");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <p className="text-lg font-medium">Logging you in…</p>
      <div className="mt-4">
        {/* Spinner */}
        <div className="w-8 h-8 border-4 border-t-accent border-gray-300 rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

export default OAuthSuccess;
