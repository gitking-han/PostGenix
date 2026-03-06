import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Eye, Edit, Trash2, Linkedin, Loader2, AlertCircle, X, AlertTriangle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // --- DELETE MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // --- EDIT MODAL STATE ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null); // Stores the full post object being edited
  const [isUpdating, setIsUpdating] = useState(false);

  const getAuthToken = () => localStorage.getItem("authToken");

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts`, {
        method: "GET",
        headers: {
          "auth-token": localStorage.getItem("authToken"),
          "Content-Type": "application/json"
        }
      });

      if (response.status === 401) {
        localStorage.removeItem("authToken");
        navigate("/login");
        return;
      }

      if (!response.ok) throw new Error("Could not load your posts.");
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // --- MODAL LOGIC ---
  const openDeleteModal = (id) => {
    setPostToDelete(id);
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsModalOpen(false);
    setPostToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);

    try {
      const token = getAuthToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${postToDelete}`, {
        method: "DELETE",
        headers: {
          "auth-token": localStorage.getItem("authToken"),
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        setPosts((prev) => prev.filter((p) => p._id !== postToDelete));
        closeDeleteModal();
      } else {
        alert("Delete failed.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditModal = (post) => {
    setEditingPost({ ...post }); // Create a copy so we don't mutate state directly
    setIsEditModalOpen(true);
  };

  const handleUpdatePost = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${editingPost._id}`, {
        method: "PUT",
        headers: {
          "auth-token": localStorage.getItem("authToken"),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content: editingPost.content,
          postType: editingPost.postType
        }),
      });

      if (response.ok) {
        const updatedData = await response.json();
        // Update local state so the UI reflects the change immediately
        setPosts((prev) => prev.map((p) => (p._id === updatedData._id ? updatedData : p)));
        setIsEditModalOpen(false);
      } else {
        alert("Failed to update post.");
      }
    } catch (err) {
      console.error("Update error:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredPosts = posts.filter((post) =>
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-6xl mx-auto relative">

        {/* HEADER & SEARCH (Same as before) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Linkedin className="w-6 h-6 text-accent" />
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Your LinkedIn Posts</h1>
            </div>
            <p className="text-muted-foreground">Manage and track your generated content.</p>
          </div>
          <Link to="/dashboard/write">
            <Button variant="accent"><Plus className="w-4 h-4 mr-2" /> New Post</Button>
          </Link>
        </div>

        <div className="editorial-card mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* TABLE Area */}
        <div className="editorial-card overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-accent" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30 border-b border-border">
                  <tr>
                    <th className="text-left py-4 px-4 text-xs uppercase font-bold text-muted-foreground">Preview</th>
                    <th className="text-left py-4 px-4 text-xs uppercase font-bold text-muted-foreground">Style</th>
                    <th className="text-left py-4 px-4 text-xs uppercase font-bold text-muted-foreground">Date</th>
                    <th className="text-right py-4 px-4 text-xs uppercase font-bold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map((post) => (
                    <tr key={post._id} className=" hover:bg-muted/40 transition-colors">
                      <td className="py-4 px-4 font-medium max-w-xs truncate">
                        {post.content.split('\n')[0] || post.prompt}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-[10px] px-2 py-1 rounded bg-accent/10 text-accent font-bold uppercase tracking-wider">
                          {post.postType}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-right flex justify-end gap-2">
                        <Link to={`/dashboard/posts/${post._id}`}>
                          <Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-foreground" onClick={() => openEditModal(post)}>
                          <Edit className="w-4 h-4 mt-1" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openDeleteModal(post._id)}>
                          <Trash2 className="w-4 h-4 text-destructive/70" />
                        </Button>
                      </td>
                    </tr>
                  ))}

                </tbody>
              </table>
              {filteredPosts.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-muted-foreground mb-4">No LinkedIn posts found matching your criteria.</p>
                  <Link to="/dashboard/write">
                    <Button variant="outline" size="sm">Create your first post</Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* --- CUSTOM DELETE MODAL --- */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
              onClick={closeDeleteModal}
            />

            {/* Modal Card */}
            <div className="relative bg-card border border-border w-full max-w-md rounded-xl shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Confirm Deletion</h3>
                    <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
                  </div>
                  <button
                    onClick={closeDeleteModal}
                    className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-sm text-muted-foreground mb-6">
                  Are you sure you want to delete this post? It will be permanently removed from your content library.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={closeDeleteModal}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={handleConfirmDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Yes, Delete"
                    )}
                  </Button>
                </div>
              </div>
            </div>

          </div>

        )}
        {/* --- CUSTOM EDIT MODAL --- */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
            <div className="relative bg-card border border-border w-full max-w-2xl rounded-xl shadow-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Edit LinkedIn Post</h3>
                <button onClick={() => setIsEditModalOpen(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Content</label>
                  <textarea
                    className="w-full min-h-[300px] bg-muted/20 border border-border rounded-lg p-4 text-sm focus:ring-2 focus:ring-accent outline-none resize-none"
                    value={editingPost?.content}
                    onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button variant="accent" onClick={handleUpdatePost} disabled={isUpdating}>
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
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

