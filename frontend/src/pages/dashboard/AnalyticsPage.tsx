import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  BarChart3, LineChart, TrendingUp, Loader2, 
  AlertCircle, RefreshCw, CheckCircle2
} from "lucide-react";
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface WeeklyPerformance {
  week: string;
  posts: number;
  published: number;
  avgEngagement: number;
}

interface PostTypePerformance {
  postType: string;
  count: number;
  publishedCount: number;
  avgEngagement: number;
  percentage: number;
}

interface ContentGap {
  topic: string;
  reason: string;
  difficulty: string;
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const API = (path: string) => `${import.meta.env.VITE_API_URL}${path}`;
const authHeaders = () => ({ "auth-token": localStorage.getItem("authToken") || "" });

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colors = {
    Easy: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    Medium: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    Hard: "bg-red-500/15 text-red-600 dark:text-red-400",
  } as Record<string, string>;
  
  return (
    <span className={cn(
      "text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide",
      colors[difficulty] || colors.Medium
    )}>
      {difficulty}
    </span>
  );
}

function EngagementIndicator({ value }: { value: number }) {
  if (value >= 3) return <div className="w-2 h-2 rounded-full bg-emerald-500" title="Above avg" />;
  if (value >= 1) return <div className="w-2 h-2 rounded-full bg-amber-500" title="Average" />;
  return <div className="w-2 h-2 rounded-full bg-red-400" title="Below avg" />;
}

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function AnalyticsPage() {
  const [weeklyData, setWeeklyData] = useState<WeeklyPerformance[]>([]);
  const [typeData, setTypeData] = useState<PostTypePerformance[]>([]);
  const [gaps, setGaps] = useState<ContentGap[]>([]);
  
  const [loadingWeekly, setLoadingWeekly] = useState(true);
  const [loadingType, setLoadingType] = useState(true);
  const [loadingGaps, setLoadingGaps] = useState(true);
  
  const [errorWeekly, setErrorWeekly] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<string | null>(null);
  const [errorGaps, setErrorGaps] = useState<string | null>(null);

  /* ── Fetch all analytics data ──────────────────────────────────────────── */
  useEffect(() => {
    const fetchAnalytics = async () => {
      // Fetch weekly performance
      try {
        setLoadingWeekly(true);
        setErrorWeekly(null);
        const res = await fetch(API("/api/analytics/weekly-performance"), {
          headers: authHeaders(),
        });
        if (!res.ok) throw new Error("Failed to load performance data");
        const data = await res.json();
        setWeeklyData(data.weeks || []);
      } catch (err) {
        setErrorWeekly(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoadingWeekly(false);
      }

      // Fetch post type performance
      try {
        setLoadingType(true);
        setErrorType(null);
        const res = await fetch(API("/api/analytics/post-type-performance"), {
          headers: authHeaders(),
        });
        if (!res.ok) throw new Error("Failed to load post type data");
        const data = await res.json();
        setTypeData(data.breakdown || []);
      } catch (err) {
        setErrorType(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoadingType(false);
      }

      // Fetch content gaps
      try {
        setLoadingGaps(true);
        setErrorGaps(null);
        const res = await fetch(API("/api/analytics/content-gaps"), {
          headers: authHeaders(),
        });
        if (!res.ok) throw new Error("Failed to load content gaps");
        const data = await res.json();
        setGaps(data.gaps || []);
      } catch (err) {
        setErrorGaps(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoadingGaps(false);
      }
    };

    fetchAnalytics();
  }, []);

  /* ── Render ──────────────────────────────────────────────────────────────── */
  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-accent" />
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Analytics</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Track your performance, post types, and content opportunities
          </p>
        </div>

        {/* Grid layout for three sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ─── Section 1: Performance Over Time (2/3 width) ──────────────── */}
          <div className="lg:col-span-2">
            <div className="border border-border/50 rounded-xl bg-card/50 backdrop-blur-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <LineChart className="w-4 h-4 text-accent" />
                  <h2 className="text-lg font-semibold text-foreground">Performance over time</h2>
                </div>
              </div>

              {loadingWeekly && (
                <div className="flex justify-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin text-accent" />
                </div>
              )}

              {errorWeekly && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                  <span className="text-sm text-red-400">{errorWeekly}</span>
                </div>
              )}

              {!loadingWeekly && !errorWeekly && weeklyData.length > 0 && (
                <ResponsiveContainer width="100%" height={280}>
                  <RechartsLineChart data={weeklyData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="week"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <YAxis 
                      label={{ value: "Engagement %", angle: -90, position: "insideLeft" }}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="avgEngagement"
                      stroke="hsl(var(--accent))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--accent))", r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Avg Engagement %"
                    />
                    <Line
                      type="monotone"
                      dataKey="published"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Posts Published"
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              )}

              {!loadingWeekly && !errorWeekly && weeklyData.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <TrendingUp className="w-8 h-8 text-muted-foreground/40 mb-3" />
                  <p className="text-muted-foreground text-sm">No performance data yet</p>
                  <p className="text-xs text-muted-foreground/60">Publish your first post to see analytics</p>
                </div>
              )}
            </div>
          </div>

          {/* ─── Section 2: Post Type Breakdown (1/3 width) ─────────────────── */}
          <div>
            <div className="border border-border/50 rounded-xl bg-card/50 backdrop-blur-sm p-6 h-full">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-4 h-4 text-accent" />
                <h2 className="text-lg font-semibold text-foreground">Post type breakdown</h2>
              </div>

              {loadingType && (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-accent" />
                </div>
              )}

              {errorType && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="text-xs text-red-400">{errorType}</span>
                </div>
              )}

              {!loadingType && !errorType && typeData.length > 0 && (
                <div className="space-y-3">
                  {typeData.map((type) => (
                    <div key={type.postType} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          {type.postType}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {type.percentage}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-accent/80 rounded-full transition-all"
                          style={{ width: `${type.percentage}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>{type.count} posts</span>
                        <span>{type.avgEngagement.toFixed(1)}% eng.</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loadingType && !errorType && typeData.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <BarChart3 className="w-6 h-6 text-muted-foreground/40 mb-2" />
                  <p className="text-muted-foreground text-xs">No posts yet</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ─── Section 3: Content Gap Map (full width) ──────────────────────── */}
        <div className="mt-6">
          <div className="border border-border/50 rounded-xl bg-card/50 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                <h2 className="text-lg font-semibold text-foreground">Content gap map</h2>
              </div>
            </div>

            {loadingGaps && (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
              </div>
            )}

            {errorGaps && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <span className="text-sm text-red-400">{errorGaps}</span>
              </div>
            )}

            {!loadingGaps && !errorGaps && gaps.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gaps.map((gap, idx) => (
                  <div
                    key={idx}
                    className="border border-border/30 rounded-lg p-4 bg-background/50 hover:bg-background/80 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-semibold text-foreground text-sm flex-1">
                        {gap.topic}
                      </h3>
                      <DifficultyBadge difficulty={gap.difficulty} />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {gap.reason}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {!loadingGaps && !errorGaps && gaps.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="w-8 h-8 text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground text-sm">Set your niche in Profile to unlock content gap analysis</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
