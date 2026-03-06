import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ExternalLink, Eye, Shield, Share2, Settings, Star, EyeOff, Copy } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function PortfolioManagePage() {
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("No token found. Please login again.");
        return;
      }

      const headers = {
        "auth-token": token,
        "Content-Type": "application/json"
      };

      console.log("Fetching from: /api/profile/me and /api/posts...");

      const [profileRes, postsRes] = await Promise.all([
        fetch("/api/profile/me", { headers }),
        fetch("/api/posts", { headers })
      ]);

      // Check if the server actually responded with success
      if (!profileRes.ok) {
        const errorData = await profileRes.json();
        console.error("Profile Error:", errorData);
        throw new Error(`Profile: ${profileRes.status} ${errorData.error || ""}`);
      }

      if (!postsRes.ok) {
        console.error("Posts Error status:", postsRes.status);
        throw new Error(`Posts: ${postsRes.status}`);
      }

      const profileData = await profileRes.json();
      const postsData = await postsRes.json();

      console.log("Data received successfully:", { profileData, postsData });

      setProfile(profileData.profile);
      setPosts(postsData);
    } catch (error: any) {
      console.error("Full Fetch Error:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (postId: string, field: "visibility" | "feature") => {
    try {
      const post = posts.find((p) => p._id === postId);
      const newValue = field === "visibility" ? !post.isPublic : !post.isFeatured;
      const endpoint = field === "visibility" ? "visibility" : "feature";
      const bodyKey = field === "visibility" ? "isPublic" : "isFeatured";

      const res = await fetch(`/api/posts/${postId}/${endpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("authToken") || "",
        },
        body: JSON.stringify({ [bodyKey]: newValue }),
      });

      if (res.ok) {
        toast.success(`Post ${field} updated`);
        fetchPortfolioData(); // Refresh list
      }
    } catch (error) {
      toast.error("Failed to update post");
    }
  };

  const copyToClipboard = () => {
    const url = `postgenix.app/portfolio/${profile?.username}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const publicPostsCount = posts.filter(p => p.isPublic).length;

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Your LinkedIn Portfolio</h1>
            <p className="text-muted-foreground">Manage your public profile and LinkedIn posts.</p>
          </div>
          <Link to={`/portfolio/${profile?.username || ""}`} target="_blank">
            <Button variant="outline">
              <ExternalLink className="w-4 h-4 mr-2" /> View Live
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="editorial-card text-center">
            <Eye className="w-6 h-6 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">
              {profile?.stats?.postsGenerated || 0}
            </div>
            <div className="text-sm text-muted-foreground">Total Content</div>
          </div>
          <div className="editorial-card text-center">
            <Share2 className="w-6 h-6 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">
              {publicPostsCount}
            </div>
            <div className="text-sm text-muted-foreground">Public Posts</div>
          </div>
          <div className="editorial-card text-center">
            <Shield className="w-6 h-6 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">Active</div>
            <div className="text-sm text-muted-foreground">Protection</div>
          </div>
        </div>

        {/* URL Card */}
        <div className="editorial-card mb-6">
          <h2 className="font-semibold text-foreground mb-4">Portfolio URL</h2>

          {/* flex-col on mobile, flex-row on desktop */}
          <div className="flex flex-col sm:flex-row gap-3">

            {/* 1. Added break-all to prevent long URLs from pushing the screen wide */}
            {/* 2. Added min-w-0 to allow flex-1 to actually shrink */}
            <div className="flex-1 bg-muted rounded-lg px-4 py-3 text-muted-foreground font-mono text-sm break-all min-w-0 border border-border">
              postgenix.app/portfolio/{profile?.username || "loading..."}
            </div>

            {/* Button group container */}
            <div className="flex gap-2 w-full sm:w-auto">
              {/* flex-1 on mobile makes the button grow to fill space */}
              <Button
                variant="outline"
                onClick={copyToClipboard}
                className="flex-1 sm:flex-none whitespace-nowrap"
              >
                <Copy className="w-4 h-4 mr-2" />
                <span className="inline">Copy Link</span>
              </Button>

              <Button variant="outline" className="shrink-0">
                <Settings className="w-4 h-4" />
              </Button>
            </div>

          </div>
        </div>

        {/* Posts Management List */}
        <div className="editorial-card">
          <h2 className="font-semibold text-foreground mb-4">
            Manage Portfolio Posts ({posts.length})
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Select which posts to display on your public portfolio. Featured posts appear at the top.
          </p>

          <div className="space-y-3">
            {posts.map((post) => (
              <div
                key={post._id}
                className="flex items-center justify-between p-3 rounded-xl border border-border bg-card/50"
              >
                <div className="flex-1 truncate mr-4">
                  <p className="text-sm text-foreground truncate">{post.content}</p>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    {post.postType} • {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={post.isFeatured ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleToggle(post._id, "feature")}
                    title="Feature this post"
                  >
                    <Star className={`h-4 w-4 ${post.isFeatured ? "fill-current" : ""}`} />
                  </Button>

                  <Button
                    variant={post.isPublic ? "outline" : "ghost"}
                    size="sm"
                    className={`h-8 w-8 p-0 ${post.isPublic ? "text-accent border-accent/20" : "text-muted-foreground"}`}
                    onClick={() => handleToggle(post._id, "visibility")}
                    title={post.isPublic ? "Make Private" : "Make Public"}
                  >
                    {post.isPublic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            ))}

            {posts.length === 0 && !loading && (
              <div className="text-center py-6 text-muted-foreground text-sm italic">
                No posts found. Generate and save some posts first!
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}