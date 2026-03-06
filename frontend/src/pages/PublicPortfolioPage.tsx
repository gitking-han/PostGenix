import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Ghost, Shield, Calendar, Twitter, Linkedin, Moon, Sun, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
export default function PublicPortfolioPage() {
  const { username } = useParams();
  const { theme, setTheme } = useTheme();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Track which posts are expanded
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});

  const isVisitor = !localStorage.getItem("authToken");
  

  useEffect(() => {
    const recordView = async () => {
      // 1. Check if we've already counted this session
      const storageKey = `viewed_${username}`;
      if (sessionStorage.getItem(storageKey)) return;

      // 2. OPTIONAL: Don't count if the logged-in user is the owner
      // We check if the username in the URL matches the username in your local profile data
      const savedUser = localStorage.getItem("user"); // Or wherever you store your own user data
      if (savedUser) {
        const { username: loggedInUsername } = JSON.parse(savedUser);
        if (loggedInUsername === username) {
          console.log("Owner view - not counting");
          return;
        }
      }

      try {
        // 3. SET THE KEY IMMEDIATELY (Before the fetch)
        // This prevents React Strict Mode from firing it twice
        sessionStorage.setItem(storageKey, "true");

        await fetch(`/api/public/portfolio/${username}/view`, {
          method: "PATCH",
        });
      } catch (err) {
        // If it fails, we remove the key so we can try again on next refresh
        sessionStorage.removeItem(storageKey);
        console.error("View tracking error:", err);
      }
    };

    if (username) recordView();
  }, [username]);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const response = await fetch(`/api/public/portfolio/${username}`);
        if (!response.ok) throw new Error("Portfolio not found");
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, [username]);

  const toggleExpand = (postId: string) => {
    setExpandedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };
  // Inside PublicPortfolioPage component...

  useEffect(() => {
    // 1. Disable Right-Click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 2. Disable Copy Keyboard Shortcuts (Ctrl+C, Ctrl+U, etc)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl+C or Meta+C (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        return false;
      }
      // Optional: Prevent Ctrl+U (View Source)
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        return false;
      }
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground  select-none">

    <div className="flex h-screen items-center justify-center">
      <Loader2 className="animate-spin h-8 w-8 text-primary" />
    </div>

  </div>;
  if (error || !data) return <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">Portfolio not found.</div>;

  const { profile, featured, posts } = data;
  const fullName = `${profile.firstName} ${profile.lastName}`;
  const allPosts = [...featured, ...posts];
  const totalPosts = allPosts.length;
  const totalViews = profile.stats?.views || 0;

  // Calculate Resonance (Views per Post)
  // We use .toFixed(1) to show one decimal point (e.g., 5.4)
  const resonanceScore = totalPosts > 0 ? (totalViews / totalPosts).toFixed(1) : "0.0";
  return (
    <div className="min-h-screen bg-background relative select-none">
      <Button
        variant="ghost" size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="fixed top-4 right-4 z-50 rounded-full bg-background/80 backdrop-blur-sm"
      >
        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>

      {isVisitor && (
        <div className="watermark">
          <div className="watermark-text">{fullName} • PostGenix • {fullName} • PostGenix</div>
        </div>
      )}

      <header className="border-b border-border">
        <div className="section-container py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Ghost className="w-8 h-8 text-accent" />
            <span className="text-lg font-bold">Post<span className="text-accent">Genix</span></span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-4 h-4 text-accent" />
            <span>Protected Content</span>
          </div>
        </div>
      </header>

      {/* Author Hero */}
      <section className="py-12 lg:py-20 border-b border-border">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
                <AvatarImage src={profile.avatarUrl} referrerPolicy="no-referrer" />
                <AvatarFallback className="text-2xl">{profile.firstName?.[0]}{profile.lastName?.[0]}</AvatarFallback>
              </Avatar>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">{fullName}</h1>
            <p className="text-muted-foreground text-lg mb-4 max-w-xl mx-auto leading-tight">{profile.headline}</p>
            <p className="text-sm text-muted-foreground mb-6 max-w-lg mx-auto">{profile.bio}</p>

            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span><strong className="text-foreground">
                {resonanceScore}</strong> Profile Score
              </span>
              <span><strong className="text-foreground">{allPosts.length}</strong> posts</span>
              <span><strong className="text-foreground">{profile.stats?.views || 0}</strong> views</span>
            </div>

            <div className="flex items-center justify-center gap-3 mt-6">
              {profile.socialLinks?.twitter && (
                <Button variant="outline" size="sm" asChild>
                  <a href={profile.socialLinks.twitter} target="_blank"><Twitter className="w-4 h-4 mr-2" /> Twitter</a>
                </Button>
              )}
              {profile.socialLinks?.linkedin && (
                <Button variant="outline" size="sm" asChild>
                  <a href={profile.socialLinks.linkedin} target="_blank"><Linkedin className="w-4 h-4 mr-2" /> LinkedIn</a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-12 lg:py-20">
        <div className="section-container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-semibold mb-8">Recent Posts</h2>

            <div className="space-y-8">
              {allPosts.length > 0 ? (
                allPosts.map((post, index) => {
                  const isExpanded = expandedPosts[post._id];
                  const needsTruncation = post.content.length > 280;
                  const isLocked = isVisitor && index > 1;

                  return (
                    <article key={post._id} className="editorial-card relative">
                      {post.isFeatured && (
                        <span className="badge-premium absolute -top-2 right-4 text-xs">Featured</span>
                      )}

                      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(post.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span>• {post.postType}</span>
                      </div>

                      <div
                        className={cn(
                          "text-muted-foreground leading-relaxed whitespace-pre-wrap font-serif text-lg transition-all duration-300",
                          isLocked ? "blur-sm opacity-50 pointer-events-none" : "select-none"
                        )}
                      >
                        {isExpanded || !needsTruncation
                          ? post.content
                          : `${post.content.slice(0, 280)}...`}
                      </div>

                      {/* Show More / Show Less Button */}
                      {!isLocked && needsTruncation && (
                        <button
                          onClick={() => toggleExpand(post._id)}
                          className="mt-3 text-accent font-semibold flex items-center gap-1 hover:underline text-sm"
                        >
                          {isExpanded ? (
                            <>
                              Show less <ChevronUp className="w-4 h-4" />
                            </>
                          ) : (
                            <>
                              Read more <ChevronDown className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      )}

                      {/* visitor Lock Overlay */}
                      {isLocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-[3px] rounded-2xl">
                          <div className="text-center p-6 bg-background/90 border rounded-xl shadow-2xl mx-4">
                            <Shield className="w-8 h-8 text-accent mx-auto mb-2" />
                            <h3 className="font-bold">Content Protected</h3>
                            <p className="text-sm text-muted-foreground mb-4">Sign up to read the full post</p>
                            <Button variant="accent" size="sm" asChild>
                              <Link to="/signup">Sign Up Free</Link>
                            </Button>
                          </div>
                        </div>
                      )}

                      {!isLocked && (
                        <div className="mt-6 pt-4 border-t border-border/50 flex justify-between items-center">
                          <span className="text-xs text-muted-foreground italic">
                            Original content by {profile.firstName}
                          </span>
                        </div>
                      )}
                    </article>
                  );
                })
              ) : (
                /* EMPTY UI: Only shows if allPosts.length is 0 */
                <div className="py-20 text-center border-2 border-dashed border-border rounded-[2.5rem] bg-muted/5">
                  <Ghost className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-foreground/70">Portfolio is being curated</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto italic">
                    {profile.firstName} hasn't added any posts to this public gallery yet. Check back later for
                    fresh AI-powered insights.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="section-container">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Ghost className="w-5 h-5 text-accent" />
              <span className="font-bold tracking-tight">PostGenix</span>
            </div>
            <Link to="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
              Create your own portfolio
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}