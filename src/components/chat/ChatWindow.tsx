import { useRef, useEffect } from "react";
import { X, Trash2, WifiOff, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { QuickReplies } from "./QuickReplies";
import { TypingIndicator } from "./TypingIndicator";
import { useAITutor } from "@/hooks/useAITutor";
import { cn } from "@/lib/utils";

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
}

export const ChatWindow = ({ isOpen, onClose, onMinimize }: ChatWindowProps) => {
  const {
    messages,
    isLoading,
    isOnline,
    context,
    sendMessage,
    stopGeneration,
    clearHistory,
  } = useAITutor();

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleQuickReply = (message: string) => {
    sendMessage(message);
  };

  return (
    <div
      className={cn(
        "fixed bottom-24 right-4 z-50 w-[380px] h-[600px] max-h-[80vh]",
        "rounded-2xl overflow-hidden shadow-2xl",
        "bg-background/80 backdrop-blur-xl border border-border/50",
        "flex flex-col",
        "transition-all duration-300 ease-out origin-bottom-right",
        isOpen
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-95 translate-y-4 pointer-events-none"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card/50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <span className="text-lg">🎓</span>
            </div>
            <div
              className={cn(
                "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
                isOnline ? "bg-green-500" : "bg-yellow-500"
              )}
            />
          </div>
          <div>
            <h3 className="font-semibold text-sm">LearnBlaze Tutor</h3>
            <p className="text-xs text-muted-foreground">
              {context.topic ? `Helping with: ${context.topic}` : "Ready to help"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {!isOnline && (
            <div className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-xs flex items-center gap-1">
              <WifiOff className="w-3 h-3" />
              Offline
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={clearHistory}
            title="Clear chat"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onMinimize}
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">👋</div>
              <h4 className="font-medium mb-1">Welcome to LearnBlaze Tutor!</h4>
              <p className="text-sm text-muted-foreground">
                I'm here to help you learn. Ask me anything or use the quick replies below.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {isLoading && <TypingIndicator />}
        </div>
      </ScrollArea>

      {/* Quick Replies */}
      {messages.length < 3 && (
        <QuickReplies
          topic={context.topic}
          onSelect={handleQuickReply}
          disabled={isLoading}
        />
      )}

      {/* Input */}
      <ChatInput
        onSend={sendMessage}
        onStop={stopGeneration}
        isLoading={isLoading}
        disabled={false}
      />
    </div>
  );
};
