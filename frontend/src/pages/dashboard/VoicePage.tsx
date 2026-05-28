import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Mic2, RefreshCw, Loader2, Sparkles,
  CheckCircle2, AlertCircle, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────
interface VoiceFingerprint {
  tone:          string[];
  patterns:      string[];
  strengths:     string[];
  summary:       string;
  openingStyle:  string;
  postsAnalyzed: number;
  generatedAt:   string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const API          = (path: string) => `${import.meta.env.VITE_API_URL}${path}`;
const authHeaders  = ()              => ({ "auth-token": localStorage.getItem("authToken") || "" });
const jsonHeaders  = ()              => ({ ...authHeaders(), "Content-Type": "application/json" });

function TagChip({ label, color = "accent" }: { label: string; color?: "accent" | "emerald" | "blue" | "amber" }) {
  const cls = {
    accent:  "bg-accent/15 text-accent",
    emerald: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    blue:    "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    amber:   "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  }[color];
  return (
    <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide", cls)}>
      {label}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function VoicePage() {
  const { toast } = useToast();

  const [fingerprint,  setFingerprint]  = useState<VoiceFingerprint | null>(null);
  const [fetching,     setFetching]     = useState(true);
  const [generating,   setGenerating]   = useState(false);
  const [showForm,     setShowForm]     = useState(false);
  const [sampleText,   setSampleText]   = useState("");

  // ── Fetch cached fingerprint on mount ─────────────────────────────────────
  useEffect(() => {
    const fetchFingerprint = async () => {
      try {
        const res  = await fetch(API("/api/ai/voice-fingerprint"), { headers: authHeaders() });
        const data = await res.json();
        if (res.ok && data.fingerprint) setFingerprint(data.fingerprint);
      } catch (err) {
        console.error("Failed to fetch fingerprint", err);
      } finally {
        setFetching(false);
      }
    };
    fetchFingerprint();
  }, []);

  // ── Generate / regenerate fingerprint ─────────────────────────────────────
  const handleGenerate = async () => {
    if (sampleText.trim().length < 50) {
      return toast({
        variant:     "destructive",
        title:       "Not enough content",
        description: "Paste at least a few sentences of your own writing.",
      });
    }

    setGenerating(true);
    try {
      const res  = await fetch(API("/api/ai/voice-fingerprint"), {
        method:  "POST",
        headers: jsonHeaders(),
        body:    JSON.stringify({ samples: sampleText }),
      });
      const data = await res.json();

      if (res.ok && data.fingerprint) {
        setFingerprint(data.fingerprint);
        setSampleText("");
        setShowForm(false);
        toast({
          title:       "Voice Fingerprint Updated ✓",
          description: `Analyzed ${data.fingerprint.postsAnalyzed} writing samples.`,
        });
      } else {
        toast({
          variant:     "destructive",
          title:       "Analysis failed",
          description: data.message || "Try again with more content.",
        });
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Generation failed." });
    } finally {
      setGenerating(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Mic2 className="w-5 h-5 text-accent" />
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Voice Mode</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Your unique writing fingerprint — so every post sounds like you, not AI.
            </p>
          </div>
          {fingerprint && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setShowForm(v => !v)}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Regenerate
            </Button>
          )}
        </div>

        {/* Loading state */}
        {fetching && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        )}

        {/* No fingerprint yet */}
        {!fetching && !fingerprint && !showForm && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="editorial-card text-center py-16 space-y-5"
          >
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto">
              <Mic2 className="w-8 h-8 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">No Voice Fingerprint Yet</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Paste 3–5 LinkedIn posts or any writing you've personally written.
                We'll map your tone, patterns, and style — then use them for every AI post.
              </p>
            </div>
            <Button variant="accent" onClick={() => setShowForm(true)} className="gap-2">
              <Sparkles className="w-4 h-4" />
              Generate My Voice Fingerprint
            </Button>
          </motion.div>
        )}

        {/* Sample paste form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="editorial-card mb-6 space-y-4"
            >
              <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Important:</strong> Paste content you personally wrote — not AI-generated posts.
                  The fingerprint captures your natural voice, so AI-generated samples would just re-learn PostGenix's own style.
                  Separate multiple posts with a blank line.
                </p>
              </div>

              <Textarea
                placeholder={`Paste 3–5 posts or any writing you wrote yourself...\n\nExample:\nI spent 3 years building in silence. No updates, no posts, just heads-down work. Then one day a founder reached out and said my post changed how they thought about...\n\n---\n\nThe best career advice I ever got wasn't about skills or networking...`}
                value={sampleText}
                onChange={(e) => setSampleText(e.target.value)}
                className="min-h-[220px] text-sm resize-none"
              />

              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-xs",
                  sampleText.trim().length < 50 ? "text-amber-500" : "text-emerald-500"
                )}>
                  {sampleText.trim().length < 50
                    ? `${sampleText.trim().length} / 50 chars minimum`
                    : `${sampleText.trim().length} chars — ready to analyze`
                  }
                </span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setSampleText(""); }}>
                    Cancel
                  </Button>
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={handleGenerate}
                    disabled={generating || sampleText.trim().length < 50}
                    className="gap-2"
                  >
                    {generating
                      ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing...</>
                      : <><Sparkles className="w-3.5 h-3.5" /> {fingerprint ? "Regenerate" : "Generate"} Fingerprint</>
                    }
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fingerprint display */}
        {!fetching && fingerprint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-5"
          >
            {/* Summary banner */}
            <div className="editorial-card bg-accent/5 border-accent/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                  <Mic2 className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-semibold text-foreground">Voice Fingerprint Active</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {fingerprint.summary}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {fingerprint.postsAnalyzed} samples analyzed
                    </span>
                    <span>·</span>
                    <span>
                      Last updated {new Date(fingerprint.generatedAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2-column grid */}
            <div className="grid md:grid-cols-2 gap-5">

              {/* Tone */}
              <div className="editorial-card space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Your Tone
                </h3>
                <div className="flex flex-wrap gap-2">
                  {fingerprint.tone?.map((t, i) => (
                    <TagChip key={i} label={t} color="accent" />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground border-t border-border pt-3 mt-3">
                  <strong className="text-foreground">Opening style:</strong>{" "}
                  {fingerprint.openingStyle || "Not detected"}
                </p>
              </div>

              {/* Strengths */}
              <div className="editorial-card space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Content Strengths
                </h3>
                <div className="flex flex-wrap gap-2">
                  {fingerprint.strengths?.map((s, i) => (
                    <TagChip key={i} label={s} color="emerald" />
                  ))}
                </div>
              </div>

              {/* Writing patterns */}
              <div className="editorial-card space-y-3 md:col-span-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Writing Patterns
                </h3>
                <ul className="space-y-2">
                  {fingerprint.patterns?.map((p, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                      <span className="w-5 h-5 rounded-full bg-accent/15 text-accent text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* How to use */}
            <div className="editorial-card bg-muted/30 border-dashed">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                How Voice Mode Works
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Go to <strong className="text-foreground">Write</strong> → open the sidebar →{" "}
                <strong className="text-foreground">Voice tab</strong> → toggle on{" "}
                <strong className="text-foreground">Enable Voice Mode</strong>.
                Every post you generate will be written as if you typed it yourself — same rhythm, same hooks, same style.
              </p>
            </div>

          </motion.div>
        )}

      </div>
    </DashboardLayout>
  );
}