import { useEffect, useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, Plus, Eye, Edit, Trash2, Linkedin,
  Loader2, X, AlertTriangle, TrendingUp, TrendingDown,
  Minus, ExternalLink,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface Post {
  _id: string;
  prompt: string;
  content: string;
  postType: string;
  tone: string;
  createdAt: string;
  linkedinPostId?: string;
  linkedinUrl?: string;
  publishedAt?: string;
  engagement?: {
    likes: number;
    comments: number;
    impressions: number;
    fetchedAt?: string;
  };
}

/* ─── Constants ──────────────────────────────────────────────────────────── */
const FILTERS   = ["All", "Short", "Story", "List", "Hot Take", "Career"];
const NICHE_AVG = 2.8; // industry benchmark engagement %

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function calcEngagement(post: Post): number | null {
  if (!post.linkedinPostId) return null; // only published posts
  const likes      = post.engagement?.likes       ?? 0;
  const comments   = post.engagement?.comments    ?? 0;
  const impressions = post.engagement?.impressions ?? 0;
  const denom      = impressions > 0 ? impressions : 500;
  return parseFloat((((likes + comments) / denom) * 100).toFixed(1));
}

function EngagementBadge({ rate }: { rate: number | null }) {
  if (rate === null) {
    return (
      <span className="text-[10px] text-muted-foreground italic">
        No data
      </span>
    );
  }
  const good = rate >= NICHE_AVG;
  return (
    <span className={cn(
      "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full",
      good
        ? "bg-emerald-500/15 text-emerald-500"
        : "bg-red-500/15 text-red-400"
    )}>
      {good
        ? <TrendingUp className="w-3 h-3" />
        : <TrendingDown className="w-3 h-3" />
      }
      {rate}%
    </span>
  );
}

function PerformanceDot({ rate }: { rate: number | null }) {
  if (rate === null)
    return <Minus className="w-3.5 h-3.5 text-muted-foreground/40" />;
  return rate >= NICHE_AVG
    ? <div className="w-2 h-2 rounded-full bg-emerald-500" title="Above avg" />
    : <div className="w-2 h-2 rounded-full bg-red-400"    title="Below avg" />;
}

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function PostsPage() {
  const [posts,       setPosts]       = useState<Post[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const navigate = useNavigate();

  // Delete modal
  const [isModalOpen,  setIsModalOpen]  = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [isDeleting,   setIsDeleting]   = useState(false);

  // Edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPost,     setEditingPost]     = useState<Post | null>(null);
  const [isUpdating,      setIsUpdating]      = useState(false);

  /* ── Fetch posts ─────────────────────────────────────────────────────────── */
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts`, {
        headers: {
          "auth-token":   localStorage.getItem("authToken") || "",
          "Content-Type": "application/json",
        },
      });
      if (response.status === 401) { localStorage.removeItem("authToken"); navigate("/login"); return; }
      if (!response.ok) throw new Error("Could not load your posts.");
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  /* ── Filtered + searched posts ───────────────────────────────────────────── */
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesFilter = activeFilter === "All" || post.postType === activeFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        post.content.toLowerCase().includes(q) ||
        post.prompt.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [posts, activeFilter, searchQuery]);

  /* ── Summary stats ───────────────────────────────────────────────────────── */
  const publishedPosts = posts.filter(p => p.linkedinPostId);
  const engagementRates = publishedPosts
    .map(calcEngagement)
    .filter((r): r is number => r !== null);
  const avgEngagement = engagementRates.length > 0
    ? (engagementRates.reduce((a, b) => a + b, 0) / engagementRates.length).toFixed(1)
    : null;

  /* ── Delete ──────────────────────────────────────────────────────────────── */
  const openDeleteModal  = (id: string) => { setPostToDelete(id); setIsModalOpen(true); };
  const closeDeleteModal = ()           => { setIsModalOpen(false); setPostToDelete(null); };

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${postToDelete}`, {
        method: "DELETE",
        headers: { "auth-token": localStorage.getItem("authToken") || "" },
      });
      if (res.ok) {
        setPosts(prev => prev.filter(p => p._id !== postToDelete));
        closeDeleteModal();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  /* ── Edit ────────────────────────────────────────────────────────────────── */
  const openEditModal = (post: Post) => { setEditingPost({ ...post }); setIsEditModalOpen(true); };

  const handleUpdatePost = async () => {
    if (!editingPost) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${editingPost._id}`, {
        method: "PUT",
        headers: {
          "auth-token":   localStorage.getItem("authToken") || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: editingPost.content, postType: editingPost.postType }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPosts(prev => prev.map(p => p._id === updated._id ? updated : p));
        setIsEditModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  /* ─── Render ─────────────────────────────────────────────────────────────── */
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-6xl mx-auto relative">

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Linkedin className="w-5 h-5 text-accent" />
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Your LinkedIn Posts</h1>
            </div>
            <p className="text-muted-foreground text-sm">Manage and track your generated content.</p>
          </div>
          <Link to="/dashboard/write">
            <Button variant="accent"><Plus className="w-4 h-4 mr-2" /> New Post</Button>
          </Link>
        </div>

        {/* ── Summary stats ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total posts",      value: posts.length },
            { label: "On LinkedIn",      value: publishedPosts.length },
            { label: "Avg engagement",   value: avgEngagement != null ? `${avgEngagement}%` : "—" },
            { label: "Niche benchmark",  value: `${NICHE_AVG}%` },
          ].map(stat => (
            <div key={stat.label} className="editorial-card py-3 px-4">
              <div className="text-xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ── Search + Filter bar ───────────────────────────────────────────── */}
        <div className="editorial-card mb-4 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={cn(
                  "text-[11px] font-semibold px-3 py-1 rounded-full transition-all",
                  activeFilter === f
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                )}
              >
                {f}
                {f !== "All" && (
                  <span className="ml-1 opacity-60">
                    ({posts.filter(p => p.postType === f).length})
                  </span>
                )}
              </button>
            ))}
            <span className="text-xs text-muted-foreground ml-auto">
              {filteredPosts.length} result{filteredPosts.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* ── Table ─────────────────────────────────────────────────────────── */}
        <div className="editorial-card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-20">
              <Loader2 className="w-10 h-10 animate-spin text-accent" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30 border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 text-[10px] uppercase font-bold text-muted-foreground w-6">
                      {/* performance dot */}
                    </th>
                    <th className="text-left py-3 px-4 text-[10px] uppercase font-bold text-muted-foreground">
                      Preview
                    </th>
                    <th className="text-left py-3 px-4 text-[10px] uppercase font-bold text-muted-foreground whitespace-nowrap">
                      Post Type
                    </th>
                    <th className="text-left py-3 px-4 text-[10px] uppercase font-bold text-muted-foreground whitespace-nowrap">
                      Engagement
                    </th>
                    <th className="text-left py-3 px-4 text-[10px] uppercase font-bold text-muted-foreground whitespace-nowrap">
                      Impressions
                    </th>
                    <th className="text-left py-3 px-4 text-[10px] uppercase font-bold text-muted-foreground">
                      Date
                    </th>
                    <th className="text-right py-3 px-4 text-[10px] uppercase font-bold text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPosts.map((post) => {
                    const engRate    = calcEngagement(post);
                    const likes      = post.engagement?.likes      ?? 0;
                    const comments   = post.engagement?.comments   ?? 0;
                    const impressions = post.engagement?.impressions ?? 0;

                    return (
                      <tr key={post._id} className="hover:bg-muted/30 transition-colors group">

                        {/* Performance dot */}
                        <td className="py-3 px-4">
                          <PerformanceDot rate={engRate} />
                        </td>

                        {/* Preview */}
                        <td className="py-3 px-4 max-w-xs">
                          <div className="flex items-start gap-2">
                            <div className="min-w-0">
                              <p className="font-medium text-sm text-foreground truncate">
                                {post.content.split("\n")[0] || post.prompt}
                              </p>
                              {post.linkedinUrl && (
                                <a
                                  href={post.linkedinUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 mt-0.5"
                                >
                                  <ExternalLink className="w-2.5 h-2.5" />
                                  View on LinkedIn
                                </a>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Post Type */}
                        <td className="py-3 px-4">
                          <span className="text-[10px] px-2 py-1 rounded-full bg-accent/10 text-accent font-bold uppercase tracking-wider whitespace-nowrap">
                            {post.postType}
                          </span>
                        </td>

                        {/* Engagement % */}
                        <td className="py-3 px-4">
                          <EngagementBadge rate={engRate} />
                          {engRate !== null && (
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              {likes}L · {comments}C
                            </div>
                          )}
                        </td>

                        {/* Impressions */}
                        <td className="py-3 px-4">
                          {post.linkedinPostId ? (
                            <span className="text-sm text-foreground font-medium">
                              {impressions > 0 ? impressions.toLocaleString() : "—"}
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground italic">
                              Not published
                            </span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="py-3 px-4 text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(post.createdAt).toLocaleDateString(undefined, {
                            month: "short", day: "numeric", year: "numeric",
                          })}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link to={`/dashboard/posts/${post._id}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost" size="icon"
                              className="h-8 w-8"
                              onClick={() => openEditModal(post)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost" size="icon"
                              className="h-8 w-8"
                              onClick={() => openDeleteModal(post._id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive/70" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredPosts.length === 0 && (
                <div className="text-center py-20 space-y-3">
                  <p className="text-muted-foreground">
                    {searchQuery || activeFilter !== "All"
                      ? "No posts match your search or filter."
                      : "No LinkedIn posts yet."}
                  </p>
                  {activeFilter !== "All" && (
                    <button
                      onClick={() => setActiveFilter("All")}
                      className="text-xs text-accent underline"
                    >
                      Clear filter
                    </button>
                  )}
                  {!searchQuery && activeFilter === "All" && (
                    <Link to="/dashboard/write">
                      <Button variant="outline" size="sm">Create your first post</Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Delete Modal ───────────────────────────────────────────────────── */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
              onClick={closeDeleteModal}
            />
            <div className="relative bg-card border border-border w-full max-w-md rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Confirm Deletion</h3>
                  <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
                </div>
                <button onClick={closeDeleteModal} className="ml-auto text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Are you sure you want to delete this post? It will be permanently removed from your library.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={closeDeleteModal} disabled={isDeleting}>
                  Cancel
                </Button>
                <Button variant="destructive" className="flex-1" onClick={handleConfirmDelete} disabled={isDeleting}>
                  {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── Edit Modal ─────────────────────────────────────────────────────── */}
        {isEditModalOpen && editingPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsEditModalOpen(false)}
            />
            <div className="relative bg-card border border-border w-full max-w-2xl rounded-xl shadow-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Edit LinkedIn Post</h3>
                <button onClick={() => setIsEditModalOpen(false)}>
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Post type selector in edit modal */}
              <div className="mb-4">
                <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">
                  Post Type
                </label>
                <div className="flex gap-2 flex-wrap">
                  {["Short", "Story", "List", "Hot Take", "Career"].map(t => (
                    <button
                      key={t}
                      onClick={() => setEditingPost({ ...editingPost, postType: t })}
                      className={cn(
                        "text-[11px] font-semibold px-3 py-1 rounded-full transition-all",
                        editingPost.postType === t
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">
                  Content
                </label>
                <textarea
                  className="w-full min-h-[280px] bg-muted/20 border border-border rounded-lg p-4 text-sm focus:ring-2 focus:ring-accent outline-none resize-none"
                  value={editingPost.content}
                  onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 mt-5">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button variant="accent" onClick={handleUpdatePost} disabled={isUpdating}>
                  {isUpdating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}