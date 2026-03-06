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
  ShieldCheck, Share2, Sparkles, Cpu, ShieldAlert, Zap, Globe, Link2, Database, Loader2, CheckCircle2, ExternalLink
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);

  // State matching your Mongoose Schema
  const [settings, setSettings] = useState({
    brandKit: {
      mission: "",
      targetAudience: "",
      industry: "saas",
      terminology: ""
    },
    modelConfig: {
      highReasoning: true,
      temperature: 0.7,
      maxTokens: "medium",
      negativePrompt: ""
    },
    // Added this to track LinkedIn status
    linkedin: {
      isConnected: false,
      profileName: ""
    }
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('linkedin') === 'connected') {
      toast({
        title: "LinkedIn Connected!",
        description: "PostGenix can now draft posts for you.",
      });
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);



  // 3. NEW: Trigger LinkedIn OAuth Flow
  const handleConnectLinkedIn = () => {
    const token = localStorage.getItem('authToken');
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/linkedin/connect?token=${token}`;
  };
  const handleDisconnectLinkedIn = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/linkedin/disconnect`, {
        method: 'PUT',
        headers: { 'auth-token': localStorage.getItem('authToken') || '' }
      });

      if (res.ok) {
        setSettings({
          ...settings,
          linkedin: { isConnected: false, profileName: "" }
        });
        toast({
          title: "LinkedIn Disconnected",
          description: "Nova's agentic access has been revoked.",
        });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to disconnect.", variant: "destructive" });
    } finally {
      setSaving(false);
      setIsDisconnectModalOpen(false);
    }
  };
  // Fetch settings on mount
  // Inside SettingsPage.tsx

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('authToken');

        // 1. Fetch AI Workspace Settings
        const settingsRes = await fetch('/api/settings/fetch', {
          headers: { 'auth-token': token || '' }
        });
        const settingsData = await settingsRes.json();

        // 2. Fetch User Profile (This contains the LinkedIn info!)
        const userRes = await fetch('/api/auth/get-user', {
          headers: { 'auth-token': token || '' }
        });
        const userData = await userRes.json();

        if (settingsRes.ok && userRes.ok) {
          // Merge the two data sources
          setSettings({
            ...settingsData,
            linkedin: {
              isConnected: userData.linkedin?.isConnected || false,
              profileName: userData.linkedin?.profileName || ""
            }
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
  const handleSave = async (section: "brandKit" | "modelConfig") => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('authToken') || ''
        },
        // FIX: Send the structure the backend expects
        body: JSON.stringify({
          type: section,
          data: settings[section]
        }),
      });

      if (response.ok) {
        toast({
          title: "Settings Updated",
          description: "Changes saved to your profile.",
        });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Inside SettingsPage component
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Client-side validation
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive"
      });
    }

    if (passwords.newPassword.length < 5) {
      return toast({
        title: "Error",
        description: "Password must be at least 5 characters",
        variant: "destructive"
      });
    }

    setSaving(true);

    try {
      const res = await fetch(`/api/auth/update-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem('authToken') || '' // Use your logged-in token
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({ title: "Success", description: "Password updated successfully." });
        // Clear fields
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast({
          title: "Update Failed",
          description: data.message || "Could not update password",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({ title: "Error", description: "Server error. Please try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handlePurgeAccount = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/auth/delete-account`, {
        method: "DELETE",
        headers: {
          "auth-token": localStorage.getItem('authToken') || ''
        },
      });

      if (res.ok) {
        toast({ title: "Account Purged", description: "Your data has been removed." });
        // Redirect to signup or login
        localStorage.removeItem('authToken');
        window.location.href = "/signup";
      } else {
        toast({ title: "Error", description: "Could not delete account.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Server error.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-10 max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">Configure your AI workspace parameters.</p>
        </header>

        <Tabs defaultValue="brand-kit" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 border overflow-x-auto justify-start h-auto">
            <TabsTrigger value="brand-kit" className="gap-2 py-2"><Sparkles className="w-4 h-4" /> AI Brand Kit</TabsTrigger>
            <TabsTrigger value="model-config" className="gap-2 py-2"><Cpu className="w-4 h-4" /> Model Config</TabsTrigger>
            <TabsTrigger value="integrations" className="gap-2 py-2 text-xs font-bold uppercase tracking-wider"><Link2 className="w-4 h-4" /> Agentic Tools</TabsTrigger>
            <TabsTrigger value="security" className="gap-2 py-2"><ShieldCheck className="w-4 h-4" /> Security</TabsTrigger>
          </TabsList>

          {/* BRAND KIT */}
          <TabsContent value="brand-kit" className="space-y-6">
            <div className="editorial-card space-y-6">
              <h2 className="text-xl font-semibold flex items-center gap-2"><Database className="w-5 h-5" /> Knowledge Base</h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Core Mission</Label>
                  <Textarea
                    value={settings.brandKit.mission}
                    onChange={(e) => setSettings({ ...settings, brandKit: { ...settings.brandKit, mission: e.target.value } })}
                    placeholder="We provide sustainable AI..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Target Audience</Label>
                    <Input
                      value={settings.brandKit.targetAudience}
                      onChange={(e) => setSettings({ ...settings, brandKit: { ...settings.brandKit, targetAudience: e.target.value } })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Select
                      value={settings.brandKit.industry}
                      onValueChange={(val) => setSettings({ ...settings, brandKit: { ...settings.brandKit, industry: val } })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="saas">B2B SaaS</SelectItem>
                        <SelectItem value="fintech">Fintech</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <Button onClick={() => handleSave("brandKit")} disabled={saving} variant="hero">
                {saving ? "Syncing..." : "Sync Knowledge Base"}
              </Button>
            </div>
          </TabsContent>

          {/* MODEL CONFIG */}
          <TabsContent value="model-config" className="space-y-6">
            <div className="editorial-card space-y-6">
              <h2 className="text-xl font-semibold flex items-center gap-2"><Zap className="w-5 h-5 text-amber-500" /> Parameters</h2>

              <div className="flex items-center justify-between p-4 border rounded-xl bg-primary/5">
                <Label>High-Reasoning Mode (Nova Pro)</Label>
                <Switch
                  checked={settings.modelConfig.highReasoning}
                  onCheckedChange={(val) => setSettings({ ...settings, modelConfig: { ...settings.modelConfig, highReasoning: val } })}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Creativity ({settings.modelConfig.temperature})</Label>
                  <Select
                    value={settings.modelConfig.temperature.toString()}
                    onValueChange={(val) => setSettings({ ...settings, modelConfig: { ...settings.modelConfig, temperature: parseFloat(val) } })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.2">Precise (0.2)</SelectItem>
                      <SelectItem value="0.7">Balanced (0.7)</SelectItem>
                      <SelectItem value="1.0">Creative (1.0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Global Negative Prompt</Label>
                <Textarea
                  value={settings.modelConfig.negativePrompt}
                  onChange={(e) => setSettings({ ...settings, modelConfig: { ...settings.modelConfig, negativePrompt: e.target.value } })}
                />
              </div>
              <Button onClick={() => handleSave("modelConfig")} disabled={saving} variant="hero">
                {saving ? "Saving..." : "Save Parameters"}
              </Button>
            </div>
          </TabsContent>

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
                {/* LinkedIn Card */}
                <div className="p-5 border rounded-[2rem] bg-card flex flex-col md:flex-row items-center justify-between gap-4 transition-all hover:border-blue-200">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="h-12 w-12 shrink-0 rounded-2xl bg-[#0077b5] flex items-center justify-center shadow-lg shadow-[#0077b5]/20">
                      <Link2 className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm md:text-base flex items-center gap-2">
                        LinkedIn Profile
                        {settings.linkedin?.isConnected && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                      </h3>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">Enables Nova Agentic Auto-Drafting</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    {settings.linkedin?.isConnected ? (
                      <>
                        <div className="hidden sm:block text-center pt-1.5">
                          <p className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-md uppercase tracking-wider">Active</p>
                          <p className="text-[10px] text-muted-foreground truncate max-w-[100px]">{settings.linkedin.profileName}</p>
                        </div>

                        {/* CUSTOM MODAL TRIGGER */}
                        <AlertDialog open={isDisconnectModalOpen} onOpenChange={setIsDisconnectModalOpen}>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="h-9 px-4 text-red-500 border-red-100 hover:bg-red-50 hover:text-red-600 rounded-xl text-xs font-bold transition-all"
                            >
                              Disconnect
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Revoke AI Access?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will disconnect your LinkedIn account. Nova will no longer be able to draft or publish posts on your behalf.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDisconnectLinkedIn}
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
                        className="bg-[#0077b5] hover:bg-[#0077b5]/90 text-white font-bold rounded-xl h-10 px-6 shadow-md shadow-[#0077b5]/10"
                      >
                        Connect Account
                      </Button>
                    )}
                  </div>
                </div>

                {/* Twitter Placeholder */}
                <div className="p-5 border rounded-[2rem] bg-muted/20 opacity-60 flex items-center justify-between grayscale">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-black flex items-center justify-center">
                      <Zap className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">Twitter/X Agent</h3>
                      <p className="text-[11px] text-muted-foreground italic">Coming to Nova v2.1</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold uppercase border px-2 py-1 rounded-md tracking-widest">Labs Only</span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* --- SECURITY --- */}
          <TabsContent value="security" className="space-y-6">
            <div className="editorial-card space-y-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" /> Account Security
              </h2>
              <div className="grid gap-4 max-w-sm">
                {/* Current Password - Required for security validation */}
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="••••••••"
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  />
                </div>

                <Button
                  variant="outline"
                  className="w-fit"
                  onClick={handlePasswordUpdate}
                  disabled={saving}
                >
                  {saving ? "Updating..." : "Update Credentials"}
                </Button>
              </div>

              <Separator />


            </div>

            <div className="editorial-card border-red-200 bg-red-50/5">
              <h2 className="text-red-600 font-semibold mb-2 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> Danger Zone
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Deleting your account will purge all training data and saved Brand Kits.
                This action is irreversible.
              </p>

              <AlertDialog>
                {/* This button triggers the modal */}
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    Purge Account Data
                  </Button>
                </AlertDialogTrigger>

                {/* The actual Modal Content */}
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      account and remove all your data (Brand Kits, Model Configs, and Logs)
                      from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handlePurgeAccount}
                      className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
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