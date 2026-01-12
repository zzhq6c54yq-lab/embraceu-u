import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Promo code to Stripe coupon ID mapping
const PROMO_CODES: Record<string, string> = {
  "MTSTRONG100": "vCMxaodP", // 100% off first week
};

// Price IDs for different plans (NEW PRICING 2026)
const PRICE_IDS = {
  weekly: "price_1SotMHDrG8e7x5d4THNoMluc", // $1.99/week
  monthly: "price_1SotMlDrG8e7x5d4GqcF5Kj2", // $4.99/month
  yearly: "price_1SotMtDrG8e7x5d4cG1ndXTE", // $49.99/year
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
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
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request body for promo code and plan type
    const body = await req.json().catch(() => ({}));
    const promoCode = body?.promoCode?.toUpperCase()?.trim();
    const planType = body?.planType || 'weekly';
    logStep("Request body parsed", { promoCode: promoCode || 'none', planType });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    // Check if customer already exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      logStep("No existing customer, will create during checkout");
    }

    const origin = req.headers.get("origin") || "https://pigavlxphdpjsjiwohok.lovableproject.com";
    
    // Determine the correct price based on plan type
    let priceId = PRICE_IDS.weekly;
    if (planType === 'monthly') priceId = PRICE_IDS.monthly;
    else if (planType === 'yearly') priceId = PRICE_IDS.yearly;
    logStep("Selected price", { priceId, planType });

    // Check for valid promo code
    const couponId = promoCode ? PROMO_CODES[promoCode] : undefined;
    if (promoCode) {
      logStep("Promo code check", { promoCode, valid: !!couponId });
    }

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/daily?checkout=success`,
      cancel_url: `${origin}/daily?checkout=cancelled`,
      allow_promotion_codes: true, // Enable promo code input on Stripe checkout
    };

    // Apply coupon if valid promo code provided (passed from app)
    if (couponId) {
      // When using discounts, we can't also use allow_promotion_codes
      delete sessionConfig.allow_promotion_codes;
      sessionConfig.discounts = [{ coupon: couponId }];
      logStep("Applying coupon", { couponId });
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    logStep("Checkout session created", { sessionId: session.id, url: session.url, hasCoupon: !!couponId });

    return new Response(JSON.stringify({ url: session.url }), {
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
