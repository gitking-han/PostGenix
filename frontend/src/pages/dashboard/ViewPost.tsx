import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  MoreVertical,
  ArrowLeft,
  Copy,
  Edit,
  Trash2,
  Calendar,
  Type,
  Check,
  Linkedin,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// Import AlertDialog components
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export default function ViewPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // Modal State
  const [isDeleting, setIsDeleting] = useState(false); // Loading state for delete button
  const [isExpanded, setIsExpanded] = useState(false);

  const CONTENT_LIMIT = 800;
  const isLongContent = post?.content?.length > CONTENT_LIMIT;
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${id}`, {
          headers: {
            "auth-token": localStorage.getItem("authToken") || "",
            "Content-Type": "application/json"
          }
        });

        if (res.status === 401) {
          localStorage.removeItem("authToken");
          navigate("/login");
          return;
        }

        if (!res.ok) throw new Error("Post not found");
        const data = await res.json();
        setPost(data);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, navigate, token]);

  const handleCopy = () => {
    if (!post) return;
    navigator.clipboard.writeText(post.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${id}`, {
        method: "DELETE",
        headers: {
          "auth-token": localStorage.getItem("authToken") || "",
          "Content-Type": "application/json"
        }
      });
      if (res.ok) {
        navigate("/dashboard/posts");
      }
    } catch (err) {
      alert("Failed to delete");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!post) return <DashboardLayout><div className="p-8">Post not found.</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate("/dashboard/posts")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCopy}>
              {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? "Copied" : "Copy Content"}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate(`/dashboard/write?id=${post._id}`)}>
                  <Edit className="w-4 h-4 mr-2 cursor-pointer" /> Edit Post
                </DropdownMenuItem>
                {/* Trigger Modal instead of immediate delete */}
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                  onSelect={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2 cursor-pointer" /> Delete Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="editorial-card p-6 min-h-[400px] border-t-4 border-t-accent bg-card relative">
              <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <Linkedin className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-bold text-sm">LinkedIn Preview</p>
                  <p className="text-xs text-muted-foreground">Generated Content</p>
                </div>
              </div>

              {/* TRUNCATED CONTENT SECTION */}
              <div className={cn(
                "relative transition-all duration-500 ease-in-out",
                !isExpanded && isLongContent ? "max-h-[500px] overflow-hidden" : "max-h-full"
              )}>
                <p className="whitespace-pre-wrap leading-relaxed text-foreground">
                  {post.content}
                </p>

                {/* Gradient Overlay for "Fade out" effect when collapsed */}
                {!isExpanded && isLongContent && (
                  <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-card via-card/80 to-transparent pointer-events-none" />
                )}
              </div>

              {/* READ MORE BUTTON */}
              {isLongContent && (
                <div className="mt-4 flex justify-center border-t border-border pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-accent hover:text-accent hover:bg-accent/10 font-bold"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? (
                      <>Show Less <ChevronUp className="ml-2 w-4 h-4" /></>
                    ) : (
                      <>Read Full Post <ChevronDown className="ml-2 w-4 h-4" /></>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            <div className="editorial-card p-6 bg-card">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground">Post Details</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-accent" />
                  <div>
                    <p className="text-xs text-muted-foreground">Created on</p>
                    <p className="text-sm font-medium">{new Date(post.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Type className="w-4 h-4 text-accent" />
                  <div>
                    <p className="text-xs text-muted-foreground">Style</p>
                    <p className="text-sm font-medium">{post.postType}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="editorial-card p-6 bg-accent/5 border-dashed border-accent/20 border">
              <h3 className="font-bold mb-2 text-sm">Original Prompt</h3>
              <p className="text-sm text-muted-foreground italic leading-relaxed">"{post.prompt}"</p>
            </div>
          </div>

        </div>

        {/* DELETE CONFIRMATION MODAL */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-full bg-destructive/10">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              </div>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your generated
                LinkedIn post and remove it from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault(); // Prevent closing until function finishes
                  handleDelete();
                }}
                className="bg-destructive hover:bg-destructive/90 text-white"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Permanently"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}