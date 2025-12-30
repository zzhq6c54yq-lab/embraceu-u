import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[FETCH-ADMIN-STATS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");

    // Create admin client with service role key to bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Verify the user is authenticated and is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("Authentication failed");
    }

    const userId = userData.user.id;
    logStep("User authenticated", { userId });

    // Check if user has admin role using the has_role function
    const { data: hasAdminRole, error: roleError } = await supabaseAdmin.rpc('has_role', {
      _user_id: userId,
      _role: 'admin'
    });

    if (roleError) {
      logStep("Role check error", { error: roleError.message });
      throw new Error("Failed to verify admin role");
    }

    if (!hasAdminRole) {
      logStep("Access denied - not an admin", { userId });
      throw new Error("Access denied: Admin role required");
    }

    logStep("Admin role verified");

    // Fetch all data using service role (bypasses RLS)
    const today = new Date().toISOString().split("T")[0];

    // Get all profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("user_id, nickname, current_streak, longest_streak, created_at, theme_preference, referral_count")
      .order("created_at", { ascending: false });

    if (profilesError) {
      logStep("Error fetching profiles", { error: profilesError.message });
    }

    // Get counts in parallel
    const [moodsRes, ritualsRes, patternsRes, insightsRes, activeTodayRes, gratitudeRes] = await Promise.all([
      supabaseAdmin.from("mood_entries").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("rituals_completed").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("user_patterns").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("saved_insights").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("mood_entries").select("user_id", { count: "exact", head: true }).eq("recorded_at", today),
      supabaseAdmin.from("gratitude_entries").select("id", { count: "exact", head: true }),
    ]);

    // Get today's new signups
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const { count: newSignupsToday } = await supabaseAdmin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", todayStart.toISOString());

    // Get recent activity (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: recentMoods } = await supabaseAdmin
      .from("mood_entries")
      .select("id, mood, created_at, user_id")
      .gte("created_at", yesterday)
      .order("created_at", { ascending: false })
      .limit(20);

    const { data: recentRituals } = await supabaseAdmin
      .from("rituals_completed")
      .select("id, ritual_type, created_at, user_id")
      .gte("created_at", yesterday)
      .order("created_at", { ascending: false })
      .limit(20);

    // Get Pro subscribers from Stripe
    let proSubscribers: any[] = [];
    if (stripeKey) {
      try {
        const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
        const subscriptions = await stripe.subscriptions.list({
          status: "active",
          limit: 100,
          expand: ["data.customer"],
        });

        proSubscribers = subscriptions.data.map((sub: Stripe.Subscription) => {
          const customer = sub.customer as Stripe.Customer;
          return {
            id: sub.id,
            email: customer.email || "Unknown",
            name: customer.name || customer.email || "Unknown",
            status: sub.status,
            currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
            created: new Date(sub.created * 1000).toISOString(),
            plan: sub.items.data[0]?.price?.nickname || "Pro",
          };
        });
        logStep("Fetched Pro subscribers", { count: proSubscribers.length });
      } catch (stripeError) {
        logStep("Stripe error", { error: String(stripeError) });
      }
    }

    const stats = {
      totalUsers: profiles?.length || 0,
      totalMoods: moodsRes.count || 0,
      totalRituals: ritualsRes.count || 0,
      totalPatterns: patternsRes.count || 0,
      totalInsights: insightsRes.count || 0,
      totalGratitude: gratitudeRes.count || 0,
      activeToday: activeTodayRes.count || 0,
      newSignupsToday: newSignupsToday || 0,
      proSubscribers: proSubscribers.length,
    };

    logStep("Stats compiled", stats);

    return new Response(JSON.stringify({
      stats,
      users: profiles || [],
      proSubscribers,
      recentActivity: {
        moods: recentMoods || [],
        rituals: recentRituals || [],
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: error instanceof Error && error.message.includes("Access denied") ? 403 : 500,
    });
  }
});
