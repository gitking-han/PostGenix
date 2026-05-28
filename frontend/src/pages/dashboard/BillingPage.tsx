import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Star, CreditCard, Settings, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

declare global {
  interface Window { Paddle: any; }
}

// ─── Updated Pro features — reflects everything we actually built ─────────────
const PRO_FEATURES = [
  "Unlimited daily AI posts",
  "Voice Fingerprint — posts in your unique tone",
  "Brand Drift Alerts — stay on-niche automatically",
  "Performance Analytics — know what's working",
  "Content Gap Map — topics your niche is missing",
  "Direct publish to LinkedIn (formatting preserved)",
  "Advanced portfolio with public page",
  "Priority AI access & High-Reasoning Mode",
];

const FREE_FEATURES = [
  "10 AI posts per day",
  "Public portfolio page",
  "Basic profile analysis",
  "LinkedIn copy formatting",
];

export default function BillingPage() {
  const [userData,  setUserData]  = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isYearly,  setIsYearly]  = useState(false); // yearly billing toggle

  // ── Fetch user on mount ────────────────────────────────────────────────────
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/get-user`, {
          headers: { "auth-token": localStorage.getItem("authToken") || "" },
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

  // ── Derived values ─────────────────────────────────────────────────────────
  const isPro           = userData?.plan === "pro";
  const usedCredits     = Math.max(0, 10 - (userData?.credits ?? 10));
  const creditPct       = isPro ? 100 : (usedCredits / 10) * 100;

  const getBillingCycle = (user: any) => {
    if (!user) return "unknown";
    if (user.billingCycle && (user.billingCycle === "monthly" || user.billingCycle === "yearly")) {
      return user.billingCycle;
    }
    if (user.planEndsAt) {
      const endsAt = new Date(user.planEndsAt);
      const days = (endsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return days > 45 ? "yearly" : "monthly";
    }
    return "unknown";
  };

  const billingCycle    = getBillingCycle(userData);
  const isYearlyPlan   = billingCycle === "yearly";
  const currentPlanTag = isPro
    ? isYearlyPlan
      ? "Pro • Yearly subscription"
      : "Pro • Monthly subscription"
    : "Free";

  const monthlyPrice    = 7.17;  // PKR
  const yearlyPrice     = Math.round(monthlyPrice * 12 * 0.9); // 10% off
  const displayedPrice  = isYearly ? Math.round(yearlyPrice / 12) : monthlyPrice;
  const displayedPeriod = isYearly ? "/mo (billed yearly)" : "/month";

  const calculateResetTime = () => {
    if (!userData?.lastCreditReset) return "12 hours";
    const next = new Date(userData.lastCreditReset).getTime() + 12 * 60 * 60 * 1000;
    const diff = Math.max(0, Math.ceil((next - Date.now()) / 3_600_000));
    return `${diff} ${diff === 1 ? "hour" : "hours"}`;
  };

  // ── Paddle: upgrade ────────────────────────────────────────────────────────
  const handleUpgrade = () => {
    if (!window.Paddle) return;
    // Use yearly price ID if yearly billing is selected
    const priceId = isYearly
      ? import.meta.env.VITE_PADDLE_PRO_YEARLY_PRICE_ID
      : import.meta.env.VITE_PADDLE_PRO_PRICE_ID;
     
    window.Paddle.Checkout.open({
      settings: { displayMode: "overlay", theme: "light", locale: "en" },
      items: [{ priceId, quantity: 1 }],
      customData: { userId: userData._id },
    });
  };

  // ── Paddle: manage subscription portal ────────────────────────────────────
  // FIX: portal URL is now an env variable, not hardcoded in source
  const handleManageSubscription = () => {
    if (!userData?.paddleCustomerId) {
      alert("Customer info not found. If you just upgraded, wait a moment and refresh.");
      return;
    }
    const baseUrl  = import.meta.env.VITE_PADDLE_PORTAL_URL; // set in .env
    const finalUrl = `${baseUrl}?customer_id=${userData.paddleCustomerId}`;
    window.open(finalUrl, "_blank");
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Billing</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your plan and usage.</p>
          </div>
          {isPro && (
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

        {/* Current Plan card */}
        <div className="editorial-card mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-foreground">Current Plan</h2>
              <p className="text-muted-foreground text-sm">
                {isLoading ? "Loading..." : currentPlanTag}
              </p>
            </div>
            <span className={cn(
              "px-3 py-1 rounded-full text-sm font-semibold",
              isPro ? "bg-amber-100 text-amber-600" : "bg-muted text-muted-foreground"
            )}>
              {isPro ? "Pro" : "Free"}
            </span>
          </div>

          {/* Usage / next billing */}
          <div className="text-sm text-muted-foreground mb-3">
            {isPro ? (
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-2 text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-amber-500" />
                  Unlimited daily AI posts — all features unlocked
                </span>
                {userData?.planEndsAt && (
                  <span className="text-accent font-medium mt-1">
                    {userData.subscriptionStatus === "active"
                      ? `Next billing: ${new Date(userData.planEndsAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
                      : `Pro access until: ${new Date(userData.planEndsAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
                    }
                  </span>
                )}
              </div>
            ) : (
              `${usedCredits} of 10 daily AI posts used · Resets in ${calculateResetTime()}`
            )}
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-500 rounded-full",
                isPro ? "bg-amber-400" : "bg-accent"
              )}
              style={{ width: `${creditPct}%` }}
            />
          </div>

          {/* Canceled but still active notice */}
          {isPro && userData?.subscriptionStatus !== "active" && userData?.planEndsAt && (
            <p className="mt-4 text-xs text-amber-700 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
              Your subscription is set to cancel. You keep all Pro features until{" "}
              <strong>{new Date(userData.planEndsAt).toLocaleDateString()}</strong>.
            </p>
          )}
        </div>

        {/* Upgrade / Pro card */}
        <div className={cn(
          "editorial-card transition-all",
          isPro && "bg-amber-50/50 dark:bg-amber-900/10"
        )}>
          <div className="flex items-center gap-2 mb-4">
            {isPro
              ? <CheckCircle2 className="w-5 h-5 text-amber-500" />
              : <Star className="w-5 h-5 text-accent" />
            }
            <h2 className="font-semibold text-foreground">
              {isPro ? "Pro Membership" : "Upgrade to Pro"}
            </h2>
          </div>

          {/* Yearly toggle (free users only) */}
          {!isPro && (
            <div className="flex items-center gap-3 mb-5">
              <span className={cn("text-sm", !isYearly && "font-semibold text-foreground")}>Monthly</span>
              <button
                onClick={() => setIsYearly(v => !v)}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                  isYearly ? "bg-accent" : "bg-muted"
                )}
              >
                <span className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                  isYearly ? "translate-x-6" : "translate-x-1"
                )} />
              </button>
              <span className={cn("text-sm", isYearly && "font-semibold text-foreground")}>
                Yearly
                <span className="ml-1.5 text-[10px] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded-full">
                  SAVE 10%
                </span>
              </span>
            </div>
          )}

          {/* Price */}
          <div className="text-3xl font-bold text-foreground mb-1">
            USD {displayedPrice.toLocaleString()}
            <span className="text-base font-normal text-muted-foreground">{displayedPeriod}</span>
          </div>
          {isYearly && !isPro && (
            <p className="text-xs text-muted-foreground mb-4">
              USD {yearlyPrice.toLocaleString()} billed once a year
            </p>
          )}

          <p className="text-sm text-accent mb-5">
            {isPro ? "Enjoying full Pro access" : "Everything you need to grow on LinkedIn"}
          </p>

          {/* Features list */}
          <ul className="space-y-2.5 mb-6">
            {(isPro ? PRO_FEATURES : PRO_FEATURES).map((f, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm">
                <CheckCircle2 className={cn(
                  "w-4 h-4 shrink-0",
                  isPro ? "text-amber-500" : "text-accent"
                )} />
                <span className={isPro ? "text-foreground" : "text-muted-foreground"}>
                  {f}
                </span>
              </li>
            ))}
          </ul>

          {/* CTA button */}
          <Button
            onClick={isPro ? undefined : handleUpgrade}
            variant={isPro ? "outline" : "accent"}
            size="lg"
            className={cn(
              "w-full",
              isPro && "border-amber-200 text-amber-600 bg-transparent hover:bg-transparent cursor-default"
            )}
            disabled={isPro || isLoading}
          >
            {isPro ? (
              <><CheckCircle2 className="w-4 h-4 mr-2" /> Current Plan</>
            ) : (
              <><CreditCard className="w-4 h-4 mr-2" /> {isYearly ? "Upgrade — Yearly" : "Upgrade Now"}</>
            )}
          </Button>
        </div>

        {/* Free plan comparison (free users only) */}
        {!isPro && !isLoading && (
          <div className="editorial-card mt-4 opacity-70">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
              Free Plan — What's included
            </h3>
            <ul className="space-y-2">
              {FREE_FEATURES.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="w-3.5 h-3.5 shrink-0 text-muted-foreground/50" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}