import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ContentGeneratorProps {
  onContentGenerated: (content: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const ContentGenerator = ({ onContentGenerated, isLoading, setIsLoading }: ContentGeneratorProps) => {
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("science");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [outputType, setOutputType] = useState("notes");

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { topic, subject, difficulty, outputType }
      });

      if (error) {
        console.error('Error generating content:', error);
        toast.error("Failed to generate content. Please try again.");
        return;
      }

      if (data?.content) {
        onContentGenerated(data.content);
        toast.success("Content generated successfully!");
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-border">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          Generate Educational Content
        </CardTitle>
        <CardDescription>
          Enter your topic and preferences to create personalized learning materials
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="topic">Topic or Question</Label>
          <Input
            id="topic"
            placeholder="e.g., Photosynthesis, World War II, Quadratic Equations..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="border-input"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger id="subject">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="science">Science</SelectItem>
                <SelectItem value="math">Mathematics</SelectItem>
                <SelectItem value="history">History</SelectItem>
                <SelectItem value="computer-science">Computer Science</SelectItem>
                <SelectItem value="language">Language Arts</SelectItem>
                <SelectItem value="geography">Geography</SelectItem>
                <SelectItem value="physics">Physics</SelectItem>
                <SelectItem value="chemistry">Chemistry</SelectItem>
                <SelectItem value="biology">Biology</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger id="difficulty">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="output">Output Type</Label>
            <Select value={outputType} onValueChange={setOutputType}>
              <SelectTrigger id="output">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="notes">Study Notes</SelectItem>
                <SelectItem value="quiz">Quiz (MCQ)</SelectItem>
                <SelectItem value="summary">Summary</SelectItem>
                <SelectItem value="explanation">Explanation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={handleGenerate} 
          disabled={isLoading}
          className="w-full bg-gradient-accent hover:opacity-90 text-accent-foreground font-semibold py-6 text-lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating Content...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Content
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ContentGenerator;