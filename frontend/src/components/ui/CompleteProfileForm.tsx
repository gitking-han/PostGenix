"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera, Image as ImageIcon, X, Tag, Target } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ImageCropperModal } from "./ImageCropperModal"; 

const defaultForm = {
  firstName: "",
  lastName: "",
  avatarUrl: "",
  headline: "",
  bio: "",
  coverImage: "", 
  niche: "",
  brandKeywords: [] as string[], // NEW
  tone: "professional",
  linkedin: "",
  twitter: "",
  github: "",
  website: "",
  city: "",
  country: "",
};

interface CompleteProfileFormProps {
  token: string;
  initialData?: Partial<typeof defaultForm>;
  onComplete?: () => void;
  onCancel?: () => void;
}

export function CompleteProfileForm({
  token,
  initialData,
  onComplete,
  onCancel,
}: CompleteProfileFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ ...defaultForm, ...initialData });
  const [keywordInput, setKeywordInput] = useState(""); // For the tag input

  const [cropper, setCropper] = useState<{
    image: string;
    type: 'avatarUrl' | 'coverImage';
    aspect: number;
    title: string;
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* --- Tag Logic for Brand Keywords --- */
  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const value = keywordInput.trim().replace(/,/g, '');
      if (value && !form.brandKeywords.includes(value)) {
        setForm(prev => ({
          ...prev,
          brandKeywords: [...prev.brandKeywords, value]
        }));
      }
      setKeywordInput("");
    }
  };

  const removeKeyword = (tagToRemove: string) => {
    setForm(prev => ({
      ...prev,
      brandKeywords: prev.brandKeywords.filter(t => t !== tagToRemove)
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropper({
          image: reader.result as string,
          type: type === 'avatar' ? 'avatarUrl' : 'coverImage',
          aspect: type === 'avatar' ? 1 : 3 / 1,
          title: type === 'avatar' ? "Crop Profile Picture" : "Crop Cover Image"
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImage: string) => {
    if (cropper) {
      setForm((prev) => ({ ...prev, [cropper.type]: croppedImage }));
    }
    setCropper(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        avatarUrl: form.avatarUrl,
        headline: form.headline,
        bio: form.bio,
        coverImageUrl: form.coverImage,
        preferences: { 
            niche: form.niche, 
            tone: form.tone,
            brandKeywords: form.brandKeywords // NEW: Included in payload
        },
        socialLinks: { 
            linkedin: form.linkedin, 
            twitter: form.twitter, 
            github: form.github, 
            website: form.website 
        },
        location: { city: form.city, country: form.country },
      };
 
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/profile/complete`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "auth-token": token },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Update failed");
      toast({ title: "Profile Updated", description: "Changes saved successfully." });
      onComplete?.();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-6 bg-background rounded-xl shadow-sm max-w-2xl mx-auto border mb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Edit Identity & Profile</h2>
          <p className="text-sm text-muted-foreground">Customize how Nova sees your brand.</p>
        </div>
      </div>

      {/* Identity Section */}
      <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-dashed">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Identity</h3>
        <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex flex-col items-center gap-2">
                <div className="relative group">
                    <Avatar className="w-24 h-24 border-2 border-primary shadow-md">
                        <AvatarImage src={form.avatarUrl} className="object-cover" />
                        <AvatarFallback className="text-xl">{form.firstName?.[0]}</AvatarFallback>
                    </Avatar>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-all">
                        <Camera className="w-6 h-6" />
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 flex-1 w-full">
                <div className="space-y-1">
                    <label className="text-xs font-medium pl-1 text-muted-foreground">First Name</label>
                    <Input name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium pl-1 text-muted-foreground">Last Name</label>
                    <Input name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} />
                </div>
            </div>
        </div>
      </div>

      {/* BRAND INTELLIGENCE SECTION - NEW */}
      <div className="space-y-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
        <h3 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
            <Target className="w-3 h-3" /> Brand Intelligence
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-xs font-medium pl-1">Your Niche</label>
                <Input 
                    name="niche" 
                    placeholder="e.g. LinkedIn growth for B2B founders" 
                    value={form.niche} 
                    onChange={handleChange} 
                />
            </div>
            <div className="space-y-1">
                <label className="text-xs font-medium pl-1">Preferred Tone</label>
                <Input name="tone" placeholder="e.g. Direct, story-led" value={form.tone} onChange={handleChange} />
            </div>
        </div>

        <div className="space-y-1">
            <label className="text-xs font-medium pl-1">Brand Keywords (Type & Press Enter)</label>
            <div className="min-h-[42px] p-1.5 flex flex-wrap gap-2 border rounded-md bg-background focus-within:ring-2 focus-within:ring-primary/20">
                {form.brandKeywords.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1 px-2 py-1">
                        {tag}
                        <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => removeKeyword(tag)} />
                    </Badge>
                ))}
                <input
                    className="flex-1 bg-transparent border-none outline-none text-sm px-2 min-w-[120px]"
                    placeholder={form.brandKeywords.length === 0 ? "storytelling, data-driven..." : ""}
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={handleKeywordKeyDown}
                />
            </div>
        </div>
      </div>

      {/* Standard Bio & Images */}
      <div className="space-y-4">
        <div className="space-y-1">
            <label className="text-xs font-medium pl-1 text-muted-foreground">Headline</label>
            <Input name="headline" placeholder="Headline" value={form.headline} onChange={handleChange} />
        </div>

        <div className="space-y-1">
            <label className="text-xs font-medium pl-1 text-muted-foreground">Bio / About</label>
            <Textarea name="bio" placeholder="Tell your story..." value={form.bio} onChange={handleChange} className="min-h-[100px]" />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Cover Image</label>
          <div 
            className="relative h-40 w-full border-2 border-dashed rounded-lg overflow-hidden flex items-center justify-center group cursor-pointer bg-muted/50"
            onClick={() => document.getElementById('coverInput')?.click()}
          >
            {form.coverImage ? (
              <img src={form.coverImage} className="w-full h-full object-cover" alt="Cover" />
            ) : (
              <div className="text-center text-muted-foreground">
                  <ImageIcon className="mx-auto h-8 w-8 mb-1 opacity-50" />
                  <p className="text-[10px]">Click to upload cover (3:1)</p>
              </div>
            )}
            <input id="coverInput" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} />
          </div>
        </div>
      </div>

      {/* Socials & Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input name="linkedin" placeholder="LinkedIn URL" value={form.linkedin} onChange={handleChange} />
        <Input name="twitter" placeholder="Twitter URL" value={form.twitter} onChange={handleChange} />
        <Input name="city" placeholder="City" value={form.city} onChange={handleChange} />
        <Input name="country" placeholder="Country" value={form.country} onChange={handleChange} />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
            Save Changes
        </Button>
      </div>

      {cropper && (
        <ImageCropperModal
          image={cropper.image}
          aspect={cropper.aspect}
          title={cropper.title}
          isOpen={!!cropper}
          onClose={() => setCropper(null)}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}