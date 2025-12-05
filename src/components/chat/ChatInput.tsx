import { useState, useRef, KeyboardEvent } from "react";
import { Send, Paperclip, X, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string, file?: { name: string; type: string; content: string }) => void;
  onStop: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, onStop, isLoading, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<{ name: string; type: string; content: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!message.trim() && !file) return;
    onSend(message.trim(), file || undefined);
    setMessage("");
    setFile(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Only allow text-based files
    const allowedTypes = [
      "text/plain",
      "text/javascript",
      "text/typescript",
      "text/html",
      "text/css",
      "text/markdown",
      "application/json",
      "application/javascript",
    ];

    const isTextFile = allowedTypes.includes(selectedFile.type) || 
      selectedFile.name.match(/\.(js|ts|tsx|jsx|py|java|cpp|c|h|css|html|json|md|txt|xml|yaml|yml)$/i);

    if (!isTextFile) {
      alert("Please upload a text-based file (code, notes, etc.)");
      return;
    }

    try {
      const content = await selectedFile.text();
      setFile({
        name: selectedFile.name,
        type: selectedFile.type || "text/plain",
        content: content.slice(0, 10000), // Limit content size
      });
    } catch (error) {
      console.error("Failed to read file:", error);
    }

    e.target.value = "";
  };

  return (
    <div className="p-3 border-t border-border/50 bg-background/50 backdrop-blur-md">
      {file && (
        <div className="flex items-center gap-2 mb-2 p-2 rounded-lg bg-secondary/50 text-sm">
          <Paperclip className="w-4 h-4 text-muted-foreground" />
          <span className="truncate flex-1">{file.name}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setFile(null)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept=".js,.ts,.tsx,.jsx,.py,.java,.cpp,.c,.h,.css,.html,.json,.md,.txt,.xml,.yaml,.yml"
        />

        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 flex-shrink-0"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isLoading}
        >
          <Paperclip className="w-5 h-5" />
        </Button>

        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything..."
          disabled={disabled || isLoading}
          className={cn(
            "min-h-[44px] max-h-[120px] resize-none bg-card/50 border-border/50",
            "focus-visible:ring-primary/50 transition-all duration-200"
          )}
          rows={1}
        />

        {isLoading ? (
          <Button
            variant="destructive"
            size="icon"
            className="h-10 w-10 flex-shrink-0"
            onClick={onStop}
          >
            <StopCircle className="w-5 h-5" />
          </Button>
        ) : (
          <Button
            size="icon"
            className="h-10 w-10 flex-shrink-0"
            onClick={handleSend}
            disabled={disabled || (!message.trim() && !file)}
          >
            <Send className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
};
