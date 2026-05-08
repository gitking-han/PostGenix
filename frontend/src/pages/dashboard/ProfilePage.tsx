"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge"; // Ensure you have a Badge component
import { Linkedin, Twitter, Loader2, Target, Hash, Pencil } from "lucide-react";
import { CompleteProfileForm } from "@/components/ui/CompleteProfileForm";
import { Link } from "react-router-dom";

/* ---------- Types ---------- */

interface Profile {
    firstName?: string;
    lastName?: string;
    headline?: string;
    bio?: string;
    avatarUrl?: string;
    coverImageUrl?: string;
    socialLinks?: {
        linkedin?: string;
        twitter?: string;
        github?: string;
        website?: string;
    };
    stats?: {
        views: number;
        postsGenerated: number;
        postsPublished: number;
    };
    location?: {
        city?: string;
        country?: string;
    };
    preferences?: {
        niche?: string;
        tone?: string;
        brandKeywords?: string[]; // Added this
    };
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("authToken");
            if (!token) {
                setError("Not authenticated");
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/profile/me`, {
                    headers: {
                        "Content-Type": "application/json",
                        "auth-token": token,
                    },
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Failed to fetch profile");

                setProfile(data.profile);
            } catch (err: any) {
                setError(err.message || "Server error");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [refreshKey]);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex h-screen items-center justify-center">
                    <Loader2 className="animate-spin h-8 w-8 text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    if (error || !profile) {
        return (
            <DashboardLayout>
                <div className="p-8 text-center text-red-500">{error || "User not found"}</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            {isEditing ? (
                <CompleteProfileForm
                    token={localStorage.getItem("authToken")!}
                    initialData={{
                        firstName: profile.firstName || "",
                        lastName: profile.lastName || "",
                        avatarUrl: profile.avatarUrl || "",
                        headline: profile.headline || "",
                        bio: profile.bio || "",
                        coverImage: profile.coverImageUrl || "",
                        niche: profile.preferences?.niche,
                        tone: profile.preferences?.tone,
                        brandKeywords: profile.preferences?.brandKeywords || [], // Pass to form
                        linkedin: profile.socialLinks?.linkedin,
                        twitter: profile.socialLinks?.twitter,
                        github: profile.socialLinks?.github,
                        website: profile.socialLinks?.website,
                        city: profile.location?.city,
                        country: profile.location?.country,
                    }}
                    onComplete={() => {
                        setIsEditing(false);
                        setRefreshKey((k) => k + 1);
                    }}
                    onCancel={() => setIsEditing(false)}
                />
            ) : (
                <div className="max-w-6xl mx-auto mt-6 rounded-lg bg-background border border-border overflow-hidden">
                    {/* Cover */}
                    <div className="relative h-56 w-full bg-muted overflow-hidden">
                        {profile.coverImageUrl ? (
                            <img src={profile.coverImageUrl} alt="Cover" className="object-cover w-full h-full" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                        )}
                    </div>

                    {/* Avatar */}
                    <div className="relative -mt-20 pl-8">
                        <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
                            <AvatarImage src={profile.avatarUrl} referrerPolicy="no-referrer" />
                            <AvatarFallback className="text-xl">
                                {profile.firstName?.[0]}{profile.lastName?.[0]}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    {/* Info */}
                    <div className="pt-4 px-8 pb-8 space-y-6">
                        <div className="flex flex-col md:flex-row md:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold">
                                    {profile.firstName} {profile.lastName}
                                </h1>

                                <p className="text-lg text-muted-foreground">
                                    {profile.headline || "No headline set"}
                                </p>

                                <div className="flex items-center gap-4 mt-2">
                                    {profile.location?.city && (
                                        <p className="text-sm text-muted-foreground">
                                            {profile.location.city}, {profile.location.country}
                                        </p>
                                    )}
                                    {/* Clickable Niche Prompt */}
                                    <button 
                                        onClick={() => setIsEditing(true)}
                                        className="group flex items-center gap-1.5 text-sm font-medium text-primary hover:opacity-80 transition-all"
                                    >
                                        <Target className="w-4 h-4" />
                                        <span>Niche: {profile.preferences?.niche || "Not set (Click to set)"}</span>
                                        <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                                    </button>
                                </div>

                                {/* Socials */}
                                <div className="flex gap-4 mt-4">
                                    {profile.socialLinks?.linkedin && (
                                        <a href={profile.socialLinks.linkedin} target="_blank" className="text-muted-foreground hover:text-blue-600 transition-colors">
                                            <Linkedin className="w-5 h-5" />
                                        </a>
                                    )}
                                    {profile.socialLinks?.twitter && (
                                        <a href={profile.socialLinks.twitter} target="_blank" className="text-muted-foreground hover:text-blue-400 transition-colors">
                                            <Twitter className="w-5 h-5" />
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 items-start">
                                <Button onClick={() => setIsEditing(true)} className="shadow-sm">Edit Profile</Button>
                                <Button variant="outline" asChild>
                                    <Link to="/dashboard/settings">Settings</Link>
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                {/* Bio */}
                                <Card className="p-6">
                                    <h2 className="text-lg font-semibold mb-3">About</h2>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {profile.bio || "Write something about yourself to help Nova understand your story."}
                                    </p>
                                </Card>

                                {/* NEW: Brand Intelligence Section */}
                                <Card className="p-6 border-primary/10 bg-primary/[0.01]">
                                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <Hash className="w-5 h-5 text-primary" />
                                        Brand Intelligence
                                    </h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Your Niche</label>
                                            <p className="text-sm mt-1">{profile.preferences?.niche || "Not defined yet"}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Brand Keywords</label>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {profile.preferences?.brandKeywords && profile.preferences.brandKeywords.length > 0 ? (
                                                    profile.preferences.brandKeywords.map((tag, i) => (
                                                        <Badge key={i} variant="secondary" className="px-3 py-1 text-xs font-medium">
                                                            {tag}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-muted-foreground italic">No keywords added yet.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            <div className="space-y-6">
                                {/* Stats */}
                                <div className="grid grid-cols-1 gap-8">
                                    <StatCard label="Portfolio Views" value={profile.stats?.views} />
                                    <StatCard label="Posts Generated" value={profile.stats?.postsGenerated} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

function StatCard({ label, value = 0 }: { label: string; value?: number }) {
    return (
        <Card className="p-6 flex flex-col items-center justify-center border-border/60">
            <p className="text-3xl font-bold text-primary">{value.toLocaleString()}</p>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-tight mt-1">{label}</p>
        </Card>
    );
}