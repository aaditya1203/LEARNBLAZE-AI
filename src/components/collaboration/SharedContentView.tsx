import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Users, Eye } from "lucide-react";
import { format } from "date-fns";

interface SharedContent {
  id: string;
  content_id: string;
  shared_by: string;
  created_at: string;
  content: {
    topic: string;
    subject: string;
    difficulty: string;
    content_type: string;
    content: string;
  };
  sharer_profile: {
    email: string;
  };
}

interface SharedContentViewProps {
  onViewContent: (content: string, topic: string) => void;
}

const SharedContentView = ({ onViewContent }: SharedContentViewProps) => {
  const [sharedContent, setSharedContent] = useState<SharedContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSharedContent();
  }, []);

  const fetchSharedContent = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("shared_content")
        .select(`
          id,
          content_id,
          shared_by,
          created_at,
          content:content_history!shared_content_content_id_fkey(
            topic,
            subject,
            difficulty,
            content_type,
            content
          ),
          sharer_profile:profiles!shared_content_shared_by_fkey(email)
        `)
        .eq("shared_with", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSharedContent(data as any);
    } catch (error) {
      console.error("Error fetching shared content:", error);
      toast({
        title: "Error",
        description: "Failed to load shared content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="content-card">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Loading shared content...</p>
        </CardContent>
      </Card>
    );
  }

  if (sharedContent.length === 0) {
    return (
      <Card className="content-card">
        <CardHeader className="bg-gradient-to-r from-accent/10 to-accent/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Users className="h-5 w-5 text-accent" />
            </div>
            <div>
              <CardTitle className="text-xl">Shared With Me</CardTitle>
              <CardDescription>Content shared by other users</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No shared content yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="content-card">
      <CardHeader className="bg-gradient-to-r from-accent/10 to-accent/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-lg">
            <Users className="h-5 w-5 text-accent" />
          </div>
          <div>
            <CardTitle className="text-xl">Shared With Me</CardTitle>
            <CardDescription>Content shared by other users</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {sharedContent.map((item) => (
            <div key={item.id} className="interactive-card">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-foreground mb-2">
                    {item.content.topic}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="secondary" className="font-medium">
                      {item.content.subject}
                    </Badge>
                    <Badge variant="outline" className="font-medium">
                      {item.content.difficulty}
                    </Badge>
                    <Badge className="bg-gradient-primary text-primary-foreground font-medium">
                      {item.content.content_type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Shared by {item.sharer_profile.email} on {format(new Date(item.created_at), "PPp")}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewContent(item.content.content, item.content.topic)}
                  className="hover:bg-accent/10 hover:text-accent hover:border-accent/50"
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SharedContentView;
