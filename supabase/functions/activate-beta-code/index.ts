import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ACTIVATE-BETA-CODE] ${step}${detailsStr}`);
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
    logStep("Checking beta code", { code: normalizedCode });

    // Check if this is the legacy MTSTRONG100 code - redirect to original handler
    if (normalizedCode === "MTSTRONG100") {
      logStep("Legacy code detected, use activate-trial instead");
      return new Response(
        JSON.stringify({ error: "Please use the original promo code handler", legacy: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Look up the beta code
    const { data: codeData, error: codeError } = await supabaseClient
      .from("beta_promo_codes")
      .select("*")
      .eq("code", normalizedCode)
      .eq("is_active", true)
      .single();

    if (codeError || !codeData) {
      logStep("Invalid or inactive beta code");
      return new Response(
        JSON.stringify({ error: "Invalid promo code", valid: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    logStep("Beta code found", { codeId: codeData.id, currentUses: codeData.current_uses, maxUses: codeData.max_uses });

    // Check if code has remaining uses
    if (codeData.current_uses >= codeData.max_uses) {
      logStep("Beta code exhausted");
      return new Response(
        JSON.stringify({ error: "This promo code has reached its usage limit", valid: false, exhausted: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Check if user already redeemed this code
    const { data: existingRedemption } = await supabaseClient
      .from("beta_code_redemptions")
      .select("id")
      .eq("code_id", codeData.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingRedemption) {
      logStep("User already redeemed this code");
      return new Response(
        JSON.stringify({ error: "You have already redeemed this code", valid: false, alreadyRedeemed: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Check if user already has any active beta trial
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("trial_end_date, trial_promo_code")
      .eq("user_id", user.id)
      .single();

    if (profile?.trial_end_date && new Date(profile.trial_end_date) > new Date()) {
      logStep("User already has active trial");
      return new Response(
        JSON.stringify({ 
          error: "You already have an active trial", 
          valid: false, 
          activeTrial: true,
          trialEndDate: profile.trial_end_date 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Calculate trial dates
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + codeData.trial_days);

    // Start transaction-like operations
    // 1. Create redemption record
    const { error: redemptionError } = await supabaseClient
      .from("beta_code_redemptions")
      .insert({
        code_id: codeData.id,
        user_id: user.id,
        expires_at: trialEnd.toISOString()
      });

    if (redemptionError) {
      logStep("Error creating redemption", { error: redemptionError.message });
      throw new Error("Could not record redemption");
    }

    // 2. Increment code usage
    const { error: incrementError } = await supabaseClient
      .from("beta_promo_codes")
      .update({ current_uses: codeData.current_uses + 1 })
      .eq("id", codeData.id);

    if (incrementError) {
      logStep("Error incrementing usage", { error: incrementError.message });
      // Don't fail the request, redemption was already recorded
    }

    // 3. Update user profile with trial info
    const { error: profileError } = await supabaseClient
      .from("profiles")
      .update({
        trial_start_date: now.toISOString(),
        trial_end_date: trialEnd.toISOString(),
        trial_promo_code: normalizedCode
      })
      .eq("user_id", user.id);

    if (profileError) {
      logStep("Error updating profile", { error: profileError.message });
      throw new Error("Could not activate trial");
    }

    logStep("Beta trial activated successfully", { 
      userId: user.id, 
      code: normalizedCode,
      trialDays: codeData.trial_days,
      expiresAt: trialEnd.toISOString()
    });

    return new Response(
      JSON.stringify({
        success: true,
        trialDays: codeData.trial_days,
        trialEndDate: trialEnd.toISOString(),
        message: `Your ${codeData.trial_days}-day Pro trial is now active!`,
        codeDescription: codeData.description
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
