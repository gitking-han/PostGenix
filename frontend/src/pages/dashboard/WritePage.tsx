import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Send,
  Copy,
  Loader2,
  RotateCcw,
  Sparkles,
  Bookmark,
  Type,
  Palette,
  Check,
  Zap,
  History, // Added for mobile history trigger
  X,
  Link2,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ChatSidebar } from "./ChatSidebar";
import { MessageBubble } from "./MessageBubble";

/* =======================
   CONFIG & TYPES
======================= */
const postTypes = ["Short", "Story", "List", "Hot Take", "Career"];
const tones = ["Professional", "Casual", "Authority", "Inspirational"];

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  postType?: string;
  tone?: string;
  isSaved?: boolean;
  prompt?: string;
  lastLinkedinUrl?: string;
};

export default function WritePage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [postType, setPostType] = useState("Short");
  const [tone, setTone] = useState("Professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [chats, setChats] = useState<any[]>([]); // Sidebar list
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false);
  const [isAgentActing, setIsAgentActing] = useState<string | null>(null);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);


  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/posts`;
  const API_CHAT_URL = `${import.meta.env.VITE_API_URL}/api/chats`;

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/get-user`, {
          headers: { "auth-token": localStorage.getItem("authToken") || "" }
        });
        const data = await res.json();
        if (res.ok) setIsLinkedInConnected(data.linkedin?.isConnected || false);
      } catch (err) {
        console.error("Failed to check LinkedIn status");
      }
    };
    checkConnection();
  }, []);

  const handleAutoDraft = async (messageId: string, content: string) => {
    if (!isLinkedInConnected) {
      return toast({
        title: "LinkedIn Not Connected",
        description: "Please go to Settings and connect your LinkedIn account first.",
        variant: "destructive",
      });
    }

    setIsAgentActing(messageId); // Start loading for this specific bubble

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/auto-draft`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("authToken") || ""
        },
        body: JSON.stringify({ postContent: content }),
      });

      const data = await response.json();
      console.log("DEBUG: Data received from Nova Agent:", data); // ADD THIS LINE


      if (response.ok) {
        setMessages(prev => prev.map(m =>
          m.id === messageId
            ? { ...m, lastLinkedinUrl: data.linkedinUrl }
            : m
        ));

        toast({
          title: "Nova Agent Succeeded! 🚀",
          description: "Your post has been successfully dispatched to LinkedIn.",
        });
      } else {
        throw new Error(data.message || "Agent failed to act.");
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Agent Error",
        description: err.message || "Failed to draft post.",
      });
    } finally {
      setIsAgentActing(null);
    }
  };
  const handleConnectLinkedIn = () => {
    const token = localStorage.getItem('authToken');
    // Redirect to the backend route we created earlier
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/linkedin/connect?token=${token}`;
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_CHAT_URL}/history`, {
        headers: { "auth-token": localStorage.getItem("authToken") || "" }
      });
      const data = await res.json();
      if (res.ok) setChats(data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSelectChat = async (id: string) => {
    try {
      const res = await fetch(`${API_CHAT_URL}/${id}`, {
        headers: { "auth-token": localStorage.getItem("authToken") || "" }
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentChatId(data._id);

        const mappedMessages = data.messages.map((m: any, index: number) => {
          // Find the prompt: It's either stored on the message or it's the previous user message
          const promptText = m.role === "assistant"
            ? (data.messages[index - 1]?.content || "")
            : "";

          return {
            id: m._id,
            role: m.role,
            content: m.content,
            postType: data.postType,
            tone: data.tone,
            prompt: promptText, // Ensure this is passed!
            lastLinkedinUrl: m.lastLinkedinUrl
          };
        });

        setMessages(mappedMessages);
        setPostType(data.postType);
        setTone(data.tone);
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load chat" });
    }
  };

  // 3. Auto-Save Logic (To be called inside handleSendMessage)
  const autoSaveInteraction = async (userPrompt: string, aiContent: string) => {
    try {
      const res = await fetch(`${API_CHAT_URL}/save-interaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("authToken") || ""
        },
        body: JSON.stringify({
          chatId: currentChatId, // if null, backend creates new
          userPrompt,
          aiResponse: aiContent,
          postType,
          tone
        }),
      });
      const data = await res.json();
      if (res.ok) {
        if (!currentChatId) setCurrentChatId(data._id); // Set ID if it was a new chat
        fetchHistory(); // Refresh sidebar list
      }
    } catch (err) {
      console.error("Auto-save failed", err);
    }
  };


  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setInput("");
  };



  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isGenerating]);

  const handleSendMessage = async () => {
    if (!input.trim() || isGenerating) return;

    const currentInput = input;
    const tempId = Date.now().toString();
    const userMessage: Message = { id: tempId, role: "user", content: currentInput };

    const chatHistory = messages.map(m => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content
    }));

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsGenerating(true);

    try {
      const response = await fetch(`${API_BASE_URL}/generate`, {
        method: "POST",
        headers: {
          "auth-token": localStorage.getItem("authToken") || "",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: currentInput,
          postType,
          tone,
          history: chatHistory
        }),
      });

      const data = await response.json();

      // --- NEW LOGIC START ---
      if (response.status === 403) {
        setIsLimitReached(true);
        // Remove the "optimistic" user message if it failed due to limits
        setMessages(prev => prev.filter(m => m.id !== tempId));
        setInput(currentInput); // Put the text back in the box so they don't lose it
        return;
      }
      // --- NEW LOGIC END ---

      if (response.ok) {
        setMessages((prev) => [...prev, {
          id: "ai-" + Date.now(),
          role: "assistant",
          content: data.content,
          postType: data.postType,
          tone: data.tone,
          isSaved: false,
          prompt: currentInput,
        }]);
        autoSaveInteraction(currentInput, data.content);
      } else {
        throw new Error(data.message || "Server Error");
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Generation failed."
      });
    } finally {
      setIsGenerating(false);
    }
  };
  const handleSavePost = async (msg: Message) => {
    if (msg.isSaved) return; // Prevent double saving

    if (!msg.prompt && msg.role === "assistant") {
      console.error("Missing prompt for message:", msg);
    }

    try {
      // We send the actual content because the backend doesn't have it yet
      const response = await fetch(`${API_BASE_URL}/save`, {
        method: "POST",
        headers: {
          "auth-token": localStorage.getItem("authToken"),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: msg.prompt || "LinkedIn Post", // Or track the original user prompt
          content: msg.content,
          postType: msg.postType,
          tone: msg.tone
        }),
      });

      const savedData = await response.json();

      if (response.ok) {
        setMessages((prev) =>
          prev.map(m =>
            m.id === msg.id ? { ...m, isSaved: true, id: savedData._id } : m
          )
        );

        toast({
          title: "Saved to Library",
          description: "This post is now stored in your library.",
        });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Save failed." });
    }
  };
  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Copied!", description: "Ready to paste on LinkedIn." });
  };

  const handleDeleteChat = async (id: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chats/${id}`, {
        method: "DELETE",
        headers: { "auth-token": localStorage.getItem("authToken") || "" }
      });

      if (res.ok) {
        // 1. Remove from local UI state immediately
        setChats(prev => prev.filter(c => c._id !== id));

        // 2. If we are currently viewing the deleted chat, reset the workspace
        if (currentChatId === id) {
          handleNewChat();
        }

        toast({ title: "Deleted", description: "Conversation removed." });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Could not delete chat." });
    }
  };

  const handleApplyBranding = (analysisText: string) => {
    // 1. Logic to extract Tone and Post Type from Nova's text
    // We look for matches within your existing arrays
    const matchedTone = tones.find(t =>
      analysisText.toLowerCase().includes(t.toLowerCase())
    );

    const matchedType = postTypes.find(p =>
      analysisText.toLowerCase().includes(p.toLowerCase())
    );

    // 2. Update the State
    if (matchedTone) {
      setTone(matchedTone);
    }
    if (matchedType) {
      setPostType(matchedType);
    }

    // 3. UI Feedback
    toast({
      title: "Brand Kit Synced!",
      description: `Nova adjusted your settings to ${matchedTone || tone} / ${matchedType || postType} based on your profile.`,
      variant: "default",
    });
  };


  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-64px)] lg:h-screen overflow-hidden">
        {/* ADD THIS: Sidebar Block */}
        <div className="hidden lg:block h-full border-r">
          <ChatSidebar
            chats={chats}
            onSelectChat={handleSelectChat}
            onNewChat={handleNewChat}
            onDeleteChat={handleDeleteChat}
            onApplyBranding={handleApplyBranding} // <-- ADD THIS PROP
          />
        </div>

        {/* MOBILE HISTORY DRAWER */}
        <AnimatePresence>
          {isHistoryOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsHistoryOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
              />
              {/* Sliding Drawer */}
              <motion.div
                initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 bottom-0 w-[300px] bg-background z-[101] lg:hidden border-l shadow-2xl flex flex-col"
              >

                <div className="flex-1 overflow-hidden">
                  <ChatSidebar
                    chats={chats}
                    onSelectChat={(id: string) => { handleSelectChat(id); setIsHistoryOpen(false); }}
                    onNewChat={handleNewChat}
                    onDeleteChat={handleDeleteChat}
                    onApplyBranding={handleApplyBranding}
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* WRAP YOUR EXISTING CONTENT IN THIS DIV */}
        <div className="flex-1 flex flex-col relative bg-background overflow-hidden">
          <header className="flex items-center justify-between px-6 py-4 border-b bg-background/60 backdrop-blur-xl z-20">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-400/20">
                <Zap className="w-5 h-5 text-black" />
              </div>
              <div>
                <h1 className="font-bold text-sm md:text-base tracking-tight">PostGenix Studio</h1>
                <p className="hidden xs:block text-[10px] uppercase tracking-widest text-muted-foreground font-bold">AI Ghostwriter v2.0</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* MOBILE HISTORY BUTTON (Visible only on mobile) */}
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden h-8 w-8 p-0 border-amber-200"
                onClick={() => setIsHistoryOpen(true)}
              >
                <History className="w-4 h-4 text-amber-600" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-amber-600 h-8 text-xs"
                onClick={() => setMessages([])}
              >
                <RotateCcw className="w-3.5 h-3.5 sm:mr-2" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
            </div>
          </header>

          {/* Workspace Area */}
          <main className="flex-1 relative overflow-hidden">

            {/* FIXED CENTERED EMPTY STATE */}
            {messages.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center p-6 z-0 pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-4 max-w-sm"
                >
                  <div className="inline-flex p-4 rounded-3xl bg-amber-100 dark:bg-amber-900/30 mb-2">
                    <Sparkles className="w-8 h-8 text-amber-500" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Turn ideas into gold.</h2>
                  <p className="text-muted-foreground text-sm md:text-base">
                    Paste your messy thoughts and let PostGenix handle the LinkedIn "Broetry".
                  </p>
                </motion.div>
              </div>
            )}

            {/* SCROLLABLE CONTENT */}
            <div
              ref={scrollRef}
              className="absolute inset-0 overflow-y-auto no-scrollbar px-4 md:px-6 py-8 z-10"
            >
              <div className="max-w-3xl mx-auto space-y-8 pb-32">
                <AnimatePresence mode="popLayout">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex w-full mb-4 md:mb-8",
                        msg.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div className={cn(
                        "max-w-[88%] md:max-w-[80%] rounded-2xl md:rounded-3xl p-4 md:p-7 shadow-sm transition-all relative group",
                        msg.role === "user"
                          ? "bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-tr-none"
                          : "bg-white dark:bg-slate-950 border border-amber-100 dark:border-amber-900/30 shadow-xl shadow-amber-900/5 rounded-tl-none"
                      )}>
                        {/* Post Tags (AI Only) */}
                        {(msg.role === "assistant") && (
                          <div className="flex flex-wrap items-center gap-1.5 mb-3">
                            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-black">
                              {msg.postType}
                            </span>
                            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-muted-foreground">
                              {msg.tone}
                            </span>
                          </div>
                        )}

                        {/* Content Text */}
                        <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">
                          {msg.content}
                        </p>

                        {/* Action Buttons (AI Only) */}
                        {msg.role === "assistant" && (
                          <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-amber-50 dark:border-amber-900/20">

                            {/* SUCCESS BADGE: Show this if it was already posted at least once */}
                            {msg.lastLinkedinUrl && (
                              <motion.a
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                href={msg.lastLinkedinUrl}
                                target="_blank"
                                className="flex items-center gap-2 text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-900/10 w-fit px-2 py-1 rounded-md border border-green-200"
                              >
                                <ExternalLink className="w-3 h-3" />
                                VIEW POST ON LINKEDIN
                              </motion.a>
                            )}

                            <div className="flex items-center gap-1 md:gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 md:h-8 rounded-lg text-[10px] md:text-xs px-2 md:px-3"
                                onClick={() => handleCopy(msg.id, msg.content)}
                              >
                                <Copy className="w-3 h-3 md:mr-2" />
                                <span className="hidden xs:inline">Copy</span>
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSavePost(msg)}
                                className="h-7 md:h-8 rounded-lg text-[10px] md:text-xs px-2 md:px-3"
                              >
                                <Bookmark className="w-3 h-3 md:mr-2" />
                                <span>Save</span>
                              </Button>

                              {/* AGENT BUTTON: Always stays active so user can post again */}
                              <Button
                                variant="ghost"
                                size="sm"
                                // Button is only disabled if the agent is already busy acting
                                disabled={isAgentActing !== null}
                                className={cn(
                                  "h-7 md:h-8 rounded-lg text-[10px] md:text-xs px-2 md:px-3 transition-all",
                                  isLinkedInConnected
                                    ? "text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                    : "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-dashed border-amber-200"
                                  // Changed color to Amber if disconnected to catch their eye
                                )}
                                onClick={() => {
                                  if (isLinkedInConnected) {
                                    handleAutoDraft(msg.id, msg.content);
                                  } else {
                                    handleConnectLinkedIn();
                                  }
                                }}
                              >
                                {isAgentActing === msg.id ? (
                                  <Loader2 className="w-3 h-3 md:mr-2 animate-spin" />
                                ) : isLinkedInConnected ? (
                                  <Zap className="w-3 h-3 md:mr-2 fill-current" />
                                ) : (
                                  <Link2 className="w-3 h-3 md:mr-2" /> // Show a Link icon if not connected
                                )}

                                <span>
                                  {isAgentActing === msg.id
                                    ? "Agent Acting..."
                                    : isLinkedInConnected
                                      ? (msg.lastLinkedinUrl ? "Post Again" : "Post to LinkedIn")
                                      : "Connect LinkedIn" // Clear Call to Action
                                  }
                                </span>
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isGenerating && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-slate-950 border border-amber-100 rounded-2xl p-5 flex items-center gap-3 shadow-lg">
                      <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                      <span className="text-sm font-bold text-amber-600">PostGenix is crafting...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>

          {/* Input Console - Barely touching the bottom */}
          <footer className="border-amber-100 dark:border-amber-900/20 pt-4 pb-2 px-4 z-20">
            <div className="max-w-3xl mx-auto space-y-3">

              {/* Control Panel */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto">
                  <Type className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-amber-100/50">
                    {postTypes.map((t) => (
                      <button key={t} onClick={() => setPostType(t)} className={cn("px-3 py-1.5 rounded-lg text-[10px] md:text-[11px] font-bold transition-all whitespace-nowrap", postType === t ? "bg-white dark:bg-amber-500 shadow-sm text-amber-600 dark:text-black" : "text-muted-foreground hover:text-foreground")}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto">
                  <Palette className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-amber-100/50">
                    {tones.map((t) => (
                      <button key={t} onClick={() => setTone(t)} className={cn("px-3 py-1.5 rounded-lg text-[10px] md:text-[11px] font-bold transition-all whitespace-nowrap", tone === t ? "bg-white dark:bg-amber-500 shadow-sm text-amber-600 dark:text-black" : "text-muted-foreground hover:text-foreground")}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Input Box */}
              <div className="relative group shadow-2xl rounded-2xl md:rounded-3xl overflow-hidden border border-amber-200 dark:border-amber-900/50 transition-all focus-within:ring-4 focus-within:ring-amber-500/10">
                <Textarea
                  placeholder="Describe your story or insight..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="min-h-[80px] md:min-h-[120px] w-full resize-none border-none focus-visible:ring-0 bg-white dark:bg-slate-950 p-4 md:p-6 text-sm md:text-base pr-14 md:pr-20"
                />

                <div className="absolute right-3 bottom-3 md:right-4 md:bottom-4">
                  <Button
                    size="icon"
                    disabled={!input.trim() || isGenerating}
                    onClick={handleSendMessage}
                    className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-amber-400 hover:bg-amber-500 text-black transition-all active:scale-90"
                  >
                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </Button>
                </div>
              </div>

              <div className="text-[9px] text-center text-muted-foreground font-bold uppercase tracking-widest pb-1">
                Powered by PostGenix Intelligence
              </div>
            </div>
          </footer>
        </div>
        {/* PREMIUM LIMIT MODAL */}
        <AnimatePresence>
          {isLimitReached && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsLimitReached(false)}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
              />

              {/* Modal Content */}
              <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                className="relative max-w-sm w-full bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900 shadow-2xl rounded-[2.5rem] p-8 text-center"
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-amber-400 rounded-3xl rotate-12 flex items-center justify-center shadow-xl shadow-amber-500/40">
                  <Zap className="w-10 h-10 text-black -rotate-12" />
                </div>

                <div className="mt-8 space-y-4">
                  <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Daily Limit Reached
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    Your 10 free daily credits are exhausted. Credits reset every <span className="font-bold text-amber-600">12 hours</span>.
                  </p>

                  <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/50">
                    <p className="text-xs font-bold text-amber-700 dark:text-amber-500 uppercase tracking-widest">
                      Pro Tip
                    </p>
                    <p className="text-[13px] text-amber-900 dark:text-amber-200 mt-1">
                      Pro users get unlimited high-reasoning posts and priority AI access.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3">
                  <Button
                    className="w-full bg-amber-400 hover:bg-amber-500 text-black font-bold h-14 rounded-2xl text-base shadow-lg shadow-amber-500/20 active:scale-95 transition-transform"
                    onClick={() => window.location.href = '/dashboard/billing'}
                  >
                    Upgrade to Pro
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full text-muted-foreground hover:text-foreground h-12"
                    onClick={() => setIsLimitReached(false)}
                  >
                    Maybe later
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}




