import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-code-1, x-admin-code-2, x-admin-code-3",
};

// Server-side admin access codes (secure - not exposed to client)
const ADMIN_CODE_1 = "070606300428"; // 12 digits
const ADMIN_CODE_2 = "06300428";     // 8 digits
const ADMIN_CODE_3 = "0706";         // 4 digits

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[FETCH-ADMIN-STATS] ${step}${detailsStr}`);
};

const validateAdminCodes = (req: Request): boolean => {
  const code1 = req.headers.get("x-admin-code-1");
  const code2 = req.headers.get("x-admin-code-2");
  const code3 = req.headers.get("x-admin-code-3");
  
  logStep("Checking passcodes", { 
    hasCode1: !!code1, 
    hasCode2: !!code2, 
    hasCode3: !!code3,
    code1Match: code1 === ADMIN_CODE_1,
    code2Match: code2 === ADMIN_CODE_2,
    code3Match: code3 === ADMIN_CODE_3
  });
  
  if (!code1 || !code2 || !code3) {
    return false;
  }
  
  return code1 === ADMIN_CODE_1 && code2 === ADMIN_CODE_2 && code3 === ADMIN_CODE_3;
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

    let isAuthorized = false;

    // Method 1: Check for 3-step admin codes
    if (validateAdminCodes(req)) {
      logStep("Admin access via passcodes - AUTHORIZED");
      isAuthorized = true;
    }
    
    // Method 2: Check for JWT auth with admin role (fallback)
    if (!isAuthorized) {
      const authHeader = req.headers.get("Authorization");
      logStep("Checking JWT auth", { hasAuthHeader: !!authHeader });
      
      if (authHeader) {
        const token = authHeader.replace("Bearer ", "");
        const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
        
        if (!userError && userData.user) {
          const userId = userData.user.id;
          logStep("User authenticated via JWT", { userId });

          // Check if user has admin role
          const { data: hasAdminRole, error: roleError } = await supabaseAdmin.rpc('has_role', {
            _user_id: userId,
            _role: 'admin'
          });

          logStep("Admin role check", { hasAdminRole, roleError: roleError?.message });

          if (hasAdminRole) {
            logStep("Admin role verified via JWT - AUTHORIZED");
            isAuthorized = true;
          }
        } else {
          logStep("JWT auth failed", { error: userError?.message });
        }
      }
    }

    if (!isAuthorized) {
      logStep("Access denied - no valid authentication");
      throw new Error("Access denied: Invalid credentials");
    }

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
