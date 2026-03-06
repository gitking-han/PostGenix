import {
    Plus,
    Search,
    Trash2,
    AlertTriangle,
    PanelLeftClose,
    PanelLeftOpen,
    History,    // New icon for tabs
    UserCircle, // New icon for Profile Lab
    Sparkles // Updated
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProfileAnalyzer } from "./ProfileAnalyzer";
/**
 * 1. CUSTOM DELETE MODAL
 */
function DeleteConfirmModal({ isOpen, onClose, onConfirm }: any) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-6 text-center">
                        <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle className="w-6 h-6" /></div>
                        <h3 className="text-lg font-bold mb-2">Delete Conversation?</h3>
                        <p className="text-sm text-muted-foreground mb-6">This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>Cancel</Button>
                            <Button variant="destructive" className="flex-1 rounded-xl bg-red-600" onClick={onConfirm}>Delete</Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

/**
 * 2. CHAT SIDEBAR COMPONENT
 */
export function ChatSidebar({ onSelectChat, onNewChat, onDeleteChat, chats = [], onApplyBranding }: any) {
    const [searchQuery, setSearchQuery] = useState("");
    const [idToDelete, setIdToDelete] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(true);
    const [activeTab, setActiveTab] = useState<"history" | "profile">("history");
    const formatDate = (dateStr: string) => {
        if (!dateStr) return "Just now";
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const filteredChats = chats.filter((chat: any) =>
        chat.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            {/* Maximize Button (Using ChevronRight to match Dashboard style) */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="absolute left-60 top-8 z-[50]"
                    >
                        <Button
                            variant="outline"
                            size="iconSm"
                            onClick={() => setIsOpen(true)}
                            className="text-sidebar-foreground"
                        >
                            <PanelLeftOpen className="w-4 h-4" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={false}
                animate={{
                    width: isOpen ? 300 : 0,
                    opacity: isOpen ? 1 : 0
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative flex flex-col h-full bg-card border-r border-border overflow-hidden"
            >
                <DeleteConfirmModal
                    isOpen={!!idToDelete}
                    onClose={() => setIdToDelete(null)}
                    onConfirm={() => { onDeleteChat(idToDelete); setIdToDelete(null); }}
                />
                <div className="flex border-b border-border min-w-[320px]">
                    <button
                        onClick={() => setActiveTab("history")}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs font-bold transition-all
                        ${activeTab === "history"
                                ? "text-accent border-b-2 border-accent bg-accent/5"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/20"}`}
                    >
                        <History className="w-4 h-4" />
                        HISTORY
                    </button>
                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs font-bold transition-all
                        ${activeTab === "profile"
                                ? "text-accent border-b-2 border-accent bg-accent/5"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/20"}`}
                    >
                        <UserCircle className="w-4 h-4" />
                        PROFILE LAB
                    </button>
                </div>

                {/* Header Area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {activeTab === "history" ? (
                        /* --- HISTORY TAB CONTENT --- */
                        <>
                            <div className="p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-bold tracking-tight">History</h2>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setIsOpen(false)}
                                        className="hidden md:flex text-muted-foreground hover:text-foreground h-8 w-8"
                                    >
                                        <PanelLeftClose className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    <Button onClick={onNewChat} className="w-full justify-start gap-2 bg-accent text-accent-foreground font-bold shadow-lg shadow-accent/10">
                                        <Plus className="w-4 h-4" /> New Generation
                                    </Button>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search..."
                                            className="pl-9 bg-background/50 focus-visible:ring-accent/20"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* List Area */}
                            <ScrollArea className="flex-1 w-full">
                                <div className="flex flex-col gap-1 p-3"> {/* Use flex column with gap for consistent spacing */}
                                    {filteredChats.length > 0 ? (
                                        filteredChats.map((chat: any) => (
                                            <div
                                                key={chat._id}
                                                className="group/item relative w-full overflow-hidden rounded-xl"
                                            >
                                                <button
                                                    onClick={() => onSelectChat(chat._id)}
                                                    className={`
                            w-full flex flex-col items-start gap-1 p-3 transition-all text-left
                            hover:bg-white/[0.05] active:bg-white/[0.08]
                           
                            border border-transparent
                        `}
                                                >
                                                    <div className="w-full flex justify-between items-center mb-0.5">
                                                        <span className="text-[13px] font-medium truncate text-zinc-100 pr-2">
                                                            {chat.title || "Untitled Post"}
                                                        </span>
                                                        <span className="text-[10px] text-zinc-500 whitespace-nowrap group-hover/item:opacity-0 transition-opacity">
                                                            {formatDate(chat.updatedAt)}
                                                        </span>
                                                    </div>

                                                    <p className="text-[11px] text-zinc-500 line-clamp-1 w-full italic">
                                                        {chat.lastPreview || "No preview..."}
                                                    </p>
                                                </button>

                                                {/* Delete Button - Positioned exactly on the right */}
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-all">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setIdToDelete(chat._id);
                                                        }}
                                                        className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center mt-10 px-4 text-center">
                                            <p className="text-xs text-zinc-500 italic">No history yet</p>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </>
                    ) : (
                        /* --- PROFILE LAB TAB CONTENT --- */
                        <ScrollArea className="flex-1 w-full">
                            <div className="p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-sm font-bold tracking-widest text-accent uppercase flex items-center gap-2">
                                        <Sparkles className="w-4 h-4" /> Profile Lab
                                    </h2>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setIsOpen(false)}
                                        className="h-8 w-8 text-muted-foreground"
                                    >
                                        <PanelLeftClose className="w-4 h-4" />
                                    </Button>
                                </div>

                                <ProfileAnalyzer onApplyBranding={(data: string) => {
                                    onApplyBranding(data); // Call the function passed from WritePage
                                }} />
                                {/* <div className="p-8 text-center border border-dashed border-border rounded-2xl bg-accent/5">
                                    <p className="text-xs text-muted-foreground">
                                        Profile Analyzer UI ready for Step 2 setup.
                                    </p>
                                </div> */}
                            </div>
                        </ScrollArea>
                    )}
                </div>
            </motion.div>
        </>
    );
}