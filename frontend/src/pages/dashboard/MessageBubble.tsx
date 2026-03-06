import { User, Ghost, Copy, Check, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function MessageBubble({ role, content }: { role: 'user' | 'ai', content: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-4 p-6 ${role === 'ai' ? 'bg-accent/5 border-y border-accent/10' : ''}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
        role === 'user' ? 'bg-primary/10 text-primary' : 'bg-accent text-accent-foreground'
      }`}>
        {role === 'user' ? <User className="w-5 h-5" /> : <Ghost className="w-5 h-5" />}
      </div>
      
      <div className="flex-1 space-y-4 overflow-hidden">
        <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
          {content}
        </p>
        
        {role === 'ai' && (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-8 text-[10px] gap-2">
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied" : "Copy Post"}
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-[10px] gap-2">
              <RotateCcw className="w-3 h-3" />
              Regenerate
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}