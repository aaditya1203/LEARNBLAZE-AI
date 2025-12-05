import { memo } from "react";
import { User, Bot, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatMessage as ChatMessageType } from "@/lib/chatIndexedDB";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage = memo(({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 animate-fade-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground"
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 backdrop-blur-md",
          isUser
            ? "bg-primary/90 text-primary-foreground rounded-tr-sm"
            : "bg-card/80 border border-border/50 text-card-foreground rounded-tl-sm"
        )}
      >
        {message.fileAttachment && (
          <div className="flex items-center gap-2 mb-2 p-2 rounded-lg bg-background/50 text-sm">
            <FileText className="w-4 h-4" />
            <span className="truncate">{message.fileAttachment.name}</span>
          </div>
        )}

        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              pre: ({ children }) => (
                <pre className="bg-background/50 rounded-lg p-3 overflow-x-auto text-xs">
                  {children}
                </pre>
              ),
              code: ({ children, className }) => {
                const isInline = !className;
                return isInline ? (
                  <code className="bg-background/50 px-1.5 py-0.5 rounded text-xs">
                    {children}
                  </code>
                ) : (
                  <code className={className}>{children}</code>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        <div
          className={cn(
            "text-[10px] mt-1 opacity-60",
            isUser ? "text-right" : "text-left"
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
});

ChatMessage.displayName = "ChatMessage";
