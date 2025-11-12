import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import mermaid from "mermaid";
import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";

interface ContentMarkdownProps {
  content: string;
}

const ContentMarkdown = ({ content }: ContentMarkdownProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: "default",
      securityLevel: "loose",
      fontFamily: "inherit",
    });

    if (containerRef.current) {
      const mermaidElements = containerRef.current.querySelectorAll(".mermaid");
      mermaidElements.forEach((element, index) => {
        const id = `mermaid-${Date.now()}-${index}`;
        element.setAttribute("id", id);
      });
      mermaid.run();
    }
  }, [content]);

  // Process content to detect and wrap mermaid diagrams, MCQs, and special formats
  const processContent = (text: string) => {
    let processedText = text;
    
    // Handle mermaid diagrams
    const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
    processedText = processedText.replace(mermaidRegex, (match, diagram) => {
      return `<div class="mermaid my-6">\n${diagram}\n</div>`;
    });
    
    // Enhance MCQ format - detect questions with options
    processedText = processedText.replace(
      /(\*\*Question \d+:?\*\*.*?\n)((?:[A-D]\)|[A-D]\.)[^\n]+\n?)+/g,
      (match) => {
        return `<div class="mcq-question">\n${match}\n</div>`;
      }
    );
    
    // Enhance answer sections
    processedText = processedText.replace(
      /(\*\*Answer:?\*\*.*)/gi,
      '<div class="answer-section">$1</div>'
    );
    
    return processedText;
  };

  const processedContent = processContent(content);

  return (
    <div ref={containerRef} className="prose prose-slate max-w-none dark:prose-invert">
      <style>{`
        .mcq-question {
          background: linear-gradient(135deg, hsl(var(--primary) / 0.05), hsl(var(--accent) / 0.05));
          border-left: 4px solid hsl(var(--primary));
          padding: 1.5rem;
          margin: 1.5rem 0;
          border-radius: 0.75rem;
          box-shadow: 0 2px 8px hsl(var(--foreground) / 0.05);
        }
        .answer-section {
          background: hsl(var(--success) / 0.1);
          border-left: 4px solid hsl(var(--success));
          padding: 1rem 1.5rem;
          margin: 1rem 0;
          border-radius: 0.5rem;
          font-weight: 500;
        }
        .prose h2 {
          background: linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .prose blockquote {
          background: hsl(var(--muted));
          border-radius: 0.5rem;
          padding: 1rem 1.5rem;
        }
      `}</style>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold text-foreground mb-4 mt-6 pb-2 border-b border-border">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-semibold text-foreground mb-3 mt-5">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-foreground leading-relaxed mb-4">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-2 mb-4 text-foreground">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-2 mb-4 text-foreground">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="ml-4 text-foreground">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">
              {children}
            </blockquote>
          ),
          code: ({ className, children }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-accent">
                  {children}
                </code>
              );
            }
            return (
              <code className={`${className} block bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono`}>
                {children}
              </code>
            );
          },
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border border-border rounded-lg">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="bg-primary/10 border border-border px-4 py-2 text-left font-semibold text-foreground">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-4 py-2 text-foreground">
              {children}
            </td>
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

export default ContentMarkdown;
