import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Lightbulb, HelpCircle, Brain, FileQuestion } from "lucide-react";

interface QuickRepliesProps {
  topic?: string;
  onSelect: (message: string) => void;
  disabled?: boolean;
}

export const QuickReplies = memo(({ topic, onSelect, disabled }: QuickRepliesProps) => {
  const quickReplies = [
    {
      icon: Lightbulb,
      label: "Explain",
      message: topic ? `Explain ${topic} in simple terms` : "Explain this concept in simple terms",
    },
    {
      icon: HelpCircle,
      label: "Example",
      message: topic ? `Give me a practical example of ${topic}` : "Give me a practical example",
    },
    {
      icon: Brain,
      label: "Quiz me",
      message: topic ? `Quiz me on ${topic}` : "Quiz me on what we've discussed",
    },
    {
      icon: FileQuestion,
      label: "Summary",
      message: topic ? `Summarize the key points of ${topic}` : "Summarize what we've discussed",
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 p-2">
      {quickReplies.map((reply) => (
        <Button
          key={reply.label}
          variant="outline"
          size="sm"
          onClick={() => onSelect(reply.message)}
          disabled={disabled}
          className="h-8 text-xs bg-background/50 backdrop-blur-sm border-border/50 hover:bg-accent/50 transition-all duration-200"
        >
          <reply.icon className="w-3 h-3 mr-1.5" />
          {reply.label}
        </Button>
      ))}
    </div>
  );
});

QuickReplies.displayName = "QuickReplies";
