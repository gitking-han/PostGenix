"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera, Image as ImageIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// Make sure this path matches where you saved the cropper file
import { ImageCropperModal } from "./ImageCropperModal"; 

const defaultForm = {
  firstName: "",
  lastName: "",
  avatarUrl: "",
  headline: "",
  bio: "",
  coverImage: "", 
  niche: "",
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

  /* --- NEW: State for the Cropper Modal --- */
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

  /* --- UPDATED: Handle File Selection --- */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Instead of setting the form immediately, we open the cropper
        setCropper({
          image: reader.result as string,
          type: type === 'avatar' ? 'avatarUrl' : 'coverImage',
          aspect: type === 'avatar' ? 1 : 3 / 1, // 1:1 for Profile, 3:1 for Cover
          title: type === 'avatar' ? "Crop Profile Picture" : "Crop Cover Image"
        });
      };
      reader.readAsDataURL(file);
    }
  };

  /* --- NEW: Finalize the cropped image --- */
  const handleCropComplete = (croppedImage: string) => {
    if (cropper) {
      setForm((prev) => ({
        ...prev,
        [cropper.type]: croppedImage,
      }));
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
        preferences: { niche: form.niche, tone: form.tone },
        socialLinks: { 
            linkedin: form.linkedin, 
            twitter: form.twitter, 
            github: form.github, 
            website: form.website 
        },
        location: { city: form.city, country: form.country },
      };

      const res = await fetch(`http://localhost:5000/api/profile/complete`, {
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
    <div className="space-y-8 p-6 bg-background rounded-xl shadow-sm max-w-2xl mx-auto border">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Edit Identity & Profile</h2>
          <p className="text-sm text-muted-foreground">Modify your profile data with fixed image ratios.</p>
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
                <p className="text-[10px] text-muted-foreground font-medium text-center">
                   400x400px (1:1)
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4 flex-1 w-full">
                <div className="space-y-1">
                    <label className="text-xs font-medium pl-1">First Name</label>
                    <Input name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium pl-1">Last Name</label>
                    <Input name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} />
                </div>
            </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
            <label className="text-xs font-medium pl-1">Headline</label>
            <Input name="headline" placeholder="e.g. Content Creator @TechCo" value={form.headline} onChange={handleChange} />
        </div>

        <div className="space-y-1">
            <label className="text-xs font-medium pl-1">Bio</label>
            <Textarea name="bio" placeholder="Tell the world about yourself..." value={form.bio} onChange={handleChange} className="min-h-[100px]" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-end">
             <label className="text-sm font-medium">Cover Image</label>
             <span className="text-[10px] text-muted-foreground">Recommended: 1500x500px (3:1)</span>
          </div>
          
          <div 
            className="relative h-40 w-full border-2 border-dashed rounded-lg overflow-hidden flex items-center justify-center group cursor-pointer bg-muted/50 hover:bg-muted/80 transition-colors"
            onClick={() => document.getElementById('coverInput')?.click()}
          >
            {form.coverImage ? (
              <img src={form.coverImage} className="w-full h-full object-cover" alt="Cover preview" />
            ) : (
              <div className="text-center text-muted-foreground">
                  <ImageIcon className="mx-auto h-10 w-10 mb-2 opacity-50" />
                  <p className="text-xs">Click to upload professional cover</p>
              </div>
            )}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="text-white w-8 h-8" />
            </div>
            <input 
                id="coverInput" 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => handleFileChange(e, 'cover')} 
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
            <label className="text-xs font-medium pl-1">Niche</label>
            <Input name="niche" placeholder="SaaS, AI, etc." value={form.niche} onChange={handleChange} />
        </div>
        <div className="space-y-1">
            <label className="text-xs font-medium pl-1">Tone</label>
            <Input name="tone" placeholder="Professional" value={form.tone} onChange={handleChange} />
        </div>
        <Input name="linkedin" placeholder="LinkedIn URL" value={form.linkedin} onChange={handleChange} />
        <Input name="twitter" placeholder="Twitter URL" value={form.twitter} onChange={handleChange} />
        <Input name="city" placeholder="City" value={form.city} onChange={handleChange} />
        <Input name="country" placeholder="Country" value={form.country} onChange={handleChange} />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
            Save Changes
        </Button>
      </div>

      {/* --- CROPPER MODAL INTEGRATION --- */}
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