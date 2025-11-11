import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Calendar, Target } from "lucide-react";
import { format, subDays, startOfDay, differenceInDays } from "date-fns";

interface ContentItem {
  id: string;
  topic: string;
  subject: string;
  difficulty: string;
  content_type: string;
  created_at: string;
}

interface LearningAnalyticsProps {
  contentHistory: ContentItem[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))', 'hsl(var(--success))', 'hsl(var(--warning))'];

const LearningAnalytics = ({ contentHistory }: LearningAnalyticsProps) => {
  // Topics studied over time (last 7 days)
  const getTopicsOverTime = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return format(date, 'MMM dd');
    });

    const topicCounts = last7Days.map(dateStr => {
      const count = contentHistory.filter(item => {
        const itemDate = format(new Date(item.created_at), 'MMM dd');
        return itemDate === dateStr;
      }).length;
      return { date: dateStr, topics: count };
    });

    return topicCounts;
  };

  // Subject breakdown
  const getSubjectBreakdown = () => {
    const subjectCounts = contentHistory.reduce((acc, item) => {
      acc[item.subject] = (acc[item.subject] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(subjectCounts).map(([name, value]) => ({ name, value }));
  };

  // Study streak calculation
  const getStudyStreak = () => {
    if (contentHistory.length === 0) return 0;

    const dates = contentHistory
      .map(item => startOfDay(new Date(item.created_at)).getTime())
      .sort((a, b) => b - a);

    const uniqueDates = [...new Set(dates)];
    let streak = 0;
    let currentDate = startOfDay(new Date()).getTime();

    for (const date of uniqueDates) {
      const diff = differenceInDays(currentDate, date);
      if (diff === 0 || diff === 1) {
        streak++;
        currentDate = date;
      } else {
        break;
      }
    }

    return streak;
  };

  // Content type distribution
  const getContentTypeDistribution = () => {
    const typeCounts = contentHistory.reduce((acc, item) => {
      acc[item.content_type] = (acc[item.content_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCounts).map(([name, count]) => ({ name, count }));
  };

  const topicsOverTime = getTopicsOverTime();
  const subjectBreakdown = getSubjectBreakdown();
  const studyStreak = getStudyStreak();
  const contentTypeDistribution = getContentTypeDistribution();

  return (
    <div className="space-y-6">
      {/* Streak Card */}
      <Card className="content-card border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <Calendar className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-xl">Study Streak</CardTitle>
                <CardDescription>Consecutive days of learning</CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {studyStreak}
              </div>
              <p className="text-sm text-muted-foreground">days</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topics Over Time */}
        <Card className="content-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Learning Progress</CardTitle>
                <CardDescription>Topics studied in the last 7 days</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={topicsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="topics" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subject Breakdown */}
        <Card className="content-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Target className="h-5 w-5 text-accent" />
              </div>
              <div>
                <CardTitle>Subject Distribution</CardTitle>
                <CardDescription>Topics breakdown by subject</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={subjectBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                >
                  {subjectBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
          </CardContent>
        </Card>

        {/* Content Type Distribution */}
        <Card className="content-card lg:col-span-2">
          <CardHeader>
            <CardTitle>Content Type Usage</CardTitle>
            <CardDescription>Distribution of generated content types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={contentTypeDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--accent))"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LearningAnalytics;
