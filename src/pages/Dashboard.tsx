import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { BookOpen, LogOut, Sparkles, Trash2, RefreshCw, TrendingUp, Clock, Target, Award, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import ContentGenerator from "@/components/ContentGenerator";
import GeneratedContent from "@/components/GeneratedContent";
import LearningAnalytics from "@/components/analytics/LearningAnalytics";
import { ThemeToggle } from "@/components/ThemeToggle";
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

  const stats = [
    { icon: BookOpen, label: "Total Topics", value: contentHistory.length, color: "text-primary" },
    { icon: Target, label: "This Week", value: contentHistory.filter(item => 
      new Date(item.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length, color: "text-accent" },
    { icon: Award, label: "Subjects", value: new Set(contentHistory.map(item => item.subject)).size, color: "text-success" },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-primary rounded-xl shadow-md">
                <BookOpen className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  EduContent AI
                </h1>
                <p className="text-sm text-muted-foreground">Welcome back, {user?.email?.split('@')[0]}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {!generatedContent ? (
          <Tabs defaultValue="home" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
              <TabsTrigger value="home">Home</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="home" className="space-y-8">
              {/* Stats Overview */}
              {contentHistory.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-fade-in">
                {stats.map((stat, i) => (
                  <div key={i} className="stat-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                        <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                      </div>
                      <div className={`p-3 bg-background/50 rounded-lg ${stat.color}`}>
                        <stat.icon className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

              {/* Content Generator */}
              <div className="mb-8">
                <ContentGenerator 
                  onContentGenerated={handleContentGenerated}
                  isLoading={isGenerating}
                  setIsLoading={setIsGenerating}
                />
              </div>

              {/* AI Recommendations */}
              {recommendations.length > 0 && (
              <Card className="mb-8 content-card animate-fade-in border-primary/20">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-primary rounded-lg">
                      <Sparkles className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">AI Recommended Topics</CardTitle>
                      <CardDescription>Personalized based on your learning journey</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendations.map((topic, i) => (
                      <div
                        key={i}
                        className="interactive-card group"
                        onClick={() => {
                          const input = document.querySelector('input[placeholder="e.g., Photosynthesis"]') as HTMLInputElement;
                          if (input) {
                            input.value = topic;
                            input.dispatchEvent(new Event('input', { bubbles: true }));
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                            <TrendingUp className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {topic}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">Click to generate content</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                </Card>
              )}

              {/* Learning History */}
              <Card className="content-card">
                <CardHeader className="bg-gradient-to-r from-secondary/50 to-secondary/30 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Learning History</CardTitle>
                      <CardDescription>Your educational content library</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {contentHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="p-4 bg-muted/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground text-lg mb-2">No content yet</p>
                      <p className="text-sm text-muted-foreground">Generate your first learning material above!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {contentHistory.map((item) => (
                        <div
                          key={item.id}
                          className="interactive-card"
                        >
                          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                                {item.topic}
                              </h3>
                              <div className="flex flex-wrap gap-2 mb-3">
                                <Badge variant="secondary" className="font-medium">
                                  {item.subject}
                                </Badge>
                                <Badge variant="outline" className="font-medium">
                                  {item.difficulty}
                                </Badge>
                                <Badge className="bg-gradient-primary text-primary-foreground font-medium">
                                  {item.content_type}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{format(new Date(item.created_at), "PPp")}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRevisit(item)}
                                className="hover:bg-primary/10 hover:text-primary hover:border-primary/50"
                              >
                                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(item.id)}
                                className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <LearningAnalytics contentHistory={contentHistory} />
            </TabsContent>

          </Tabs>
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
