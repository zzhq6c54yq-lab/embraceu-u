import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[generate-insights] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERROR", "No authorization header");
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify the user from the JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      logStep("ERROR", "Auth failed");
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    const { period_days = 30 } = await req.json().catch(() => ({}));
    logStep("Generating insights", { userId: user.id, period_days });

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period_days);
    const startDateStr = startDate.toISOString().split("T")[0];

    // Fetch user data for analysis
    const [moodsRes, ritualsRes, gratitudeRes, patternsRes, profileRes] = await Promise.all([
      supabase
        .from("mood_entries")
        .select("mood, note, recorded_at, created_at")
        .eq("user_id", user.id)
        .gte("recorded_at", startDateStr)
        .order("recorded_at", { ascending: false }),
      supabase
        .from("rituals_completed")
        .select("ritual_type, duration_seconds, completed_at")
        .eq("user_id", user.id)
        .gte("completed_at", startDateStr),
      supabase
        .from("gratitude_entries")
        .select("created_at")
        .eq("user_id", user.id)
        .gte("created_at", startDate.toISOString()),
      supabase
        .from("user_patterns")
        .select("pattern_name, is_released, released_at")
        .eq("user_id", user.id),
      supabase
        .from("profiles")
        .select("current_streak, longest_streak, total_rituals_completed")
        .eq("user_id", user.id)
        .single(),
    ]);

    const moods = moodsRes.data || [];
    const rituals = ritualsRes.data || [];
    const gratitudes = gratitudeRes.data || [];
    const patterns = patternsRes.data || [];
    const profile = profileRes.data;

    logStep("Data fetched", { 
      moods: moods.length, 
      rituals: rituals.length, 
      gratitudes: gratitudes.length,
      patterns: patterns.length 
    });

    // Generate rule-based insights first
    const insights: string[] = [];

    // Check if this is a new user with no data
    const hasNoData = moods.length === 0 && rituals.length === 0 && gratitudes.length === 0;
    const hasLimitedData = moods.length < 3 && rituals.length < 3 && gratitudes.length < 3;

    if (hasNoData) {
      // Onboarding insights for brand new users
      insights.push(`🌟 Welcome to your growth journey! Let's build some data for personalized insights.`);
      insights.push(`📝 Start by logging your first mood – tap the mood tracker to begin.`);
      insights.push(`🧘 Try a 2-minute breathing ritual – it's the perfect first step to mindfulness.`);
      insights.push(`💛 Add a gratitude entry – what's one thing you appreciate today?`);
      insights.push(`🎯 Consistency is key: just 2 minutes daily can transform your wellbeing.`);
    } else if (hasLimitedData) {
      // Encouragement for users with some data
      insights.push(`🌱 Great start! You're building the foundation for personalized insights.`);
      
      if (moods.length === 0) {
        insights.push(`📝 Log your first mood to start tracking emotional patterns.`);
      } else if (moods.length < 5) {
        insights.push(`📊 ${moods.length} mood${moods.length > 1 ? 's' : ''} logged – log 5 to unlock pattern analysis!`);
      }
      
      if (rituals.length === 0) {
        insights.push(`🧘 Complete your first ritual – just 2 minutes of breathing can shift your state.`);
      }
      
      if (gratitudes.length === 0) {
        insights.push(`💛 Add your first gratitude – research shows this rewires your brain for positivity.`);
      }
    } else {
      // Streak insights
      if (profile?.current_streak && profile.current_streak >= 7) {
        insights.push(`🔥 Amazing! You're on a ${profile.current_streak}-day streak. Keep the momentum going!`);
      } else if (profile?.current_streak && profile.current_streak >= 3) {
        insights.push(`🌱 ${profile.current_streak}-day streak building – consistency creates transformation.`);
      }

      // Mood analysis
      if (moods.length > 0) {
        const moodMap: Record<string, number> = {};
        moods.forEach(m => {
          moodMap[m.mood] = (moodMap[m.mood] || 0) + 1;
        });
        const topMood = Object.entries(moodMap).sort((a, b) => b[1] - a[1])[0];
        if (topMood) {
          insights.push(`📊 Your most common mood this month: ${topMood[0]} (${topMood[1]} entries)`);
        }
      }

      // Ritual insights
      if (rituals.length > 0) {
        const ritualTypes: Record<string, number> = {};
        rituals.forEach(r => {
          ritualTypes[r.ritual_type] = (ritualTypes[r.ritual_type] || 0) + 1;
        });
        const topRitual = Object.entries(ritualTypes).sort((a, b) => b[1] - a[1])[0];
        if (topRitual) {
          insights.push(`🧘 You've completed ${rituals.length} rituals – ${topRitual[0]} is your go-to practice.`);
        }
      }

      // Gratitude insights
      if (gratitudes.length >= 10) {
        insights.push(`💛 ${gratitudes.length} gratitude entries! Research shows this builds lasting positivity.`);
      } else if (gratitudes.length > 0) {
        insights.push(`💛 ${gratitudes.length} gratitude moments captured. Each one rewires your brain for joy.`);
      }

      // Pattern insights
      const releasedPatterns = patterns.filter(p => p.is_released);
      const activePatterns = patterns.filter(p => !p.is_released);
      if (releasedPatterns.length > 0) {
        insights.push(`🦋 You've released ${releasedPatterns.length} limiting pattern${releasedPatterns.length > 1 ? 's' : ''} – that's real growth.`);
      }
      if (activePatterns.length > 0) {
        insights.push(`🎯 ${activePatterns.length} pattern${activePatterns.length > 1 ? 's' : ''} still in progress. Awareness is the first step to change.`);
      }

      // Time-based insights
      const now = new Date();
      const hour = now.getHours();
      if (hour < 12) {
        insights.push(`🌅 Morning is prime time for transformation. Today is full of possibility.`);
      } else if (hour < 18) {
        insights.push(`☀️ Afternoon check-in: How are you honoring your growth today?`);
      }
    }

    // Fallback if still no insights
    if (insights.length === 0) {
      insights.push(`🌟 Start your journey today – every small step creates meaningful change.`);
      insights.push(`💡 Tip: Log your mood daily to unlock personalized patterns and insights.`);
    }

    // Pattern insights (outside the else block so they show even with limited data)
    const releasedPatterns = patterns.filter(p => p.is_released);
    const activePatterns = patterns.filter(p => !p.is_released);

    // Try to enhance with AI if available (Lovable AI Gateway)
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (lovableApiKey && moods.length >= 5) {
      try {
        logStep("Calling Lovable AI for enhanced insights");
        
        // Prepare anonymized summary for AI
        const summary = {
          mood_count: moods.length,
          top_moods: Object.entries(moods.reduce((acc, m) => {
            acc[m.mood] = (acc[m.mood] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)).sort((a, b) => b[1] - a[1]).slice(0, 3),
          ritual_count: rituals.length,
          ritual_types: [...new Set(rituals.map(r => r.ritual_type))],
          gratitude_count: gratitudes.length,
          patterns_released: releasedPatterns.length,
          current_streak: profile?.current_streak || 0,
        };

        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content: `You are a compassionate wellness coach. Generate 2-3 brief, actionable insights based on user activity data. Be warm, encouraging, and specific. Use emojis sparingly. Each insight should be 1-2 sentences max. Focus on patterns, achievements, and gentle suggestions.`
              },
              {
                role: "user",
                content: `Here's my wellness activity summary for the past ${period_days} days: ${JSON.stringify(summary)}. Generate personalized insights.`
              }
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const aiContent = aiData.choices?.[0]?.message?.content;
          if (aiContent) {
            // Add AI insights at the beginning
            const aiInsights = aiContent.split('\n').filter((line: string) => line.trim().length > 0).slice(0, 3);
            insights.unshift(...aiInsights);
            logStep("AI insights added", { count: aiInsights.length });
          }
        }
      } catch (aiError) {
        logStep("AI enhancement failed, using rule-based only", { error: String(aiError) });
      }
    }

    // Limit to 5 most relevant insights
    const finalInsights = insights.slice(0, 5);

    logStep("Insights generated", { count: finalInsights.length });

    return new Response(
      JSON.stringify({ 
        insights: finalInsights,
        generated_at: new Date().toISOString(),
        period_days 
      }), 
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    logStep("ERROR", { message: String(error) });
    return new Response(
      JSON.stringify({ error: "Failed to generate insights" }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
