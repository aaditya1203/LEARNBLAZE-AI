import { memo } from "react";
import { Bot } from "lucide-react";

export const TypingIndicator = memo(() => {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
        <Bot className="w-4 h-4" />
      </div>
      <div className="bg-card/80 border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
});

TypingIndicator.displayName = "TypingIndicator";
