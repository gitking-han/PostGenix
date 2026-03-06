import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  PenTool, FileText, Eye, ArrowRight,
  Sparkles, Clock, Star, Loader2
} from "lucide-react";
import { ProfileSpotlight } from "./ProfileSpotlight";
export default function DashboardPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [getUser, setGetUser] = useState<any>(null);
  // const [user, setUser] = useState<any>(null);

  const handleDismissSpotlight = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/onboarding/dismiss-guide`, {
        method: "PUT",
        headers: { "auth-token": localStorage.getItem("authToken") || "" }
      });

      if (res.ok) {
        // Update local state to hide it instantly
        setGetUser((prev: any) => ({ ...prev, showSpotlight: false }));
      }
    } catch (err) {
      console.error("Failed to dismiss guide", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("authToken") || "";
      try {
        // Fetch both posts and profile in parallel
        const [postsRes, profileRes, userRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/posts`, {
            headers: { "auth-token": token },
          }),
          fetch(`${import.meta.env.VITE_API_URL}/api/profile/me`, {
            headers: { "auth-token": token },
          }),
          fetch(`${import.meta.env.VITE_API_URL}/api/auth/get-user`, {
            headers: { "auth-token": token },
          }),
        ]);

        const postsData = await postsRes.json();
        const profileData = await profileRes.json();
        const userData = await userRes.json();

        if (postsRes.ok) setPosts(postsData);
        if (profileRes.ok) setProfile(profileData.profile);
        if (userRes.ok) setGetUser(userData)

      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  
  // Update stats dynamically based on fetched posts
  const stats = [
    {
      label: "LinkedIn Posts Created",
      value: loading ? "..." : posts.length.toString(),
      icon: FileText,
      trend: "All time"
    },
    {
      label: "Portfolio Views",
      value: loading ? "..." : (profile?.stats?.views || 0).toString(),
      icon: Eye,
      trend: "Live count"
    },
    {
      label: getUser?.plan?.toLowerCase() === 'pro' ? "Daily AI Credits" : "AI Credits Used",
      value: loading
        ? "..."
        : getUser?.plan?.toLowerCase() === 'pro'
          ? "Unlimited"
          : `${10 - (getUser?.credits ?? 10)}/10`, // If they have 7 left, they used 3.
      icon: Sparkles,
      trend: getUser?.plan?.toLowerCase() === 'pro' ? "Pro Plan Active" : "Resets in 12h"
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full overflow-x-hidden">
        {getUser?.showSpotlight && (
          <ProfileSpotlight onDismiss={handleDismissSpotlight} />
        )}
        
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Welcome back!</h1>
          <p className="text-muted-foreground">Here's what's happening with your LinkedIn content.</p>
        </div>

        {/* Upgrade Banner */}
        {/* Upgrade Banner - ONLY show if NOT Pro */}
        {getUser?.plan?.toLowerCase() !== 'pro' && (
          <div className="editorial-card bg-gradient-to-r from-accent/10 to-accent/5 border-accent/20 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <Star className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Upgrade to Pro</h3>
                <p className="text-sm text-muted-foreground">Get unlimited LinkedIn posts and advanced analytics</p>
              </div>
            </div>
            <Link to="/dashboard/billing">
              <Button variant="accent" size="sm">Upgrade Now</Button>
            </Link>
          </div>
        )}

        {/* Dynamic Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="editorial-card">
              <div className="flex items-center justify-between mb-3">
                <stat.icon className="w-5 h-5 text-accent" />
                <span className="text-xs text-muted-foreground">{stat.trend}</span>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <Link to="/dashboard/write" className="editorial-card hover-lift group flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
              <PenTool className="w-6 h-6 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">Write LinkedIn Post</h3>
              <p className="text-sm text-muted-foreground">Create a new AI-powered LinkedIn post</p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
          </Link>
          <Link to="/dashboard/portfolio" className="editorial-card hover-lift group flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Eye className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">View Portfolio</h3>
              <p className="text-sm text-muted-foreground">See your public LinkedIn portfolio</p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
          </Link>
        </div>

        {/* Dynamic Recent Posts */}
        <div className="editorial-card overflow-hidden w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Recent LinkedIn Posts</h2>
            <Link to="/dashboard/posts" className="shrink-0">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>

          <div className="space-y-3 w-full">
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
                  {/* Subtle Left Accent Line on Hover */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 group-hover:h-8 bg-accent rounded-r-full transition-all duration-300" />

                  <div className="flex-1 min-w-0 pr-4">
                    <h4 className="font-medium text-foreground truncate block group-hover:text-accent transition-colors duration-300">
                      {post.prompt}
                    </h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1.5 opacity-80">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      {new Date(post.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>

                  {/* The Animated Arrow */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted group-hover:bg-accent/10 group-hover:text-accent transition-all duration-300">
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">No posts found. Start writing to see them here!</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}