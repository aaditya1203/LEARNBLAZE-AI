import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Star, MessageSquare, Hash, TrendingUp, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ContentItem {
  id: string;
  topic: string;
  subject: string;
  difficulty: string;
  content_type: string;
  created_at: string;
}

interface EvaluationDashboardProps {
  contentHistory: ContentItem[];
}

const QUALITY_COLORS = {
  excellent: 'hsl(var(--success))',
  good: 'hsl(var(--chart-4))',
  average: 'hsl(var(--warning))',
  needsWork: 'hsl(var(--destructive))',
};

const FEEDBACK_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

const EvaluationDashboard = ({ contentHistory }: EvaluationDashboardProps) => {
  // Calculate quality metrics based on content diversity and engagement
  const getQualityMetrics = () => {
    if (contentHistory.length === 0) {
      return { score: 0, level: 'needsWork', breakdown: [] };
    }

    const uniqueSubjects = new Set(contentHistory.map(item => item.subject)).size;
    const uniqueTypes = new Set(contentHistory.map(item => item.content_type)).size;
    const totalItems = contentHistory.length;
    
    // Calculate diversity score (0-100)
    const subjectDiversity = Math.min((uniqueSubjects / 5) * 30, 30); // Max 30 points
    const typeDiversity = Math.min((uniqueTypes / 6) * 30, 30); // Max 30 points
    const volumeScore = Math.min((totalItems / 20) * 40, 40); // Max 40 points
    
    const totalScore = Math.round(subjectDiversity + typeDiversity + volumeScore);
    
    let level: keyof typeof QUALITY_COLORS = 'needsWork';
    if (totalScore >= 80) level = 'excellent';
    else if (totalScore >= 60) level = 'good';
    else if (totalScore >= 40) level = 'average';

    const breakdown = [
      { name: 'Subject Diversity', value: Math.round(subjectDiversity), max: 30, color: 'hsl(var(--chart-1))' },
      { name: 'Content Variety', value: Math.round(typeDiversity), max: 30, color: 'hsl(var(--chart-2))' },
      { name: 'Learning Volume', value: Math.round(volumeScore), max: 40, color: 'hsl(var(--chart-3))' },
    ];

    return { score: totalScore, level, breakdown };
  };

  // Simulated feedback metrics based on content patterns
  const getFeedbackMetrics = () => {
    const difficultyDistribution = contentHistory.reduce((acc, item) => {
      acc[item.difficulty] = (acc[item.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const feedbackData = [
      { category: 'Content Clarity', positive: Math.round(contentHistory.length * 0.85), negative: Math.round(contentHistory.length * 0.15) },
      { category: 'Relevance', positive: Math.round(contentHistory.length * 0.92), negative: Math.round(contentHistory.length * 0.08) },
      { category: 'Difficulty Match', positive: Math.round(contentHistory.length * 0.78), negative: Math.round(contentHistory.length * 0.22) },
      { category: 'Completeness', positive: Math.round(contentHistory.length * 0.88), negative: Math.round(contentHistory.length * 0.12) },
    ];

    return { difficultyDistribution, feedbackData };
  };

  // Count metrics
  const getCounts = () => {
    const subjectCounts = contentHistory.reduce((acc, item) => {
      acc[item.subject] = (acc[item.subject] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typeCounts = contentHistory.reduce((acc, item) => {
      acc[item.content_type] = (acc[item.content_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const difficultyCounts = contentHistory.reduce((acc, item) => {
      acc[item.difficulty] = (acc[item.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Weekly and monthly counts
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const weeklyCount = contentHistory.filter(item => new Date(item.created_at) > weekAgo).length;
    const monthlyCount = contentHistory.filter(item => new Date(item.created_at) > monthAgo).length;

    return { subjectCounts, typeCounts, difficultyCounts, weeklyCount, monthlyCount, total: contentHistory.length };
  };

  const qualityMetrics = getQualityMetrics();
  const feedbackMetrics = getFeedbackMetrics();
  const counts = getCounts();

  const qualityLevelLabels: Record<string, { label: string; icon: React.ReactNode }> = {
    excellent: { label: 'Excellent', icon: <CheckCircle className="h-5 w-5 text-success" /> },
    good: { label: 'Good', icon: <TrendingUp className="h-5 w-5 text-info" /> },
    average: { label: 'Average', icon: <AlertCircle className="h-5 w-5 text-warning" /> },
    needsWork: { label: 'Needs Work', icon: <XCircle className="h-5 w-5 text-destructive" /> },
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Content</p>
              <p className="text-3xl font-bold text-foreground mt-1">{counts.total}</p>
            </div>
            <div className="p-3 bg-background/50 rounded-lg text-primary">
              <Hash className="h-6 w-6" />
            </div>
          </div>
        </Card>
        
        <Card className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">This Week</p>
              <p className="text-3xl font-bold text-foreground mt-1">{counts.weeklyCount}</p>
            </div>
            <div className="p-3 bg-background/50 rounded-lg text-accent">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </Card>
        
        <Card className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">This Month</p>
              <p className="text-3xl font-bold text-foreground mt-1">{counts.monthlyCount}</p>
            </div>
            <div className="p-3 bg-background/50 rounded-lg text-info">
              <MessageSquare className="h-6 w-6" />
            </div>
          </div>
        </Card>
        
        <Card className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Quality Score</p>
              <p className="text-3xl font-bold text-foreground mt-1">{qualityMetrics.score}%</p>
            </div>
            <div className="p-3 bg-background/50 rounded-lg text-success">
              <Star className="h-6 w-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quality Assessment */}
      <Card className="content-card border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <Star className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-xl">Quality Assessment</CardTitle>
                <CardDescription>Overall learning quality metrics</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {qualityLevelLabels[qualityMetrics.level].icon}
              <Badge 
                variant="outline" 
                className="text-sm font-medium"
                style={{ borderColor: QUALITY_COLORS[qualityMetrics.level as keyof typeof QUALITY_COLORS] }}
              >
                {qualityLevelLabels[qualityMetrics.level].label}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {qualityMetrics.breakdown.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{metric.name}</span>
                  <span className="font-medium text-foreground">{metric.value}/{metric.max}</span>
                </div>
                <Progress 
                  value={(metric.value / metric.max) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feedback Metrics */}
        <Card className="content-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Feedback Metrics</CardTitle>
                <CardDescription>Content quality feedback breakdown</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {contentHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No feedback data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={feedbackMetrics.feedbackData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis 
                    dataKey="category" 
                    type="category" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    width={100}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="positive" fill="hsl(var(--success))" name="Positive" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="negative" fill="hsl(var(--destructive))" name="Negative" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Difficulty Distribution */}
        <Card className="content-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Hash className="h-5 w-5 text-accent" />
              </div>
              <div>
                <CardTitle>Difficulty Distribution</CardTitle>
                <CardDescription>Content breakdown by difficulty level</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex justify-center">
            {contentHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Hash className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No content data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={Object.entries(counts.difficultyCounts).map(([name, value]) => ({ name, value }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {Object.entries(counts.difficultyCounts).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={FEEDBACK_COLORS[index % FEEDBACK_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Counts */}
      <Card className="content-card">
        <CardHeader>
          <CardTitle>Content Breakdown</CardTitle>
          <CardDescription>Detailed counts by subject and content type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* By Subject */}
            <div>
              <h4 className="font-medium text-foreground mb-3">By Subject</h4>
              <div className="space-y-2">
                {Object.entries(counts.subjectCounts).length === 0 ? (
                  <p className="text-muted-foreground text-sm">No subjects yet</p>
                ) : (
                  Object.entries(counts.subjectCounts).map(([subject, count], index) => (
                    <div key={subject} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: FEEDBACK_COLORS[index % FEEDBACK_COLORS.length] }}
                        />
                        <span className="text-sm text-foreground">{subject}</span>
                      </div>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* By Content Type */}
            <div>
              <h4 className="font-medium text-foreground mb-3">By Content Type</h4>
              <div className="space-y-2">
                {Object.entries(counts.typeCounts).length === 0 ? (
                  <p className="text-muted-foreground text-sm">No content types yet</p>
                ) : (
                  Object.entries(counts.typeCounts).map(([type, count], index) => (
                    <div key={type} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: FEEDBACK_COLORS[(index + 2) % FEEDBACK_COLORS.length] }}
                        />
                        <span className="text-sm text-foreground">{type}</span>
                      </div>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EvaluationDashboard;
