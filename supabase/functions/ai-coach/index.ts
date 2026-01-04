import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[AI-COACH] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, conversationId } = await req.json();
    logStep("Request received", { messageCount: messages?.length, conversationId });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get auth header for user context
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let userContext = "";
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (!authError && user) {
        logStep("User authenticated", { userId: user.id });
        
        // Fetch user context for personalization
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const [moodResult, ritualResult, gratitudeResult, profileResult] = await Promise.all([
          supabase.from("mood_entries")
            .select("mood_level, mood_label, notes, created_at")
            .eq("user_id", user.id)
            .gte("created_at", weekAgo.toISOString())
            .order("created_at", { ascending: false })
            .limit(5),
          supabase.from("user_rituals")
            .select("name, is_active")
            .eq("user_id", user.id)
            .eq("is_active", true)
            .limit(3),
          supabase.from("gratitude_entries")
            .select("entry_text, created_at")
            .eq("user_id", user.id)
            .gte("created_at", weekAgo.toISOString())
            .order("created_at", { ascending: false })
            .limit(3),
          supabase.from("profiles")
            .select("nickname, current_streak")
            .eq("user_id", user.id)
            .single()
        ]);

        const profile = profileResult.data;
        const recentMoods = moodResult.data || [];
        const activeRituals = ritualResult.data || [];
        const recentGratitude = gratitudeResult.data || [];

        if (profile || recentMoods.length || activeRituals.length || recentGratitude.length) {
          userContext = `\n\n[User Context - Use subtly to personalize responses]:`;
          if (profile?.nickname) userContext += `\n- Name: ${profile.nickname}`;
          if (profile?.current_streak) userContext += `\n- Current streak: ${profile.current_streak} days`;
          if (recentMoods.length) {
            const avgMood = recentMoods.reduce((a, b) => a + (b.mood_level || 3), 0) / recentMoods.length;
            userContext += `\n- Average mood this week: ${avgMood.toFixed(1)}/5`;
            if (recentMoods[0]?.mood_label) userContext += ` (most recent: ${recentMoods[0].mood_label})`;
          }
          if (activeRituals.length) {
            userContext += `\n- Active rituals: ${activeRituals.map(r => r.name).join(", ")}`;
          }
          if (recentGratitude.length) {
            userContext += `\n- Recent gratitude themes: ${recentGratitude.slice(0, 2).map(g => g.entry_text?.slice(0, 40)).join("; ")}`;
          }
        }
        
        logStep("User context gathered", { hasContext: !!userContext });
      }
    }

    const systemPrompt = `You are a compassionate AI wellness coach for EmbraceU, a self-improvement app focused on mindfulness, gratitude, and personal growth. Your role is to:

1. LISTEN with empathy and validate feelings without judgment
2. GUIDE users toward self-reflection and positive action
3. SUGGEST practical, evidence-based wellness techniques (breathwork, gratitude, reframing)
4. CELEBRATE progress and encourage consistency
5. PERSONALIZE responses using any context about the user's journey

Communication style:
- Warm, supportive, and encouraging but not preachy
- Ask thoughtful follow-up questions to deepen understanding
- Offer 1-2 actionable suggestions when appropriate
- Keep responses focused and conversational (2-4 paragraphs max)
- Use the user's name occasionally if known
- Reference their journey when relevant (streaks, rituals, recent moods)

You can help with:
- Processing emotions and difficult experiences
- Building mindfulness and gratitude habits
- Reframing negative thought patterns
- Setting intentions and goals
- Celebrating wins and progress
- Breathing exercises and grounding techniques

Never provide medical advice or diagnose conditions. For serious mental health concerns, gently suggest professional support.${userContext}`;

    logStep("Calling Lovable AI Gateway");
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logStep("AI Gateway error", { status: response.status, error: errorText });
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "I'm a bit overwhelmed right now. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "The wellness coach is temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    logStep("Streaming response");
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    logStep("Error", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});