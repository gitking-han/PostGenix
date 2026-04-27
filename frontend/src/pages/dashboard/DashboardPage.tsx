import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  PenTool, FileText, Eye, ArrowRight,
  Sparkles, Clock, Star, Loader2,
  AlertTriangle, TrendingUp, Mic2,
  BarChart2, Lightbulb, CheckCircle2,
  AlertCircle, Info
} from "lucide-react";
import { ProfileSpotlight } from "./ProfileSpotlight";

// ─── Types ────────────────────────────────────────────────────────────────────
interface BrandInsight {
  type: "success" | "warning" | "info";
  text: string;
  sub: string;
}

interface BrandBar {
  label: string;
  value: number; // 0–100
  color: "green" | "amber" | "red";
}

// ─── Static placeholder data (replace with API responses later) ───────────────
const BRAND_BARS: BrandBar[] = [
  { label: "Niche consistency",  value: 82, color: "green" },
  { label: "Voice consistency",  value: 91, color: "green" },
  { label: "Posting frequency",  value: 68, color: "amber" },
  { label: "Content variety",    value: 44, color: "red"   },
];

const BRAND_INSIGHTS: BrandInsight[] = [
  {
    type: "success",
    text: "Hook-style posts get 3.4× more comments than question posts",
    sub: "Based on your last 12 posts",
  },
  {
    type: "warning",
    text: "Tuesday 9 am posts outperform Friday posts by 2.1×",
    sub: "Your best posting window",
  },
  {
    type: "info",
    text: "You haven't posted about case studies — top topic in your niche",
    sub: "Content gap opportunity",
  },
];

// Brand drift — set to true to preview the alert banner
const BRAND_DRIFT_ACTIVE = true;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function barColor(color: BrandBar["color"]) {
  if (color === "green") return "bg-emerald-500";
  if (color === "amber") return "bg-amber-500";
  return "bg-red-500";
}

