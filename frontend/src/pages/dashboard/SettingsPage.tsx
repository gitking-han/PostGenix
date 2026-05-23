"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  ShieldCheck, Share2, Sparkles, Cpu, ShieldAlert, Zap,
  Link2, Database, Loader2, CheckCircle2,
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// ─── Helpers ──────────────────────────────────────────────────────────────────
// FIX 1: All API calls now use VITE_API_URL so they work in production.
const API = (path: string) => `${import.meta.env.VITE_API_URL}${path}`;
const authHeaders = () => ({ "auth-token": localStorage.getItem("authToken") || "" });
const jsonHeaders = () => ({ ...authHeaders(), "Content-Type": "application/json" });

// ─── Industry options ──────────────────────────────────────────────────────────
const INDUSTRIES = [
  { value: "saas",       label: "B2B SaaS" },
  { value: "fintech",    label: "Fintech" },
  { value: "ecommerce",  label: "E-Commerce" },
  { value: "marketing",  label: "Marketing & Agencies" },
  { value: "consulting", label: "Consulting" },
  { value: "healthcare", label: "Healthcare" },
  { value: "edtech",     label: "EdTech" },
  { value: "ai",         label: "AI & ML" },
  { value: "web3",       label: "Web3 & Crypto" },
  { value: "creator",    label: "Creator Economy" },
  { value: "hr",         label: "HR & Recruiting" },
  { value: "other",      label: "Other" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { toast } = useToast();
  const [loading,               setLoading]               = useState(true);
  const [saving,                setSaving]                = useState(false);
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);

  const [settings, setSettings] = useState({
    brandKit: {
      mission:        "",
      targetAudience: "",
      industry:       "saas",
      // FIX 4: terminology is now shown in the UI so users can actually set it
      terminology:    "",
    },
    modelConfig: {
      highReasoning: true,
      temperature:   0.7,
      maxTokens:     "medium",
      negativePrompt: "",
    },
    linkedin: {
      isConnected:  false,
      profileName:  "",
    },
  });

  // FIX 2: password handler is a plain click handler — no FormEvent needed
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword:     "",
    confirmPassword: "",
  });

  // ── Fetch settings + LinkedIn status on mount ────────────────────────────────
  useEffect(() => {
    // Show toast if redirected back after LinkedIn OAuth
    const params = new URLSearchParams(window.location.search);
    if (params.get("linkedin") === "connected") {
      toast({ title: "LinkedIn Connected!", description: "PostGenix can now draft posts for you." });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [settingsRes, userRes] = await Promise.all([
          fetch(API("/api/settings/fetch"), { headers: authHeaders() }),
          fetch(API("/api/auth/get-user"),  { headers: authHeaders() }),
        ]);

        const settingsData = await settingsRes.json();
        const userData     = await userRes.json();

        if (settingsRes.ok && userRes.ok) {
          setSettings({
            brandKit: {
              mission:        settingsData.brandKit?.mission        || "",
              targetAudience: settingsData.brandKit?.targetAudience || "",
              industry:       settingsData.brandKit?.industry       || "saas",
              terminology:    settingsData.brandKit?.terminology    || "",
            },
            modelConfig: {
              highReasoning:  settingsData.modelConfig?.highReasoning  ?? true,
              temperature:    settingsData.modelConfig?.temperature     ?? 0.7,
              maxTokens:      settingsData.modelConfig?.maxTokens       || "medium",
              negativePrompt: settingsData.modelConfig?.negativePrompt  || "",
            },
            linkedin: {
              isConnected: userData.linkedin?.isConnected  || false,
              profileName: userData.linkedin?.profileName  || "",
            },
          });
        }
      } catch (error) {
        console.error("Failed to load settings or user data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // ── Save brandKit or modelConfig ─────────────────────────────────────────────
  const handleSave = async (section: "brandKit" | "modelConfig") => {
    setSaving(true);
    try {
      const response = await fetch(API("/api/settings/update"), {
        method:  "PUT",
        headers: jsonHeaders(),
        body:    JSON.stringify({ type: section, data: settings[section] }),
      });

      if (response.ok) {
        toast({ title: "Settings Updated", description: "Changes saved to your profile." });
      } else {
        throw new Error("Save failed");
      }
    } catch {
      toast({ title: "Error", description: "Failed to save.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // ── LinkedIn connect / disconnect ────────────────────────────────────────────
  const handleConnectLinkedIn = () => {
    const token = localStorage.getItem("authToken");
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/linkedin/connect?token=${token}`;
  };

  const handleDisconnectLinkedIn = async () => {
    setSaving(true);
    try {
      const res = await fetch(API("/api/auth/linkedin/disconnect"), {
        method:  "PUT",
        headers: authHeaders(),
      });
      if (res.ok) {
        setSettings(prev => ({ ...prev, linkedin: { isConnected: false, profileName: "" } }));
        toast({ title: "LinkedIn Disconnected", description: "Nova's agentic access has been revoked." });
      }
    } catch {
      toast({ title: "Error", description: "Failed to disconnect.", variant: "destructive" });
    } finally {
      setSaving(false);
      setIsDisconnectModalOpen(false);
    }
  };

  // ── Password update ──────────────────────────────────────────────────────────
  // FIX 2: plain function, no FormEvent — button uses onClick not form submit
  const handlePasswordUpdate = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast({ title: "Error", description: "New passwords do not match.", variant: "destructive" });
    }
    if (passwords.newPassword.length < 5) {
      return toast({ title: "Error", description: "Password must be at least 5 characters.", variant: "destructive" });
    }

    setSaving(true);
    try {
      const res = await fetch(API("/api/auth/update-password"), {
        method:  "PUT",
        headers: jsonHeaders(),
        body:    JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword:     passwords.newPassword,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        toast({ title: "Success", description: "Password updated successfully." });
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast({ title: "Update Failed", description: data.message || "Could not update password.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Server error. Please try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // ── Purge account ────────────────────────────────────────────────────────────
  const handlePurgeAccount = async () => {
    setSaving(true);
    try {
      const res = await fetch(API("/api/auth/delete-account"), {
        method:  "DELETE",
        headers: authHeaders(),
      });
      if (res.ok) {
        toast({ title: "Account Purged", description: "Your data has been removed." });
        localStorage.removeItem("authToken");
        window.location.href = "/signup";
      } else {
        toast({ title: "Error", description: "Could not delete account.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Server error.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // ── Loading state ────────────────────────────────────────────────────────────
  if (loading) return (
    <DashboardLayout>
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-accent" />
      </div>
    </DashboardLayout>
  );

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-10 max-w-4xl mx-auto">

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">Configure your AI workspace parameters.</p>
        </header>

        <Tabs defaultValue="brand-kit" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 border overflow-x-auto justify-start h-auto flex-wrap">
            <TabsTrigger value="brand-kit"    className="gap-2 py-2"><Sparkles className="w-4 h-4" /> AI Brand Kit</TabsTrigger>
            <TabsTrigger value="model-config" className="gap-2 py-2"><Cpu     className="w-4 h-4" /> Model Config</TabsTrigger>
            <TabsTrigger value="integrations" className="gap-2 py-2 text-xs font-bold uppercase tracking-wider"><Link2 className="w-4 h-4" /> Agentic Tools</TabsTrigger>
            <TabsTrigger value="security"     className="gap-2 py-2"><ShieldCheck className="w-4 h-4" /> Security</TabsTrigger>
          </TabsList>

          {/* ── Brand Kit ───────────────────────────────────────────────────── */}
          <TabsContent value="brand-kit" className="space-y-6">
            <div className="editorial-card space-y-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Database className="w-5 h-5" /> Knowledge Base
              </h2>

              {/* Core Mission */}
              <div className="space-y-2">
                <Label>Core Mission</Label>
                <Textarea
                  rows={3}
                  placeholder="e.g. Help B2B SaaS founders grow their LinkedIn presence through authentic storytelling..."
                  value={settings.brandKit.mission}
                  onChange={(e) => setSettings(prev => ({ ...prev, brandKit: { ...prev.brandKit, mission: e.target.value } }))}
                />
                <p className="text-xs text-muted-foreground">
                  This tells the AI what you're trying to achieve. The more specific, the better the posts.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Target Audience */}
                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <Input
                    placeholder="e.g. B2B founders, SaaS marketers..."
                    value={settings.brandKit.targetAudience}
                    onChange={(e) => setSettings(prev => ({ ...prev, brandKit: { ...prev.brandKit, targetAudience: e.target.value } }))}
                  />
                </div>

                {/* Industry */}
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Select
                    value={settings.brandKit.industry}
                    onValueChange={(val) => setSettings(prev => ({ ...prev, brandKit: { ...prev.brandKit, industry: val } }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map(i => (
                        <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* FIX 4: Terminology field — was in model but never shown in UI */}
              <div className="space-y-2">
                <Label>Preferred Terminology</Label>
                <Input
                  placeholder="e.g. 'pipeline' not 'funnel', 'founders' not 'entrepreneurs'..."
                  value={settings.brandKit.terminology}
                  onChange={(e) => setSettings(prev => ({ ...prev, brandKit: { ...prev.brandKit, terminology: e.target.value } }))}
                />
                <p className="text-xs text-muted-foreground">
                  Words and phrases the AI should always or never use in your posts.
                </p>
              </div>

              {/* FIX 3: changed variant="hero" → variant="accent" */}
              <Button
                onClick={() => handleSave("brandKit")}
                disabled={saving}
                variant="accent"
              >
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Syncing...</> : "Sync Knowledge Base"}
              </Button>
            </div>
          </TabsContent>

          {/* ── Model Config ─────────────────────────────────────────────────── */}
          <TabsContent value="model-config" className="space-y-6">
            <div className="editorial-card space-y-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" /> Parameters
              </h2>

              {/* High reasoning toggle */}
              <div className="flex items-center justify-between p-4 border rounded-xl bg-primary/5">
                <div>
                  <Label className="text-sm font-medium">High-Reasoning Mode (Claude Sonnet 4.6)</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Slower but produces significantly better posts. Recommended for Story and Hot Take formats.
                  </p>
                </div>
                <Switch
                  checked={settings.modelConfig.highReasoning}
                  onCheckedChange={(val) => setSettings(prev => ({ ...prev, modelConfig: { ...prev.modelConfig, highReasoning: val } }))}
                />
              </div>

              {/* Creativity / temperature */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Creativity ({settings.modelConfig.temperature})</Label>
                  <Select
                    value={settings.modelConfig.temperature.toString()}
                    onValueChange={(val) => setSettings(prev => ({ ...prev, modelConfig: { ...prev.modelConfig, temperature: parseFloat(val) } }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.2">Precise (0.2) — Consistent, safe outputs</SelectItem>
                      <SelectItem value="0.5">Focused (0.5) — Balanced</SelectItem>
                      <SelectItem value="0.7">Balanced (0.7) — Recommended</SelectItem>
                      <SelectItem value="0.9">Creative (0.9) — More surprising hooks</SelectItem>
                      <SelectItem value="1.0">Wild (1.0) — Most experimental</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Global negative prompt */}
              <div className="space-y-2">
                <Label>Global Negative Prompt</Label>
                <Textarea
                  rows={3}
                  placeholder="Things to never write about or phrases to always avoid..."
                  value={settings.modelConfig.negativePrompt}
                  onChange={(e) => setSettings(prev => ({ ...prev, modelConfig: { ...prev.modelConfig, negativePrompt: e.target.value } }))}
                />
                <p className="text-xs text-muted-foreground">
                  Applied to every generation. Use this to block topics, phrases, or styles you never want.
                </p>
              </div>

              {/* FIX 3: changed variant="hero" → variant="accent" */}
              <Button
                onClick={() => handleSave("modelConfig")}
                disabled={saving}
                variant="accent"
              >
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save Parameters"}
              </Button>
            </div>
          </TabsContent>

          {/* ── Agentic Tools / LinkedIn ─────────────────────────────────────── */}
          <TabsContent value="integrations" className="space-y-6">
            <div className="editorial-card space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 rounded-2xl">
                  <Share2 className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Social Integrations</h2>
                  <p className="text-sm text-muted-foreground">Authorize AI agents to interact with your platforms.</p>
                </div>
              </div>

              <div className="grid gap-4">
                {/* LinkedIn */}
                <div className="p-5 border rounded-[2rem] bg-card flex flex-col md:flex-row items-center justify-between gap-4 transition-all hover:border-blue-200">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="h-12 w-12 shrink-0 rounded-2xl bg-[#0077b5] flex items-center justify-center shadow-lg shadow-[#0077b5]/20">
                      <Link2 className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm md:text-base flex items-center gap-2">
                        LinkedIn Profile
                        {settings.linkedin?.isConnected && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                        )}
                      </h3>
                      <p className="text-[11px] text-muted-foreground">Enables PostGenix Agentic Auto-Drafting</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    {settings.linkedin?.isConnected ? (
                      <>
                        <div className="hidden sm:block text-center">
                          <p className="text-[10px] font-black text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
                            Active
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate max-w-[120px] mt-0.5">
                            {settings.linkedin.profileName}
                          </p>
                        </div>

                        <AlertDialog open={isDisconnectModalOpen} onOpenChange={setIsDisconnectModalOpen}>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="h-9 px-4 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 rounded-xl text-xs font-bold"
                            >
                              Disconnect
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Revoke AI Access?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will disconnect your LinkedIn account. PostGenix AI will no longer be able to draft or publish posts on your behalf.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDisconnectLinkedIn}
                                disabled={saving}
                                className="bg-red-600 hover:bg-red-700 rounded-xl"
                              >
                                {saving ? "Disconnecting..." : "Yes, Disconnect"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    ) : (
                      <Button
                        onClick={handleConnectLinkedIn}
                        className="bg-[#0077b5] hover:bg-[#005f91] text-white font-bold rounded-xl h-10 px-6 shadow-md shadow-[#0077b5]/20"
                      >
                        Connect Account
                      </Button>
                    )}
                  </div>
                </div>

                {/* Twitter — coming soon */}
                <div className="p-5 border rounded-[2rem] bg-muted/20 opacity-50 flex items-center justify-between grayscale pointer-events-none select-none">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-black flex items-center justify-center">
                      <Zap className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">Twitter/X Agent</h3>
                      <p className="text-[11px] text-muted-foreground italic">Coming to PostGenix v2</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold uppercase border px-2 py-1 rounded-md tracking-widest">
                    Labs Only
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── Security ─────────────────────────────────────────────────────── */}
          <TabsContent value="security" className="space-y-6">
            <div className="editorial-card space-y-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" /> Account Security
              </h2>

              <div className="grid gap-4 max-w-sm">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="••••••••"
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords(prev => ({ ...prev, currentPassword: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                </div>

                {/* FIX 2: onClick only, no form/FormEvent */}
                <Button
                  variant="outline"
                  className="w-fit"
                  onClick={handlePasswordUpdate}
                  disabled={saving}
                >
                  {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...</> : "Update Credentials"}
                </Button>
              </div>

              <Separator />
            </div>

            {/* Danger Zone */}
            <div className="editorial-card border-red-200 bg-red-50/5">
              <h2 className="text-red-600 font-semibold mb-2 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> Danger Zone
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Deleting your account will purge all training data and saved Brand Kits. This action is irreversible.
              </p>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">Purge Account Data</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete your account and remove all data — Brand Kits, Model Configs, posts, and logs — from our servers. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handlePurgeAccount}
                      disabled={saving}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {saving ? "Purging..." : "Yes, Delete Everything"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </TabsContent>
          

        </Tabs>
      </div>
    </DashboardLayout>
  );
}