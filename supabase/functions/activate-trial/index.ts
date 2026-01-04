import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Valid promo codes that grant free trial
const VALID_PROMO_CODES: Record<string, number> = {
  "MTSTRONG100": 7, // 7 days free trial
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ACTIVATE-TRIAL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Parse request body
    const { promoCode } = await req.json();
    if (!promoCode) throw new Error("Promo code is required");

    const normalizedCode = promoCode.toUpperCase().trim();
    logStep("Checking promo code", { code: normalizedCode });

    // Validate promo code
    const trialDays = VALID_PROMO_CODES[normalizedCode];
    if (!trialDays) {
      logStep("Invalid promo code");
      return new Response(
        JSON.stringify({ error: "Invalid promo code", valid: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Check if user already used a trial
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("trial_start_date, trial_end_date, trial_promo_code")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      logStep("Error fetching profile", { error: profileError.message });
      throw new Error("Could not fetch user profile");
    }

    if (profile?.trial_promo_code) {
      logStep("User already used a trial", { previousCode: profile.trial_promo_code });
      return new Response(
        JSON.stringify({ 
          error: "You have already used a free trial", 
          valid: false,
          alreadyUsed: true 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Activate the trial
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + trialDays);

    const { error: updateError } = await supabaseClient
      .from("profiles")
      .update({
        trial_start_date: now.toISOString(),
        trial_end_date: trialEnd.toISOString(),
        trial_promo_code: normalizedCode,
      })
      .eq("user_id", user.id);

    if (updateError) {
      logStep("Error updating profile", { error: updateError.message });
      throw new Error("Could not activate trial");
    }

    logStep("Trial activated successfully", { 
      userId: user.id, 
      trialEnd: trialEnd.toISOString(),
      trialDays 
    });

    return new Response(
      JSON.stringify({
        success: true,
        trialDays,
        trialEndDate: trialEnd.toISOString(),
        message: `Your ${trialDays}-day Pro trial is now active!`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
