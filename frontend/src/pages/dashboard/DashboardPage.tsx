import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  PenTool, FileText, ArrowRight,
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

interface BrandIntelligence {
  nicheConsistency: number;
  voiceConsistency: number;
  postingFrequency: number;
  contentVariety:   number;
}

interface BrandScore {
  score:        number;
  weeklyChange: number;
}

interface BrandDrift {
  driftDetected: boolean;
  driftTopic:    string | null;
  userNiche:     string | null;
}

interface EngagementData {
  avgEngagement: number;
  nicheAvg:      number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function barColor(value: number) {
  if (value >= 70) return "bg-emerald-500";
  if (value >= 40) return "bg-amber-500";
  return "bg-red-500";
}

function insightIcon(type: BrandInsight["type"]) {
  if (type === "success")
    return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />;
  if (type === "warning")
    return <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />;
  return <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />;
}

const API = (path: string) => `${import.meta.env.VITE_API_URL}${path}`;
const authHeaders = () => ({ "auth-token": localStorage.getItem("authToken") || "" });

// ─── Component ────────────────────────────────────────────────────────────────
export default function DashboardPage() {

  // ── Core state ──────────────────────────────────────────────────────────────
  const [posts,   setPosts]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [getUser, setGetUser] = useState<any>(null);

  // ── Analytics state ─────────────────────────────────────────────────────────
  const [brandScore,       setBrandScore]       = useState<BrandScore | null>(null);
  const [intelligence,     setIntelligence]     = useState<BrandIntelligence | null>(null);
  const [drift,            setDrift]            = useState<BrandDrift | null>(null);
  const [insights,         setInsights]         = useState<BrandInsight[]>([]);
  const [engagement,       setEngagement]       = useState<EngagementData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // ─── Dismiss spotlight ──────────────────────────────────────────────────────
  const handleDismissSpotlight = async () => {
    try {
      const res = await fetch(API("/api/auth/onboarding/dismiss-guide"), {
        method: "PUT",
        headers: authHeaders(),
      });
      if (res.ok) setGetUser((prev: any) => ({ ...prev, showSpotlight: false }));
    } catch (err) {
      console.error("Failed to dismiss guide", err);
    }
  };

  // ─── Fetch 1: core data (posts + user) — fast, no AI ────────────────────────
  useEffect(() => {
    const fetchCoreData = async () => {
      try {
        const [postsRes, userRes] = await Promise.all([
          fetch(API("/api/posts"),         { headers: authHeaders() }),
          fetch(API("/api/auth/get-user"), { headers: authHeaders() }),
        ]);
        const postsData = await postsRes.json();
        const userData  = await userRes.json();
        if (postsRes.ok) setPosts(postsData);
        if (userRes.ok)  setGetUser(userData);
      } catch (err) {
        console.error("Core data fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCoreData();
  }, []);

  // ─── Fetch 2: analytics — runs in parallel, won't block core UI ─────────────
  useEffect(() => {
    const fetchAnalytics = async () => {
      setAnalyticsLoading(true);
      try {
        const [scoreRes, intelligenceRes, driftRes, insightsRes, engagementRes] =
          await Promise.allSettled([
            fetch(API("/api/analytics/brand-score"),        { headers: authHeaders() }),
            fetch(API("/api/analytics/brand-intelligence"), { headers: authHeaders() }),
            fetch(API("/api/analytics/brand-drift"),        { headers: authHeaders() }),
            fetch(API("/api/analytics/insights"),           { headers: authHeaders() }),
            fetch(API("/api/analytics/engagement"),         { headers: authHeaders() }),
          ]);

        if (scoreRes.status === "fulfilled" && scoreRes.value.ok) {
          const d = await scoreRes.value.json();
          setBrandScore({ score: d.score, weeklyChange: d.weeklyChange });
        }

        if (intelligenceRes.status === "fulfilled" && intelligenceRes.value.ok) {
          const d = await intelligenceRes.value.json();
          setIntelligence(d);
        }

        if (driftRes.status === "fulfilled" && driftRes.value.ok) {
          const d = await driftRes.value.json();
          setDrift(d);
        }

        if (insightsRes.status === "fulfilled" && insightsRes.value.ok) {
          const d = await insightsRes.value.json();
          setInsights(d.insights || []);
        }

        if (engagementRes.status === "fulfilled" && engagementRes.value.ok) {
          const d = await engagementRes.value.json();
          setEngagement({ avgEngagement: d.avgEngagement, nicheAvg: d.nicheAvg });
        }

      } catch (err) {
        console.error("Analytics fetch failed", err);
      } finally {
        setAnalyticsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  // ─── Derived values ──────────────────────────────────────────────────────────
  const isPro = getUser?.plan?.toLowerCase() === "pro";

  const weeklyChangeLabel = brandScore
    ? `${brandScore.weeklyChange >= 0 ? "+" : ""}${brandScore.weeklyChange} from last week`
    : "Calculating...";

  const engagementTrend = engagement
    ? engagement.avgEngagement >= engagement.nicheAvg
      ? `Above niche avg ${engagement.nicheAvg}%`
      : `Below niche avg ${engagement.nicheAvg}%`
    : "Fetching...";

  // ─── Stat cards ──────────────────────────────────────────────────────────────
  const stats = [
    {
      label:      "Brand score",
      value:      loading || analyticsLoading
                    ? "..."
                    : brandScore != null ? brandScore.score.toString() : "—",
      suffix:     "/100",
      icon:       TrendingUp,
      trend:      analyticsLoading ? "Calculating..." : weeklyChangeLabel,
      trendColor: !brandScore || brandScore.weeklyChange >= 0
                    ? "text-amber-500"
                    : "text-red-400",
    },
    {
      label:      "Posts published",
      value:      loading ? "..." : posts.length.toString(),
      suffix:     "",
      icon:       FileText,
      trend:      "All time",
      trendColor: "text-muted-foreground",
    },
    {
      label:      "Avg engagement",
      value:      analyticsLoading
                    ? "..."
                    : engagement != null ? engagement.avgEngagement.toString() : "—",
      suffix:     engagement != null ? "%" : "",
      icon:       BarChart2,
      trend:      analyticsLoading ? "Loading..." : engagementTrend,
      trendColor: engagement && engagement.avgEngagement >= engagement.nicheAvg
                    ? "text-emerald-500"
                    : "text-red-400",
    },
    {
      label:      isPro ? "Daily AI credits" : "AI credits used",
      value:      loading
                    ? "..."
                    : isPro ? "∞" : `${10 - (getUser?.credits ?? 10)}`,
      suffix:     isPro ? "" : "/10",
      icon:       Sparkles,
      trend:      isPro ? "Pro plan active" : "Resets in 12h",
      trendColor: "text-muted-foreground",
    },
  ];

  // ─── Brand bars (built from intelligence API response) ───────────────────────
  const brandBars = intelligence
    ? [
        { label: "Niche consistency",  value: intelligence.nicheConsistency },
        { label: "Voice consistency",  value: intelligence.voiceConsistency },
        { label: "Posting frequency",  value: intelligence.postingFrequency },
        { label: "Content variety",    value: intelligence.contentVariety   },
      ]
    : [];

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full overflow-x-hidden">

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

        {/* ── Voice Fingerprint banner ─────────────────────────────────────
            BUG 3 FIXED: Was `!!getUser?.voiceFingerprint` — this evaluated to
            `true` for any user whose User document had the voiceFingerprint
            subdocument initialized with Mongoose defaults (all null/empty),
            even if they had never generated a fingerprint.

            Fix: check `voiceFingerprint?.generatedAt` which is only set after
            a successful POST /api/ai/voice-fingerprint call, making this banner
            exclusively visible to users who actually have a real fingerprint.
        ──────────────────────────────────────────────────────────────────── */}
        {!!getUser?.voiceFingerprint?.generatedAt && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-xl border border-accent/30 bg-accent/5 mb-6">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
              <Mic2 className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm">Your Voice Fingerprint is ready</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {getUser.voiceFingerprint?.summary ||
                  "Your tone and writing style have been mapped. Posts now generate in your voice."}
              </p>
            </div>
            <Link to="/dashboard/write" className="shrink-0">
              <Button variant="outline" size="sm">View Fingerprint</Button>
            </Link>
          </div>
        )}

        {/* ── Upgrade banner (free only) ──────────────────────────────────── */}
        {!isPro && (
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

        {/* ── Brand Drift Alert — fully dynamic ──────────────────────────── */}
        {drift?.driftDetected && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-xl border border-red-500/30 bg-red-500/5 mb-6">
            <div className="w-10 h-10 rounded-lg bg-red-500/15 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-red-400 text-sm">Brand drift detected</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {drift.driftTopic
                  ? `Your last 3 posts are about "${drift.driftTopic}" — your niche is ${drift.userNiche}. Refocus before it affects reach.`
                  : "Your recent posts seem off-niche. Refocus before it affects reach."}
              </p>
            </div>
            <Link to="/dashboard/write" className="shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="border-red-500/40 text-red-400 hover:bg-red-500/10"
              >
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
                  <span className="text-base font-normal text-muted-foreground">
                    {stat.suffix}
                  </span>
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

            {analyticsLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-accent" />
              </div>
            ) : brandBars.length > 0 ? (
              <div className="space-y-4">
                {brandBars.map((bar) => (
                  <div key={bar.label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">{bar.label}</span>
                      <span className="text-foreground font-medium">{bar.value}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColor(bar.value)} transition-all duration-700`}
                        style={{ width: `${bar.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-2">
                Write a few posts to see your brand intelligence scores.
              </p>
            )}
          </div>

          {/* What's Working insights */}
          <div className="editorial-card">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                What's Working
              </h2>
            </div>

            {analyticsLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-accent" />
              </div>
            ) : insights.length > 0 ? (
              <div className="space-y-3">
                {insights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    {insightIcon(insight.type)}
                    <div>
                      <p className="text-sm text-foreground leading-snug">{insight.text}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{insight.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-2">
                Write a few posts to start seeing insights.
              </p>
            )}
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
              posts.slice(0, 3).map((post) => {
                const likes       = post.engagement?.likes       ?? 0;
                const comments    = post.engagement?.comments    ?? 0;
                const impressions = post.engagement?.impressions ?? 0;
                const denominator = impressions > 0 ? impressions : 500;
                const engRate = post.linkedinPostId
                  ? parseFloat((((likes + comments) / denominator) * 100).toFixed(1))
                  : null;

                return (
                  <Link
                    to={`/dashboard/posts/${post._id}`}
                    key={post._id}
                    className="group relative flex items-center justify-between p-4 bg-transparent hover:bg-white dark:hover:bg-slate-900/50 rounded-xl transition-all duration-300 ease-out border border-transparent hover:border-border hover:shadow-sm"
                  >
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 group-hover:h-8 bg-accent rounded-r-full transition-all duration-300" />

                    <div className="flex-1 min-w-0 pr-4">
                      <h4 className="font-medium text-foreground truncate block group-hover:text-accent transition-colors duration-300">
                        {post.prompt}
                      </h4>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 opacity-80">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          {new Date(post.createdAt).toLocaleDateString(undefined, {
                            month: "short", day: "numeric", year: "numeric",
                          })}
                        </p>

                        {post.postType && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent/15 text-accent uppercase tracking-wide">
                            {post.postType}
                          </span>
                        )}

                        {engRate !== null && (
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wide ${
                            engRate >= 3
                              ? "bg-emerald-500/15 text-emerald-500"
                              : "bg-red-500/15 text-red-400"
                          }`}>
                            {engRate}% eng.
                          </span>
                        )}

                        {post.linkedinPostId && engRate === null && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 uppercase tracking-wide">
                            On LinkedIn
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted group-hover:bg-accent/10 group-hover:text-accent transition-all duration-300">
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </Link>
                );
              })
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