import React, { useState, useEffect } from 'react';
import {
    Upload,
    Sparkles,
    Loader2,
    CheckCircle2,
    X,
    Zap,
    Target,
    MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function ProfileAnalyzer({ onApplyBranding }) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [extractedData, setExtractedData] = useState({ audience: "Pending...", tone: "Pending..." });

    // --- 1. NEW: Fetch existing analysis on mount ---
    useEffect(() => {
        const fetchExistingAnalysis = async () => {
            try {
                // Assuming you have an endpoint that returns user settings
                const response = await fetch('/api/settings/fetch', {
                    headers: { "auth-token": localStorage.getItem("authToken") }
                });
                const data = await response.json();
                
                if (data.lastProfileAnalysis && data.lastProfileAnalysis.text) {
                    setAnalysis(data.lastProfileAnalysis.text);
                    setExtractedData({
                        audience: data.lastProfileAnalysis.audience,
                        tone: data.lastProfileAnalysis.tone
                    });
                }
            } catch (error) {
                console.error("Could not fetch previous analysis", error);
            }
        };
        fetchExistingAnalysis();
    }, []);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            // We don't reset analysis here so user can compare 
            // until they click "Analyze Branding"
        }
    };

    const clearFile = () => {
        setFile(null);
        setPreview(null);
    };

    const runNovaAnalysis = async () => {
        if (!file) return;
        setLoading(true);

        const formData = new FormData();
        formData.append('profileImage', file);

        try {
            const response = await fetch('/api/ai/analyze-profile', {
                method: 'POST',
                headers: {
                    "auth-token": localStorage.getItem("authToken")
                },
                body: formData
            });

            if (!response.ok) throw new Error('Failed to analyze profile');

            const data = await response.json();
            
            // --- 2. UPDATED: No more manual parsing! ---
            // The backend already split the text and the JSON for us.
            setAnalysis(data.analysis);
            setExtractedData(data.extractedData);
            
            // Clear the upload UI after successful run
            clearFile();

        } catch (error) {
            console.error("Analysis failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 p-1">
            {/* UPLOAD AREA */}
            <div className="relative">
                <AnimatePresence mode="wait">
                    {!preview ? (
                        <motion.label
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-2xl bg-accent/5 hover:bg-accent/10 hover:border-accent/40 transition-all cursor-pointer group"
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <div className="p-3 rounded-full bg-accent/10 mb-3 group-hover:scale-110 transition-transform">
                                    <Upload className="w-6 h-6 text-accent" />
                                </div>
                                <p className="text-xs font-bold text-zinc-300">Drop LinkedIn Screenshot</p>
                                <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-tighter">PNG, JPG up to 5MB</p>
                            </div>
                            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                        </motion.label>



                    ) : (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative w-full h-48 rounded-2xl overflow-hidden border border-border bg-black"
                        >
                            <img src={preview} alt="Preview" className="w-full h-full object-contain opacity-70" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                            <button
                                onClick={clearFile}
                                className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500/80 text-white rounded-full transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            <div className="absolute bottom-3 left-3">
                                <p className="text-[10px] font-bold text-accent uppercase tracking-widest flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Ready for Nova
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ACTION BUTTON */}
            <Button
                onClick={runNovaAnalysis}
                disabled={!file || loading}
                className="w-full h-12 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground font-bold shadow-lg shadow-accent/20"
            >
                {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> SCANNING...</>
                ) : (
                    <><Sparkles className="w-4 h-4 mr-2" /> {analysis ? "RE-ANALYZE PROFILE" : "ANALYZE PROFILE"}</>
                )}
            </Button>

            {/* RESULTS AREA */}
            <AnimatePresence>
                {analysis && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <div className="p-4 rounded-2xl bg-zinc-900/50 border border-border space-y-3">
                            <div className="flex items-center gap-2 text-accent font-bold text-[11px] uppercase tracking-widest">
                                <Zap className="w-3 h-3" /> Nova Insights
                            </div>
                            <div className="text-[13px] text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                "{analysis}"
                            </div>
                            <div className="pt-2 border-t border-border/50">
                                <Button
                                    variant="outline"
                                    onClick={() => onApplyBranding(analysis)}
                                    className="w-full justify-between text-[11px] font-bold hover:bg-accent/10 hover:text-accent border-accent/20 h-9"
                                >
                                    SYNC TO BRAND KIT
                                    <Zap className="w-3 h-3 fill-current" />
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 rounded-lg bg-zinc-800/30 border border-border flex flex-col items-center text-center">
                                <Target className="w-3 h-3 text-zinc-500 mb-1" />
                                <span className="text-[9px] text-zinc-500 uppercase font-bold">Audience</span>
                                <span className="text-[10px] text-accent font-medium truncate w-full">{extractedData.audience}</span>
                            </div>
                            <div className="p-2 rounded-lg bg-zinc-800/30 border border-border flex flex-col items-center text-center">
                                <MessageSquare className="w-3 h-3 text-zinc-500 mb-1" />
                                <span className="text-[9px] text-zinc-500 uppercase font-bold">Tone</span>
                                <span className="text-[10px] text-accent font-medium truncate w-full">{extractedData.tone}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}