function insightIcon(type: BrandInsight["type"]) {
  if (type === "success")
    return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />;
  if (type === "warning")
    return <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />;
  return <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [posts, setPosts]       = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [profile, setProfile]   = useState<any>(null);
  const [getUser, setGetUser]   = useState<any>(null);

  const handleDismissSpotlight = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/onboarding/dismiss-guide`,
        {
          method: "PUT",
          headers: { "auth-token": localStorage.getItem("authToken") || "" },
        }
      );
      if (res.ok) setGetUser((prev: any) => ({ ...prev, showSpotlight: false }));
    } catch (err) {
      console.error("Failed to dismiss guide", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("authToken") || "";
      try {
        const [postsRes, profileRes, userRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/posts`,           { headers: { "auth-token": token } }),
          fetch(`${import.meta.env.VITE_API_URL}/api/profile/me`,      { headers: { "auth-token": token } }),
          fetch(`${import.meta.env.VITE_API_URL}/api/auth/get-user`,   { headers: { "auth-token": token } }),
        ]);
        const postsData   = await postsRes.json();
        const profileData = await profileRes.json();
        const userData    = await userRes.json();
        if (postsRes.ok)   setPosts(postsData);
        if (profileRes.ok) setProfile(profileData.profile);
        if (userRes.ok)    setGetUser(userData);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Stats (4 cards now) ────────────────────────────────────────────────────
  const stats = [
    {
      label: "Brand score",
      // TODO: replace 74 with real brandScore from API
      value: loading ? "..." : "74",
      suffix: "/100",
      icon: TrendingUp,
      trend: "+6 from last week",
      trendColor: "text-amber-500",
    },
    {
      label: "Posts published",
      value: loading ? "..." : posts.length.toString(),
      suffix: "",
      icon: FileText,
      trend: "All time",
      trendColor: "text-muted-foreground",
    },
    {
      label: "Avg engagement",
      // TODO: replace 4.2 with real avg from API
      value: loading ? "..." : "4.2",
      suffix: "%",
      icon: BarChart2,
      trend: "Above niche avg 2.8%",
      trendColor: "text-emerald-500",
    },
    {
      label: getUser?.plan?.toLowerCase() === "pro" ? "Daily AI credits" : "AI credits used",
      value: loading
        ? "..."
        : getUser?.plan?.toLowerCase() === "pro"
          ? "∞"
          : `${10 - (getUser?.credits ?? 10)}`,
      suffix: getUser?.plan?.toLowerCase() === "pro" ? "" : "/10",
      icon: Sparkles,
      trend: getUser?.plan?.toLowerCase() === "pro" ? "Pro plan active" : "Resets in 12h",
      trendColor: "text-muted-foreground",
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full overflow-x-hidden">

        {/* Onboarding spotlight */}
        {getUser?.showSpotlight && (
          <ProfileSpotlight onDismiss={handleDismissSpotlight} />
        )}

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">
              Welcome back{getUser?.name ? `, ${getUser.name.split(" ")[0]}` : ""}!
            </h1>
            <p className="text-muted-foreground text-sm">Your LinkedIn brand health this week</p>
          </div>
          <Link to="/dashboard/write">
            <Button variant="accent" size="sm" className="hidden sm:flex items-center gap-2">
              <PenTool className="w-4 h-4" /> Write Post
            </Button>
          </Link>
        </div>

        {/* ── Voice Fingerprint ready banner (show when fingerprint exists) ── */}
        {/* TODO: replace `false` with `!!getUser?.voiceFingerprint` */}
        {false && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-xl border border-accent/30 bg-accent/5 mb-6">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
              <Mic2 className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm">Your Voice Fingerprint is ready</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {/* TODO: replace with real fingerprint summary */}
                Analyzed 23 posts — your tone: Direct, data-driven, story-led. All posts now generated in your voice.
              </p>
            </div>
            <Link to="/dashboard/voice" className="shrink-0">
              <Button variant="outline" size="sm">View Fingerprint</Button>
            </Link>
          </div>
        )}

        {/* ── Upgrade banner (free users only) ───────────────────────────── */}
        {getUser?.plan?.toLowerCase() !== "pro" && (
          <div className="editorial-card bg-gradient-to-r from-accent/10 to-accent/5 border-accent/20 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                <Star className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Upgrade to Pro</h3>
                <p className="text-sm text-muted-foreground">
                  Unlock Voice Fingerprint, Brand Drift Alerts &amp; Analytics
                </p>
              </div>
            </div>
            <Link to="/dashboard/billing">
              <Button variant="accent" size="sm">Upgrade Now</Button>
            </Link>
          </div>
        )}

        {/* ── Brand Drift Alert ───────────────────────────────────────────── */}
        {/* TODO: replace BRAND_DRIFT_ACTIVE with real drift detection from API */}
        {BRAND_DRIFT_ACTIVE && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-xl border border-red-500/30 bg-red-500/5 mb-6">
            <div className="w-10 h-10 rounded-lg bg-red-500/15 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-red-400 text-sm">Brand drift detected</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {/* TODO: replace with dynamic drift topic from API */}
                Your last 3 posts are about general productivity — your niche is LinkedIn growth. Refocus before it affects reach.
              </p>
            </div>
            <Link to="/dashboard/write" className="shrink-0">
              <Button variant="outline" size="sm" className="border-red-500/40 text-red-400 hover:bg-red-500/10">
                Fix this
              </Button>
            </Link>
          </div>
        )}

        {/* ── 4 Stat cards ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, i) => (
            <div key={i} className="editorial-card">
              <div className="flex items-center justify-between mb-3">
                <stat.icon className="w-4 h-4 text-accent" />
                <span className={`text-xs ${stat.trendColor}`}>{stat.trend}</span>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">
                {stat.value}
                {stat.suffix && (
                  <span className="text-base font-normal text-muted-foreground">{stat.suffix}</span>
                )}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ── Brand Intelligence + What's Working ─────────────────────────── */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">

          {/* Brand Intelligence bars */}
          <div className="editorial-card">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Brand Intelligence
              </h2>
            </div>
            <div className="space-y-4">
              {BRAND_BARS.map((bar) => (
                <div key={bar.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">{bar.label}</span>
                    <span className="text-foreground font-medium">{bar.value}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${barColor(bar.color)} transition-all duration-700`}
                      style={{ width: `${bar.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {/* TODO: wire BRAND_BARS values from /api/analytics/brand-score */}
          </div>

          {/* What's Working insights */}
          <div className="editorial-card">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                What's Working
              </h2>
            </div>
            <div className="space-y-3">
              {BRAND_INSIGHTS.map((insight, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  {insightIcon(insight.type)}
                  <div>
                    <p className="text-sm text-foreground leading-snug">{insight.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{insight.sub}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* TODO: wire BRAND_INSIGHTS from /api/analytics/insights */}
          </div>
        </div>

        {/* ── Recent Posts ─────────────────────────────────────────────────── */}
        <div className="editorial-card overflow-hidden w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Recent LinkedIn Posts</h2>
            <Link to="/dashboard/posts" className="shrink-0">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>

          <div className="space-y-1 w-full">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
              </div>
            ) : posts.length > 0 ? (
              posts.slice(0, 3).map((post) => (
                <Link
                  to={`/dashboard/posts/${post._id}`}
                  key={post._id}
                  className="group relative flex items-center justify-between p-4 bg-transparent hover:bg-white dark:hover:bg-slate-900/50 rounded-xl transition-all duration-300 ease-out border border-transparent hover:border-border hover:shadow-sm"
                >
                  {/* Left accent line on hover */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 group-hover:h-8 bg-accent rounded-r-full transition-all duration-300" />

                  <div className="flex-1 min-w-0 pr-4">
                    <h4 className="font-medium text-foreground truncate block group-hover:text-accent transition-colors duration-300">
                      {post.prompt}
                    </h4>
                    <div className="flex items-center gap-3 mt-1.5">
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 opacity-80">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        {new Date(post.createdAt).toLocaleDateString(undefined, {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </p>
                      {/* Post type badge — TODO: replace "SHORT" with post.style from API */}
                      {post.style && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent/15 text-accent uppercase tracking-wide">
                          {post.style}
                        </span>
                      )}
                      {/* Engagement badge — TODO: replace with real post.engagement from API */}
                      {post.engagement != null && (
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wide ${
                          post.engagement >= 3
                            ? "bg-emerald-500/15 text-emerald-500"
                            : "bg-red-500/15 text-red-400"
                        }`}>
                          {post.engagement}% eng.
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted group-hover:bg-accent/10 group-hover:text-accent transition-all duration-300">
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No posts yet. Start writing to see them here!
              </p>
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}