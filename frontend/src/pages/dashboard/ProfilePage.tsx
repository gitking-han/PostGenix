"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Linkedin, Twitter, Loader2 } from "lucide-react";
import { CompleteProfileForm } from "@/components/ui/CompleteProfileForm";

/* ---------- Types ---------- */

interface Profile {
    username?: string;
    firstName?: string;
    lastName?: string;
    headline?: string;
    bio?: string;
    avatarUrl?: string;
    coverImageUrl?: string; // <-- Base64 image now
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
    };
}

/* ---------- Component ---------- */

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    /* ---------- Fetch Profile ---------- */

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

    /* ---------- Loading / Error ---------- */

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
                <div className="p-8 text-center text-red-500">
                    {error || "User not found"}
                </div>
            </DashboardLayout>
        );
    }

    /* ---------- UI ---------- */

    return (
        <DashboardLayout>
            {isEditing ? (
                <CompleteProfileForm
                    token={localStorage.getItem("authToken")!}
                    initialData={{
                        firstName: profile.firstName || "", // ADDED
                        lastName: profile.lastName || "",   // ADDED
                        avatarUrl: profile.avatarUrl || "", // ADDED
                        headline: profile.headline || "",
                        bio: profile.bio || "",
                        coverImage: profile.coverImageUrl || "",
                        niche: profile.preferences?.niche,
                        tone: profile.preferences?.tone,
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
                <div className="max-w-6xl mx-auto mt-6 rounded-lg bg-background">
                    {/* Cover */}
                    <div className="relative h-56 w-full bg-muted rounded-t-lg overflow-hidden">
                        {profile.coverImageUrl ? (
                            <img
                                src={profile.coverImageUrl}
                                alt="Cover"
                                className="object-cover w-full h-full"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500" />
                        )}
                    </div>

                    {/* Avatar */}
                    <div className="relative -mt-20 pl-8">
                        <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
                            <AvatarImage src={profile.avatarUrl} referrerPolicy="no-referrer" />
                            <AvatarFallback>
                                {profile.firstName?.[0]}
                                {profile.lastName?.[0]}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    {/* Info */}
                    <div className="pt-20 px-8 pb-8 space-y-6">
                        <div className="flex flex-col md:flex-row md:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold">
                                    {profile.firstName} {profile.lastName}
                                </h1>

                                <p className="text-muted-foreground">
                                    {profile.headline || "No headline set"}
                                </p>

                                {profile.location?.city && (
                                    <p className="text-sm text-muted-foreground">
                                        {profile.location.city}, {profile.location.country}
                                    </p>
                                )}

                                <p className="text-sm text-muted-foreground mt-1">
                                    Niche: {profile.preferences?.niche || "Not set"} | Tone:{" "}
                                    {profile.preferences?.tone || "Not set"}
                                </p>

                                {/* Socials */}
                                <div className="flex gap-4 mt-3">
                                    {profile.socialLinks?.linkedin && (
                                        <a href={profile.socialLinks.linkedin} target="_blank">
                                            <Linkedin className="hover:text-blue-600" />
                                        </a>
                                    )}
                                    {profile.socialLinks?.twitter && (
                                        <a href={profile.socialLinks.twitter} target="_blank">
                                            <Twitter className="hover:text-blue-400" />
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                                <Button variant="outline">Settings</Button>
                            </div>
                        </div>

                        {/* Bio */}
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold mb-2">About</h2>
                            <p className="text-muted-foreground">
                                {profile.bio || "Write something about yourself."}
                            </p>
                        </Card>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <StatCard label="Portfolio Views" value={profile.stats?.views} />
                            <StatCard label="Posts Generated" value={profile.stats?.postsGenerated} />
                            {/* <StatCard label="Posts Saved" value={profile.stats?.postsPublished} /> */}
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

/* ---------- Small Helper ---------- */

function StatCard({ label, value = 0 }: { label: string; value?: number }) {
    return (
        <Card className="p-6 text-center">
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-muted-foreground">{label}</p>
        </Card>
    );
}
