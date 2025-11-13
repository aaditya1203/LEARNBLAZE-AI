import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import ContentGenerator from "@/components/ContentGenerator";
import GeneratedContent from "@/components/GeneratedContent";

const Index = () => {
  const navigate = useNavigate();
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">LearnBlaze AI</h1>
                <p className="text-xs text-muted-foreground">Personalized Learning Content Generator</p>
              </div>
            </div>
            <Button onClick={() => navigate("/auth")} variant="default">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            AI-Powered Education
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
            Empower Your Mind—<br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">Smarter Content, Brighter Futures</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Generate personalized notes, quizzes, explanations, and summaries tailored to your learning level and subject matter.
          </p>
        </div>

        {/* Content Generator */}
        <div className="mb-8">
          <ContentGenerator 
            onContentGenerated={setGeneratedContent}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        </div>

        {/* Generated Content Display */}
        {generatedContent && (
          <GeneratedContent 
            content={generatedContent}
            onRegenerate={() => setGeneratedContent(null)}
          />
        )}

        {/* Features Section */}
        {!generatedContent && (
          <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Study Notes", desc: "Comprehensive notes with key concepts", icon: "📝" },
              { title: "Interactive Quizzes", desc: "Test your knowledge with MCQs", icon: "❓" },
              { title: "Clear Explanations", desc: "Step-by-step concept breakdowns", icon: "💡" },
              { title: "Smart Summaries", desc: "Concise topic overviews", icon: "📊" }
            ].map((feature, i) => (
              <div key={i} className="p-6 bg-card rounded-xl border border-border hover:shadow-md transition-all">
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;