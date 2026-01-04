import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Product IDs from Stripe
const LIFETIME_PRODUCT_ID = "prod_ThfBphrlNFCrAM";
const BUNDLE_PRODUCT_ID = "prod_ThduP1oLhnt8Vz";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // FIRST: Check for active trial in database (no payment required)
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("trial_start_date, trial_end_date, trial_promo_code")
      .eq("user_id", user.id)
      .single();

    if (profile?.trial_end_date) {
      const trialEnd = new Date(profile.trial_end_date);
      const now = new Date();
      
      if (trialEnd > now) {
        // Active trial - calculate days remaining
        const diffTime = trialEnd.getTime() - now.getTime();
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        logStep("Active trial found", { 
          trialEnd: profile.trial_end_date, 
          daysRemaining,
          promoCode: profile.trial_promo_code 
        });
        
        return new Response(JSON.stringify({
          subscribed: true,
          isLifetime: false,
          isTrial: true,
          trialDaysRemaining: daysRemaining,
          trialEndDate: profile.trial_end_date,
          subscription_end: profile.trial_end_date
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } else {
        logStep("Trial expired", { trialEnd: profile.trial_end_date });
      }
    }

    // SECOND: Check Stripe for paid subscriptions
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, returning unsubscribed");
      return new Response(JSON.stringify({ 
        subscribed: false, 
        isLifetime: false,
        isTrial: false,
        trialExpired: !!profile?.trial_end_date // True if they had a trial that expired
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Check for active subscription first
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionEnd = null;
    let productId = null;
    let isLifetime = false;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      
      // Safely handle the timestamp conversion
      const periodEnd = subscription.current_period_end;
      logStep("Processing subscription", { 
        subscriptionId: subscription.id,
        periodEndRaw: periodEnd,
        periodEndType: typeof periodEnd
      });
      
      if (periodEnd && typeof periodEnd === 'number') {
        subscriptionEnd = new Date(periodEnd * 1000).toISOString();
      } else if (periodEnd) {
        // Try to parse it as a number if it's a string
        const parsed = Number(periodEnd);
        if (!isNaN(parsed)) {
          subscriptionEnd = new Date(parsed * 1000).toISOString();
        }
      }
      
      productId = subscription.items.data[0]?.price?.product || null;
      logStep("Active subscription found", { 
        subscriptionId: subscription.id, 
        endDate: subscriptionEnd,
        productId 
      });
    } else {
      logStep("No active subscription found, checking for lifetime/bundle purchase");
      
      // Check for lifetime or bundle one-time purchase via checkout sessions
      const checkoutSessions = await stripe.checkout.sessions.list({
        customer: customerId,
        status: 'complete',
        limit: 100,
      });

      for (const session of checkoutSessions.data) {
        if (session.mode === 'payment' && session.payment_status === 'paid') {
          // Get line items for this session
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
          
          for (const item of lineItems.data) {
            const priceProduct = item.price?.product;
            
            // Check for lifetime purchase
            if (priceProduct === LIFETIME_PRODUCT_ID) {
              isLifetime = true;
              productId = LIFETIME_PRODUCT_ID;
              logStep("Lifetime purchase found", { sessionId: session.id, productId });
              break;
            }
            
            // Check for 3-month bundle purchase (treated as Pro access)
            if (priceProduct === BUNDLE_PRODUCT_ID) {
              // Bundle grants 3 months of access from purchase date
              const purchaseDate = new Date(session.created * 1000);
              const expiryDate = new Date(purchaseDate);
              expiryDate.setMonth(expiryDate.getMonth() + 3);
              
              // Only grant access if bundle hasn't expired
              if (expiryDate > new Date()) {
                productId = BUNDLE_PRODUCT_ID;
                subscriptionEnd = expiryDate.toISOString();
                logStep("Active bundle purchase found", { 
                  sessionId: session.id, 
                  productId,
                  expiresAt: subscriptionEnd 
                });
                break;
              } else {
                logStep("Expired bundle purchase found", { sessionId: session.id });
              }
            }
          }
          
          if (isLifetime || productId) break;
        }
      }
    }

    const hasAccess = hasActiveSub || isLifetime || !!productId;

    return new Response(JSON.stringify({
      subscribed: hasAccess,
      isLifetime: isLifetime,
      isTrial: false,
      trialDaysRemaining: null,
      product_id: productId,
      subscription_end: isLifetime ? null : subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
