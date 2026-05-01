import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Send, Copy, Loader2, RotateCcw, Sparkles,
  Bookmark, Type, Palette, Zap, History,
  Link2, ExternalLink, Mic2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ChatSidebar } from "./ChatSidebar";

/* ─── Config & Types ─────────────────────────────────────────────────────── */
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
  voiceModeUsed?: boolean;
  postId?: string; 

};

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const authHeaders = () => ({
  "auth-token": localStorage.getItem("authToken") || "",
});
const jsonHeaders = () => ({
  ...authHeaders(),
  "Content-Type": "application/json",
});

export default function WritePage() {
  /* ── Core state ──────────────────────────────────────────────────────────── */
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [postType, setPostType] = useState("Short");
  const [tone, setTone] = useState("Professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [chats, setChats] = useState<any[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false);
  const [isAgentActing, setIsAgentActing] = useState<string | null>(null);

  /* ── Voice Mode state ────────────────────────────────────────────────────── */
  const [voiceModeEnabled, setVoiceModeEnabled] = useState(false);
  const [voiceFingerprint, setVoiceFingerprint] = useState<any>(null);
  const [fingerprintLoading, setFingerprintLoading] = useState(false);
  const [fingerprintFetching, setFingerprintFetching] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const API_BASE = `${import.meta.env.VITE_API_URL}/api/posts`;
  const API_CHAT = `${import.meta.env.VITE_API_URL}/api/chats`;
  const API_AI = `${import.meta.env.VITE_API_URL}/api/ai`;

  /* ── Mobile detection ────────────────────────────────────────────────────── */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ── On mount: fetch LinkedIn status + voice fingerprint in parallel ─────── */
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [userRes, fingerprintRes] = await Promise.allSettled([
          fetch(`${import.meta.env.VITE_API_URL}/api/auth/get-user`, { headers: authHeaders() }),
          fetch(`${API_AI}/voice-fingerprint`, { headers: authHeaders() }),
        ]);

        if (userRes.status === "fulfilled" && userRes.value.ok) {
          const data = await userRes.value.json();
          setIsLinkedInConnected(data.linkedin?.isConnected || false);
        }

        if (fingerprintRes.status === "fulfilled" && fingerprintRes.value.ok) {
          const data = await fingerprintRes.value.json();
          if (data.fingerprint) {
            setVoiceFingerprint(data.fingerprint);
          }
        }
      } catch (err) {
        console.error("Failed to fetch initial data", err);
      } finally {
        setFingerprintFetching(false);
      }
    };
    fetchInitialData();
  }, []);

  /* ── Fetch chat history ──────────────────────────────────────────────────── */
  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_CHAT}/history`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) setChats(data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  /* ── Auto-scroll ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isGenerating]);

  /* ─── BUG 2 FIXED ───────────────────────────────────────────────────────────
     Previously the mobile sidebar used `onVoiceModeToggle={setVoiceModeEnabled}`
     — the raw setter with NO fingerprint guard. A mobile user with no fingerprint
     could silently enable Voice Mode, the backend would log "no fingerprint —
     falling back" and the UI would show a broken "Writing in your voice" state.

     Fix: extract ONE guarded handler and share it between both sidebar instances.
     The desktop sidebar was calling this inline; now both call the same function.
  ──────────────────────────────────────────────────────────────────────────── */
  const handleVoiceModeToggle = (val: boolean) => {
    if (val && !voiceFingerprint) {
      toast({
        title: "No Voice Fingerprint Yet",
        description: "Generate your fingerprint first in the Voice tab.",
      });
      return;
    }
    setVoiceModeEnabled(val);
  };

  /* ── Generate Voice Fingerprint (POST) ──────────────────────────────────── */
  const handleGenerateFingerprint = async (samples: string) => {
    setFingerprintLoading(true);
    try {
      const res = await fetch(`${API_AI}/voice-fingerprint`, {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({ samples }), // user's own writing — not AI-generated posts
      });
      const data = await res.json();

      if (res.ok && data.fingerprint) {
        setVoiceFingerprint(data.fingerprint);
        toast({
          title: "Voice Fingerprint Ready ✓",
          description: `Analyzed ${data.fingerprint.postsAnalyzed} samples. Your voice is now mapped.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Not enough content",
          description: data.message || "Paste more of your own writing and try again.",
        });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Fingerprint generation failed." });
    } finally {
      setFingerprintLoading(false);
    }
  };

  /* ── Send Message ────────────────────────────────────────────────────────── */
  const handleSendMessage = async () => {
    if (!input.trim() || isGenerating) return;

    const currentInput = input;
    const tempId = Date.now().toString();
    const userMessage: Message = { id: tempId, role: "user", content: currentInput };

    const chatHistory = messages.map(m => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsGenerating(true);

    try {
      const response = await fetch(`${API_BASE}/generate`, {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({
          prompt: currentInput,
          postType,
          tone,
          history: chatHistory,
          voiceMode: voiceModeEnabled,
        }),
      });

      const data = await response.json();

      if (response.status === 403) {
        setIsLimitReached(true);
        setMessages(prev => prev.filter(m => m.id !== tempId));
        setInput(currentInput);
        return;
      }

      if (response.ok) {
        setMessages(prev => [...prev, {
          id: "ai-" + Date.now(),
          role: "assistant",
          content: data.content,
          postType: data.postType,
          tone: data.tone,
          isSaved: false,
          prompt: currentInput,
          voiceModeUsed: data.voiceModeUsed || false,
        }]);
        autoSaveInteraction(currentInput, data.content);
      } else {
        throw new Error(data.message || "Server Error");
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message || "Generation failed." });
    } finally {
      setIsGenerating(false);
    }
  };

  /* ── Auto-save interaction to chat history ───────────────────────────────── */
  const autoSaveInteraction = async (userPrompt: string, aiContent: string) => {
    try {
      const res = await fetch(`${API_CHAT}/save-interaction`, {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({ chatId: currentChatId, userPrompt, aiResponse: aiContent, postType, tone }),
      });
      const data = await res.json();
      if (res.ok) {
        if (!currentChatId) setCurrentChatId(data._id);
        fetchHistory();
      }
    } catch (err) {
      console.error("Auto-save failed", err);
    }
  };

  /* ── Save post to library ────────────────────────────────────────────────── */
  const handleSavePost = async (msg: Message) => {
    if (msg.isSaved) return;
    try {
      const response = await fetch(`${API_BASE}/save`, {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({
          prompt: msg.prompt || "LinkedIn Post",
          content: msg.content,
          postType: msg.postType,
          tone: msg.tone,
          messageId: msg.id,
        }),
      });
      const savedData = await response.json();
      if (response.ok) {
        setMessages(prev =>
          prev.map(m => m.id === msg.id
            ? { ...m, isSaved: true, postId: savedData._id }
            : m
          )
        );
        toast({ title: "Saved to Library", description: "This post is now stored in your library." });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Save failed." });
    }
  };

  /* ── Post to LinkedIn ────────────────────────────────────────────────────── */
  const handleAutoDraft = async (
  messageId: string,
  postId: string,
  content: string
) => {
  if (!isLinkedInConnected) {
    return toast({
      title: "LinkedIn Not Connected",
      description: "Please connect LinkedIn first.",
      variant: "destructive",
    });
  }

  setIsAgentActing(messageId);

  try {
    const response = await fetch(`${API_AI}/auto-draft`, {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify({
        postContent: content,
        postId: postId,        // ✅ correct
        messageId: messageId,  // ✅ correct
      }),
    });

    const data = await response.json();

    if (response.ok) {
      setMessages(prev =>
        prev.map(m =>
          m.id === messageId
            ? { ...m, lastLinkedinUrl: data.linkedinUrl }
            : m
        )
      );

      toast({
        title: "Posted to LinkedIn 🚀",
        description: "Your post is live.",
      });
    } else {
      throw new Error(data.message || "Agent failed.");
    }
  } catch (err: any) {
    toast({
      variant: "destructive",
      title: "Agent Error",
      description: err.message || "Failed to post.",
    });
  } finally {
    setIsAgentActing(null);
  }
};
  /* ── Copy ────────────────────────────────────────────────────────────────── */
  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Copied!", description: "Ready to paste on LinkedIn." });
  };

  /* ── Chat management ─────────────────────────────────────────────────────── */
  const handleNewChat = () => { setMessages([]); setCurrentChatId(null); setInput(""); };

  const handleSelectChat = async (id: string) => {
    try {
      const res = await fetch(`${API_CHAT}/${id}`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) {
        setCurrentChatId(data._id);
        const mapped = data.messages.map((m: any, index: number) => ({
          id: m._id,
          role: m.role,
          content: m.content,
          postType: data.postType,
          tone: data.tone,
          prompt: m.role === "assistant" ? (data.messages[index - 1]?.content || "") : "",
          lastLinkedinUrl: m.lastLinkedinUrl,
          isSaved: !!m.postId

        }));
        setMessages(mapped);
        setPostType(data.postType);
        setTone(data.tone);
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to load chat" });
    }
  };

  const handleDeleteChat = async (id: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chats/${id}`, {
        method: "DELETE", headers: authHeaders(),
      });
      if (res.ok) {
        setChats(prev => prev.filter(c => c._id !== id));
        if (currentChatId === id) handleNewChat();
        toast({ title: "Deleted", description: "Conversation removed." });
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Could not delete chat." });
    }
  };

  const handleApplyBranding = (analysisText: string) => {
    const matchedTone = tones.find(t => analysisText.toLowerCase().includes(t.toLowerCase()));
    const matchedType = postTypes.find(p => analysisText.toLowerCase().includes(p.toLowerCase()));
    if (matchedTone) setTone(matchedTone);
    if (matchedType) setPostType(matchedType);
    toast({
      title: "Brand Kit Synced!",
      description: `Adjusted to ${matchedTone || tone} / ${matchedType || postType} based on your profile.`,
    });
  };

  const handleConnectLinkedIn = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/linkedin/connect?token=${localStorage.getItem("authToken")}`;
  };

  /* ─── Render ─────────────────────────────────────────────────────────────── */
  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-64px)] lg:h-screen overflow-hidden">

        {/* ── Desktop Sidebar ────────────────────────────────────────────────── */}
        <div className="hidden lg:block h-full border-r">
          <ChatSidebar
            chats={chats}
            onSelectChat={handleSelectChat}
            onNewChat={handleNewChat}
            onDeleteChat={handleDeleteChat}
            onApplyBranding={handleApplyBranding}
            voiceModeEnabled={voiceModeEnabled}
            onVoiceModeToggle={handleVoiceModeToggle}
            voiceFingerprint={voiceFingerprint}
            fingerprintLoading={fingerprintLoading}
            fingerprintFetching={fingerprintFetching}
            onGenerateFingerprint={handleGenerateFingerprint}
          />
        </div>

        {/* ── Mobile History Drawer ─────────────────────────────────────────── */}
        <AnimatePresence>
          {isHistoryOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsHistoryOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
              />
              <motion.div
                initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 bottom-0 w-[300px] bg-background z-[101] lg:hidden border-l shadow-2xl flex flex-col"
              >
                <div className="flex-1 overflow-hidden">
                  {/* ─── BUG 2 FIXED ────────────────────────────────────────────
                      Was: onVoiceModeToggle={setVoiceModeEnabled}  ← raw setter,
                           bypassed the fingerprint guard entirely on mobile.
                      Now: onVoiceModeToggle={handleVoiceModeToggle} ← same guarded
                           handler used by the desktop sidebar. Both platforms now
                           show a toast and block the toggle when no fingerprint
                           exists, instead of silently enabling broken Voice Mode.
                  ──────────────────────────────────────────────────────────── */}
                  <ChatSidebar
                    chats={chats}
                    onSelectChat={(id) => { handleSelectChat(id); setIsHistoryOpen(false); }}
                    onNewChat={handleNewChat}
                    onDeleteChat={handleDeleteChat}
                    onApplyBranding={handleApplyBranding}
                    voiceModeEnabled={voiceModeEnabled}
                    onVoiceModeToggle={handleVoiceModeToggle}
                    voiceFingerprint={voiceFingerprint}
                    fingerprintLoading={fingerprintLoading}
                    fingerprintFetching={fingerprintFetching}
                    onGenerateFingerprint={handleGenerateFingerprint}
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Main Workspace ────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col relative bg-background overflow-hidden">

          {/* Header */}
          <header className="flex items-center justify-between px-6 py-4 border-b bg-background/60 backdrop-blur-xl z-20">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-400/20">
                <Zap className="w-5 h-5 text-black" />
              </div>
              <div>
                <h1 className="font-bold text-sm md:text-base tracking-tight">PostGenix Studio</h1>
                <p className="hidden xs:block text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                  AI Ghostwriter v2.0
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {voiceModeEnabled && voiceFingerprint && (
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20">
                  <Mic2 className="w-3 h-3 text-accent" />
                  <span className="text-[10px] font-bold text-accent uppercase tracking-wide">
                    Voice On · {voiceFingerprint.tone?.[0] || "Custom"}
                  </span>
                </div>
              )}
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

          {/* Workspace */}
          <main className="flex-1 relative overflow-hidden">

            {/* Empty state */}
            {messages.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center p-6 z-0 pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-4 max-w-sm"
                >
                  <div className="inline-flex p-4 rounded-3xl bg-amber-100 dark:bg-amber-900/30 mb-2">
                    {voiceModeEnabled && voiceFingerprint
                      ? <Mic2 className="w-8 h-8 text-accent" />
                      : <Sparkles className="w-8 h-8 text-amber-500" />
                    }
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                    {voiceModeEnabled && voiceFingerprint
                      ? "Writing in your voice."
                      : "Turn ideas into gold."
                    }
                  </h2>
                  <p className="text-muted-foreground text-sm md:text-base">
                    {voiceModeEnabled && voiceFingerprint
                      ? `Tone: ${voiceFingerprint.tone?.join(", ")}. Posts will sound like you wrote them.`
                      : `Paste your messy thoughts and let PostGenix handle the LinkedIn "Broetry".`
                    }
                  </p>
                </motion.div>
              </div>
            )}

            {/* Scrollable messages */}
            <div ref={scrollRef} className="absolute inset-0 overflow-y-auto no-scrollbar px-4 md:px-6 py-8 z-10">
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

                        {/* AI post tags */}
                        {msg.role === "assistant" && (
                          <div className="flex flex-wrap items-center gap-1.5 mb-3">
                            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-black">
                              {msg.postType}
                            </span>
                            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-muted-foreground">
                              {msg.tone}
                            </span>
                            {msg.voiceModeUsed && (
                              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/15 text-accent flex items-center gap-1">
                                <Mic2 className="w-2.5 h-2.5" /> Your Voice
                              </span>
                            )}
                          </div>
                        )}

                        {/* Content */}
                        <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">
                          {msg.content}
                        </p>

                        {/* Action buttons (AI only) */}
                        {msg.role === "assistant" && (
                          <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-amber-50 dark:border-amber-900/20">
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
                                variant="ghost" size="sm"
                                className="h-7 md:h-8 rounded-lg text-[10px] md:text-xs px-2 md:px-3"
                                onClick={() => handleCopy(msg.id, msg.content)}
                              >
                                <Copy className="w-3 h-3 md:mr-2" />
                                <span className="hidden xs:inline">
                                  {copiedId === msg.id ? "Copied!" : "Copy"}
                                </span>
                              </Button>

                              <Button
                                variant="ghost" size="sm"
                                onClick={() => handleSavePost(msg)}
                                disabled={msg.isSaved}
                                className={cn(
                                  "h-7 md:h-8 rounded-lg text-[10px] md:text-xs px-2 md:px-3",
                                  msg.isSaved && "opacity-50"
                                )}
                              >
                                <Bookmark className={cn("w-3 h-3 md:mr-2", msg.isSaved && "fill-current")} />
                                <span>{msg.isSaved ? "Saved" : "Save"}</span>
                              </Button>

                              <Button
                                variant="ghost" size="sm"
                                disabled={isAgentActing !== null}
                                className={cn(
                                  "h-7 md:h-8 rounded-lg text-[10px] md:text-xs px-2 md:px-3 transition-all",
                                  !msg.isSaved && "opacity-50 cursor-not-allowed",
                                  isLinkedInConnected
                                    ? "text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                    : "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-dashed border-amber-200"
                                )}
                                onClick={() => {
                                  if (!msg.postId) {
                                    return toast({
                                      title: "Save Required",
                                      description: "Please save this post before posting to LinkedIn.",
                                    });
                                  }
                                  if (isLinkedInConnected) {
                                    handleAutoDraft(msg.id, msg.postId!, msg.content);
                                  } else {
                                    handleConnectLinkedIn();
                                  }
                                }}
                              >
                                {isAgentActing === msg.id
                                  ? <Loader2 className="w-3 h-3 md:mr-2 animate-spin" />
                                  : isLinkedInConnected
                                    ? <Zap className={cn("w-3 h-3 md:mr-2", msg.isSaved ? "fill-current" : "")} />
                                    : <Link2 className="w-3 h-3 md:mr-2" />
                                }
                                <span>
                                  {isAgentActing === msg.id
                                    ? "Agent Acting..."
                                    : isLinkedInConnected
                                      ? (msg.lastLinkedinUrl ? "Post Again" : "Post to LinkedIn")
                                      : "Connect LinkedIn"
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
                      <span className="text-sm font-bold text-amber-600">
                        {voiceModeEnabled && voiceFingerprint
                          ? "Crafting in your voice..."
                          : "PostGenix is crafting..."
                        }
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>

          {/* Footer / Input console */}
          <footer className="border-amber-100 dark:border-amber-900/20 pt-4 pb-2 px-4 z-20">
            <div className="max-w-3xl mx-auto space-y-3">

              {/* Voice mode active bar above input */}
              <AnimatePresence>
                {voiceModeEnabled && voiceFingerprint && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/8 border border-accent/20"
                  >
                    <Mic2 className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span className="text-[11px] text-accent font-medium">
                      Writing as: {voiceFingerprint.tone?.slice(0, 2).join(", ")} ·{" "}
                      <span className="opacity-70">{voiceFingerprint.openingStyle || "Your style"}</span>
                    </span>
                    <button
                      onClick={() => setVoiceModeEnabled(false)}
                      className="ml-auto text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Turn off
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Post type + tone pills */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto">
                  <Type className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-amber-100/50">
                    {postTypes.map((t) => (
                      <button
                        key={t}
                        onClick={() => setPostType(t)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[10px] md:text-[11px] font-bold transition-all whitespace-nowrap",
                          postType === t
                            ? "bg-white dark:bg-amber-500 shadow-sm text-amber-600 dark:text-black"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto">
                  <Palette className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-amber-100/50">
                    {tones.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTone(t)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[10px] md:text-[11px] font-bold transition-all whitespace-nowrap",
                          tone === t
                            ? "bg-white dark:bg-amber-500 shadow-sm text-amber-600 dark:text-black"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Input box */}
              <div className="relative group shadow-2xl rounded-2xl md:rounded-3xl overflow-hidden border border-amber-200 dark:border-amber-900/50 transition-all focus-within:ring-4 focus-within:ring-amber-500/10">
                <Textarea
                  placeholder={
                    voiceModeEnabled && voiceFingerprint
                      ? "Describe your idea — it'll come out in your voice..."
                      : "Describe your story or insight..."
                  }
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

        {/* ── Premium limit modal ───────────────────────────────────────────── */}
        <AnimatePresence>
          {isLimitReached && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsLimitReached(false)}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
              />
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
                  <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Daily Limit Reached</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    Your 10 free daily credits are exhausted. Credits reset every <span className="font-bold text-amber-600">12 hours</span>.
                  </p>
                  <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/50">
                    <p className="text-xs font-bold text-amber-700 dark:text-amber-500 uppercase tracking-widest">Pro Tip</p>
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