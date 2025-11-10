import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { BookOpen, LogOut, Sparkles, Trash2, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import ContentGenerator from "@/components/ContentGenerator";
import GeneratedContent from "@/components/GeneratedContent";
import { format } from "date-fns";

interface ContentItem {
  id: string;
  topic: string;
  subject: string;
  difficulty: string;
  content_type: string;
  content: string;
  created_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [contentHistory, setContentHistory] = useState<ContentItem[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTopic, setCurrentTopic] = useState<ContentItem | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);
    await fetchContentHistory(session.user.id);
    setLoading(false);
  };

  const fetchContentHistory = async (userId: string) => {
    const { data, error } = await supabase
      .from("content_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load content history",
        variant: "destructive",
      });
      return;
    }

    setContentHistory(data || []);
    generateRecommendations(data || []);
  };

  const generateRecommendations = (history: ContentItem[]) => {
    if (history.length === 0) return;

    const topics = history.map(item => item.topic.toLowerCase());
    const subjects = [...new Set(history.map(item => item.subject))];
    
    const recommendations: string[] = [];
    
    if (topics.some(t => t.includes("photosynthesis"))) {
      recommendations.push("Respiration in Plants");
    }
    if (topics.some(t => t.includes("machine learning"))) {
      recommendations.push("Supervised Learning Algorithms");
    }
    if (topics.some(t => t.includes("calculus"))) {
      recommendations.push("Advanced Integration Techniques");
    }
    
    subjects.forEach(subject => {
      if (subject === "Mathematics") {
        recommendations.push("Linear Algebra Fundamentals");
      } else if (subject === "Science") {
        recommendations.push("Cell Biology Basics");
      } else if (subject === "Computer Science") {
        recommendations.push("Data Structures and Algorithms");
      }
    });

    setRecommendations([...new Set(recommendations)].slice(0, 4));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("content_history")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete content",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Content deleted successfully",
    });

    if (user) {
      await fetchContentHistory(user.id);
    }
  };

  const handleRevisit = (item: ContentItem) => {
    setCurrentTopic(item);
    setGeneratedContent(item.content);
  };

  const handleContentGenerated = async (content: string) => {
    setGeneratedContent(content);
    if (user) {
      await fetchContentHistory(user.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">EduContent AI</h1>
                <p className="text-xs text-muted-foreground">Welcome back, {user?.email}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {!generatedContent ? (
          <>
            <div className="mb-8">
              <ContentGenerator 
                onContentGenerated={handleContentGenerated}
                isLoading={isGenerating}
                setIsLoading={setIsGenerating}
              />
            </div>

            {recommendations.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <CardTitle>Recommended Topics</CardTitle>
                  </div>
                  <CardDescription>Based on your learning history</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendations.map((topic, i) => (
                      <div
                        key={i}
                        className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() => {
                          const input = document.querySelector('input[placeholder="e.g., Photosynthesis"]') as HTMLInputElement;
                          if (input) {
                            input.value = topic;
                            input.dispatchEvent(new Event('input', { bubbles: true }));
                          }
                        }}
                      >
                        <p className="font-medium text-foreground">{topic}</p>
                        <p className="text-sm text-muted-foreground">Click to generate</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Learning History</CardTitle>
                <CardDescription>Your previously generated content</CardDescription>
              </CardHeader>
              <CardContent>
                {contentHistory.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No content yet. Generate your first learning material above!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {contentHistory.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 border border-border rounded-lg hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-1">{item.topic}</h3>
                            <div className="flex gap-2 mb-2">
                              <Badge variant="secondary">{item.subject}</Badge>
                              <Badge variant="outline">{item.difficulty}</Badge>
                              <Badge>{item.content_type}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(item.created_at), "PPp")}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRevisit(item)}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <GeneratedContent 
            content={generatedContent}
            onRegenerate={() => {
              setGeneratedContent(null);
              setCurrentTopic(null);
            }}
          />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
