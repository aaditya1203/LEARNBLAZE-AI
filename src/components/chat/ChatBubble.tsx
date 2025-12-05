import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatWindow } from "./ChatWindow";

export const ChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleToggle = () => {
    if (isMinimized) {
      setIsMinimized(false);
      setIsOpen(true);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    setIsOpen(false);
  };

  return (
    <>
      <ChatWindow
        isOpen={isOpen && !isMinimized}
        onClose={handleClose}
        onMinimize={handleMinimize}
      />

      {/* Floating Bubble */}
      <button
        onClick={handleToggle}
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "w-14 h-14 rounded-full",
          "bg-gradient-to-br from-primary to-primary/80",
          "shadow-lg shadow-primary/25",
          "flex items-center justify-center",
          "transition-all duration-300 ease-out",
          "hover:scale-110 hover:shadow-xl hover:shadow-primary/30",
          "active:scale-95",
          "group"
        )}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        <div
          className={cn(
            "transition-transform duration-300",
            isOpen ? "rotate-0" : "rotate-0"
          )}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-primary-foreground" />
          ) : (
            <MessageCircle className="w-6 h-6 text-primary-foreground" />
          )}
        </div>

        {/* Pulse animation when minimized */}
        {isMinimized && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-accent" />
          </span>
        )}

        {/* Tooltip */}
        <span
          className={cn(
            "absolute right-full mr-3 px-3 py-1.5 rounded-lg",
            "bg-card text-card-foreground text-sm font-medium",
            "shadow-lg border border-border/50",
            "opacity-0 translate-x-2 pointer-events-none",
            "group-hover:opacity-100 group-hover:translate-x-0",
            "transition-all duration-200 whitespace-nowrap"
          )}
        >
          {isOpen ? "Close" : isMinimized ? "Continue chat" : "AI Tutor"}
        </span>
      </button>
    </>
  );
};
