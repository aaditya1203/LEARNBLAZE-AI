import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";
import { Resend } from "https://esm.sh/resend@4.0.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WeeklyStats {
  totalTopics: number;
  subjectsBreakdown: { [key: string]: number };
  contentTypes: { [key: string]: number };
  weeklyStreak: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all users with profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email");

    if (profilesError) throw profilesError;

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ message: "No users to send reports to" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get date range for the last week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const emailPromises = profiles.map(async (profile) => {
      if (!profile.email) return null;

      // Get user's content history for the last week
      const { data: weeklyContent, error: contentError } = await supabase
        .from("content_history")
        .select("*")
        .eq("user_id", profile.id)
        .gte("created_at", oneWeekAgo.toISOString())
        .order("created_at", { ascending: false });

      if (contentError) {
        console.error(`Error fetching content for user ${profile.id}:`, contentError);
        return null;
      }

      if (!weeklyContent || weeklyContent.length === 0) {
        // Skip users with no activity this week
        return null;
      }

      // Calculate statistics
      const stats: WeeklyStats = {
        totalTopics: weeklyContent.length,
        subjectsBreakdown: {},
        contentTypes: {},
        weeklyStreak: 0,
      };

      weeklyContent.forEach((item) => {
        stats.subjectsBreakdown[item.subject] =
          (stats.subjectsBreakdown[item.subject] || 0) + 1;
        stats.contentTypes[item.content_type] =
          (stats.contentTypes[item.content_type] || 0) + 1;
      });

      // Calculate streak
      const { data: allContent } = await supabase
        .from("content_history")
        .select("created_at")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false });

      if (allContent) {
        let currentStreak = 0;
        let lastDate: Date | null = null;

        for (const item of allContent) {
          const itemDate = new Date(item.created_at);
          itemDate.setHours(0, 0, 0, 0);

          if (!lastDate) {
            lastDate = itemDate;
            currentStreak = 1;
          } else {
            const dayDiff = Math.floor(
              (lastDate.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (dayDiff === 1) {
              currentStreak++;
              lastDate = itemDate;
            } else if (dayDiff > 1) {
              break;
            }
          }
        }
        stats.weeklyStreak = currentStreak;
      }

      // Generate email HTML
      const subjectsHtml = Object.entries(stats.subjectsBreakdown)
        .map(([subject, count]) => `<li><strong>${subject}:</strong> ${count} topics</li>`)
        .join("");

      const contentTypesHtml = Object.entries(stats.contentTypes)
        .map(([type, count]) => `<li><strong>${type}:</strong> ${count} items</li>`)
        .join("");

      const emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #3b82f6, #4a90e2); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .stat-box { background: white; border-left: 4px solid #3b82f6; padding: 15px; margin: 15px 0; border-radius: 5px; }
              .stat-number { font-size: 2em; font-weight: bold; color: #3b82f6; }
              ul { list-style-type: none; padding-left: 0; }
              li { padding: 5px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9em; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📚 Your Weekly Learning Report</h1>
                <p>Keep up the great work!</p>
              </div>
              <div class="content">
                <div class="stat-box">
                  <h2>🎯 Topics Studied This Week</h2>
                  <div class="stat-number">${stats.totalTopics}</div>
                </div>
                
                <div class="stat-box">
                  <h2>🔥 Current Study Streak</h2>
                  <div class="stat-number">${stats.weeklyStreak} days</div>
                </div>
                
                <div class="stat-box">
                  <h2>📖 Subjects Breakdown</h2>
                  <ul>${subjectsHtml}</ul>
                </div>
                
                <div class="stat-box">
                  <h2>📝 Content Types</h2>
                  <ul>${contentTypesHtml}</ul>
                </div>
                
                <p style="margin-top: 30px; text-align: center;">
                  <a href="${Deno.env.get("VITE_SUPABASE_URL")}" 
                     style="background: linear-gradient(135deg, #3b82f6, #4a90e2); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Continue Learning
                  </a>
                </p>
              </div>
              <div class="footer">
                <p>This is your weekly learning summary from EduContent AI</p>
                <p>Keep learning, keep growing! 🌱</p>
              </div>
            </div>
          </body>
        </html>
      `;

      // Send email
      try {
        const emailResponse = await resend.emails.send({
          from: "EduContent AI <onboarding@resend.dev>",
          to: [profile.email],
          subject: `📊 Your Weekly Learning Report - ${stats.totalTopics} Topics This Week!`,
          html: emailHtml,
        });

        console.log(`Email sent to ${profile.email}:`, emailResponse);
        return emailResponse;
      } catch (emailError) {
        console.error(`Failed to send email to ${profile.email}:`, emailError);
        return null;
      }
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter((r) => r !== null).length;

    return new Response(
      JSON.stringify({
        message: `Weekly reports sent to ${successCount} users`,
        results,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-weekly-report function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
