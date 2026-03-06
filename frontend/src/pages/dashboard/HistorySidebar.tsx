import { MessageSquare, Plus, Search, Clock, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

export function HistorySidebar({ conversations, activeId, onSelect, onNew }: any) {
  return (
    <div className="w-72 border-r border-amber-100/50 dark:border-amber-900/20 h-full flex flex-col bg-background/50 backdrop-blur-md">
      {/* Action Header */}
      <div className="p-4 space-y-3">
        <Button onClick={onNew} className="w-full justify-start gap-2 bg-amber-400 hover:bg-amber-500 text-black font-bold rounded-xl shadow-lg shadow-amber-400/20">
          <Plus className="w-4 h-4" /> New Thread
        </Button>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-amber-500" />
          <input placeholder="Search chats..." className="w-full bg-slate-100 dark:bg-slate-900 text-xs p-2.5 pl-9 rounded-xl outline-none border border-transparent focus:border-amber-200" />
        </div>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 pb-6">
          <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
            <Clock className="w-3 h-3" /> Recent Generations
          </p>
          {conversations.map((chat: any) => (
            <button
              key={chat.id}
              onClick={() => onSelect(chat.id)}
              className={cn(
                "w-full text-left p-3 rounded-2xl transition-all duration-200 group relative",
                activeId === chat.id ? "bg-white dark:bg-slate-900 border border-amber-100 shadow-sm" : "hover:bg-slate-50 dark:hover:bg-slate-900/50"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", activeId === chat.id ? "bg-amber-400 text-black" : "bg-slate-100 dark:bg-slate-800")}>
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className={cn("text-xs font-bold truncate", activeId === chat.id ? "text-amber-600" : "text-foreground")}>{chat.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate opacity-70">{chat.preview}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}