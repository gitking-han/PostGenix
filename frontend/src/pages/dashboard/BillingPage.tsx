import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Star, CreditCard, Settings } from "lucide-react"; // Added Settings icon
import { useState, useEffect } from "react";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

declare global {
  interface Window { Paddle: any; }
}

export default function BillingPage() {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/get-user`, {
          headers: { "auth-token": localStorage.getItem("authToken") || "" }
        });
        const data = await res.json();
        setUserData(data);
      } catch (err) {
        console.error("Failed to fetch user billing info");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  // 1. Calculate how many posts were actually used
  const usedCredits = Math.max(0, 10 - (userData?.credits ?? 10));

  // 2. Calculation Helpers for the Reset Timer
  const calculateResetTime = () => {
    if (!userData?.lastCreditReset) return "12 hours";
    const lastReset = new Date(userData.lastCreditReset).getTime();
    const nextReset = lastReset + (12 * 60 * 60 * 1000);
    const now = new Date().getTime();
    const diffMs = nextReset - now;
    const diffHours = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60)));
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'}`;
  };

  // 3. Calculation for the Progress Bar width
  const creditPercentage = userData?.plan === 'pro' ? 100 : (usedCredits / 10) * 100;

  const handleUpgrade = () => {
    if (!window.Paddle) return;

    window.Paddle.Checkout.open({
      settings: {
        displayMode: "overlay",
        theme: "light",
        locale: "en",
      },
      items: [
        {
          priceId: import.meta.env.VITE_PADDLE_PRO_PRICE_ID,
          quantity: 1,
        },
      ],
      customData: {
        userId: userData._id,
      },
    });
  };

  /**
   * NEW: Function to open the Paddle Customer Portal
   * This allows users to cancel, update payment methods, or view invoices.
   */
  const handleManageSubscription = () => {
    if (!userData?.paddleCustomerId) {
      alert("Customer information not found. If you just upgraded, please wait a minute and refresh.");
      return;
    }

    // 1. This is the Base URL from your screenshot
    const basePortalUrl = "https://sandbox-customer-portal.paddle.com/cpl_01kj28ys30495ec2sa799jh01c";

    // 2. We append the customer_id so the user is logged in automatically
    // It uses the ctm_... ID from your MongoDB
    const finalUrl = `${basePortalUrl}?customer_id=${userData.paddleCustomerId}`;

    // 3. Open in a new tab
    window.open(finalUrl, '_blank');
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        {/* UPDATED HEADER: Flex container to hold Heading and Manage Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Billing</h1>

          {/* Show Manage Subscription button only for PRO users */}
          {userData?.plan === 'pro' && (
            <Button
              onClick={handleManageSubscription}
              variant="outline"
              className="border-accent text-accent hover:bg-accent/5"
            >
              <Settings className="w-4 h-4 mr-2" />
              Manage Subscription
            </Button>
          )}
        </div>

        <div className="editorial-card mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-foreground">Current Plan</h2>
              <p className="text-muted-foreground">
                {isLoading ? "Loading..." : `You're on the ${userData?.plan === 'pro' ? 'Pro' : 'Free'} plan`}
              </p>
            </div>
            <span className={cn(
              "px-3 py-1 rounded-full text-sm font-medium",
              userData?.plan === 'pro' ? "bg-amber-100 text-amber-600" : "bg-muted"
            )}>
              {userData?.plan === 'pro' ? 'Pro' : 'Free'}
            </span>
          </div>

          <div className="text-sm text-muted-foreground mb-4">
            {userData?.plan === 'pro' ? (
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500" />
                  Unlimited daily AI posts
                </span>

                {/* NEW: Date display logic */}
                {userData?.planEndsAt && (
                  <span className="text-accent font-medium mt-1">
                    {userData.subscriptionStatus === 'active'
                      ? `Next billing date: ${new Date(userData.planEndsAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}`
                      : `Access expires on: ${new Date(userData.planEndsAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}`
                    }
                  </span>
                )}
              </div>
            ) : (
              `${usedCredits} of 10 daily AI posts used • Resets in ${calculateResetTime()}`
            )}
          </div>

          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-500 rounded-full",
                userData?.plan === 'pro' ? "bg-amber-400" : "bg-accent"
              )}
              style={{ width: `${creditPercentage}%` }}
            />
          </div>

          {/* Optional: Add a small disclaimer for canceled users */}
          {userData?.plan === 'pro' && userData?.subscriptionStatus !== 'active' && (
            <p className="mt-4 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100">
              Your subscription is set to cancel. You will keep Pro features until the date shown above.
            </p>
          )}
        </div>

        <div className={cn(
          "editorial-card transition-all",
          userData?.plan === 'pro' && "bg-amber-50/50" // Change background color if Pro
        )}>
          <div className="flex items-center gap-2 mb-4">
            {userData?.plan === 'pro' ? (
              <CheckCircle2 className="w-5 h-5 text-amber-500" />
            ) : (
              <Star className="w-5 h-5 text-accent" />
            )}
            <h2 className="font-semibold text-foreground">
              {userData?.plan === 'pro' ? "Pro Membership" : "Upgrade to Pro"}
            </h2>
          </div>

          <div className="text-3xl font-bold text-foreground mb-2">
            PKR 2,000
            <span className="text-lg font-normal text-muted-foreground">/month</span>
          </div>

          <p className="text-sm text-accent mb-6">
            {userData?.plan === 'pro' ? "Enjoying full access" : "Save 10% with yearly billing"}
          </p>

          <ul className="space-y-2 mb-6">
            {["Unlimited AI posts", "Advanced portfolio features", "Early access to LinkedIn integration"].map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                {f}
              </li>
            ))}
          </ul>

          <Button
            onClick={userData?.plan === 'pro' ? undefined : handleUpgrade}
            variant={userData?.plan === 'pro' ? "outline" : "accent"}
            className={cn(
              "w-full",
              userData?.plan === 'pro' && "border-amber-200 text-amber-600 bg-transparent hover:bg-transparent cursor-default"
            )}
            disabled={userData?.plan === 'pro'}
          >
            {userData?.plan === 'pro' ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Current Plan
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Upgrade Now
              </>
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}