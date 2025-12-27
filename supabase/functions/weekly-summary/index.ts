import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ScheduledInsight {
  insight_text: string;
  category: string | null;
  scheduled_date: string;
}

const generateEmailHtml = (
  nickname: string,
  upcomingInsights: ScheduledInsight[],
  overdueInsights: ScheduledInsight[]
) => {
  const insightsList = upcomingInsights
    .map(
      (insight) => `
        <div style="background: #f8f7f4; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
          <p style="color: #8b7355; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">
            ${insight.category || "INSIGHT"} • ${new Date(insight.scheduled_date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </p>
          <p style="font-family: Georgia, serif; font-style: italic; color: #2d2a26; margin: 0; line-height: 1.6;">
            "${insight.insight_text}"
          </p>
        </div>
      `
    )
    .join("");

  const overdueList = overdueInsights.length > 0
    ? `
      <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e2dc;">
        <h3 style="font-family: Georgia, serif; color: #c4a35a; margin: 0 0 16px 0;">
          Insights Awaiting Your Practice
        </h3>
        ${overdueInsights
          .map(
            (insight) => `
            <div style="background: #fff9e6; border-radius: 12px; padding: 16px; margin-bottom: 12px; border-left: 3px solid #c4a35a;">
              <p style="font-family: Georgia, serif; font-style: italic; color: #2d2a26; margin: 0; line-height: 1.6;">
                "${insight.insight_text}"
              </p>
            </div>
          `
          )
          .join("")}
      </div>
    `
    : "";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f5f3ef; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-family: Georgia, serif; font-style: italic; color: #2d2a26; font-size: 28px; margin: 0;">
              Your Weekly Insights
            </h1>
            <p style="color: #8b7355; margin: 8px 0 0 0;">
              Intentional thoughts for the week ahead
            </p>
          </div>

          <!-- Main Content -->
          <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <p style="color: #2d2a26; margin: 0 0 24px 0;">
              Hello ${nickname},
            </p>
            
            <p style="color: #5a5651; margin: 0 0 24px 0; line-height: 1.6;">
              Here are the insights you've scheduled to practice this week. Take a moment each day to read, reflect, and integrate these thoughts into your life.
            </p>

            ${upcomingInsights.length > 0 
              ? `
                <h3 style="font-family: Georgia, serif; color: #2d2a26; margin: 0 0 16px 0;">
                  This Week's Focus
                </h3>
                ${insightsList}
              `
              : `
                <div style="text-align: center; padding: 24px; background: #f8f7f4; border-radius: 12px;">
                  <p style="color: #8b7355; margin: 0;">
                    No insights scheduled for this week yet.<br>
                    Visit the Explore page to discover and schedule new insights.
                  </p>
                </div>
              `
            }

            ${overdueList}

            <div style="text-align: center; margin-top: 32px;">
              <p style="font-family: Georgia, serif; font-style: italic; color: #8b7355; margin: 0;">
                "Small daily improvements over time lead to stunning results."
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 24px;">
            <p style="color: #8b7355; font-size: 12px; margin: 0;">
              Thrive MT — Your journey of growth and reflection
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Weekly summary function invoked");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all users with their profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id, nickname");

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    console.log(`Found ${profiles?.length || 0} profiles to process`);

    // Get user emails from auth
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      console.error("Error fetching users:", usersError);
      throw usersError;
    }

    const userEmailMap = new Map(users.map((u) => [u.id, u.email]));

    // Calculate date ranges
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const todayStr = today.toISOString().split("T")[0];
    const nextWeekStr = nextWeek.toISOString().split("T")[0];

    let emailsSent = 0;

    for (const profile of profiles || []) {
      const userEmail = userEmailMap.get(profile.user_id);
      
      if (!userEmail) {
        console.log(`No email found for user ${profile.user_id}, skipping`);
        continue;
      }

      // Get upcoming insights for this user
      const { data: upcomingInsights, error: upcomingError } = await supabase
        .from("saved_insights")
        .select("insight_text, category, scheduled_date")
        .eq("user_id", profile.user_id)
        .gte("scheduled_date", todayStr)
        .lte("scheduled_date", nextWeekStr)
        .eq("is_practiced", false)
        .order("scheduled_date", { ascending: true });

      if (upcomingError) {
        console.error(`Error fetching insights for user ${profile.user_id}:`, upcomingError);
        continue;
      }

      // Get overdue insights
      const { data: overdueInsights, error: overdueError } = await supabase
        .from("saved_insights")
        .select("insight_text, category, scheduled_date")
        .eq("user_id", profile.user_id)
        .lt("scheduled_date", todayStr)
        .eq("is_practiced", false)
        .order("scheduled_date", { ascending: true })
        .limit(3);

      if (overdueError) {
        console.error(`Error fetching overdue insights for user ${profile.user_id}:`, overdueError);
        continue;
      }

      // Only send email if there are scheduled or overdue insights
      if ((upcomingInsights?.length || 0) === 0 && (overdueInsights?.length || 0) === 0) {
        console.log(`No insights for user ${profile.user_id}, skipping email`);
        continue;
      }

      const html = generateEmailHtml(
        profile.nickname || "Friend",
        upcomingInsights || [],
        overdueInsights || []
      );

      console.log(`Sending email to ${userEmail}`);

      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Thrive MT <onboarding@resend.dev>",
          to: [userEmail],
          subject: `Your Weekly Insights — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
          html,
        }),
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.text();
        console.error(`Error sending email to ${userEmail}:`, errorData);
        continue;
      }


      emailsSent++;
      console.log(`Email sent successfully to ${userEmail}`);
    }

    console.log(`Weekly summary complete: ${emailsSent} emails sent`);

    return new Response(
      JSON.stringify({ success: true, emailsSent }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in weekly-summary function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
