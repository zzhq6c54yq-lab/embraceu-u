import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[FETCH-BETA-CODES-STATS] ${step}${detailsStr}`);
};

// Verify admin access via passcodes
function verifyPasscodeAccess(req: Request): boolean {
  const passcode1 = req.headers.get('x-admin-code-1');
  const passcode2 = req.headers.get('x-admin-code-2');
  const passcode3 = req.headers.get('x-admin-code-3');

  const adminCode1 = Deno.env.get('ADMIN_CODE_1');
  const adminCode2 = Deno.env.get('ADMIN_CODE_2');
  const adminCode3 = Deno.env.get('ADMIN_CODE_3');

  return passcode1 === adminCode1 && 
         passcode2 === adminCode2 && 
         passcode3 === adminCode3;
}

// Verify admin access via JWT
async function verifyJwtAdminAccess(req: Request, supabaseClient: any): Promise<boolean> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return false;

  try {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabaseClient.auth.getUser(token);

    if (error || !user) return false;

    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    return !!roleData;
  } catch (err) {
    console.error('[FETCH-BETA-CODES-STATS] JWT verification error:', err);
    return false;
  }
}

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

    // Verify admin access
    const passcodeValid = verifyPasscodeAccess(req);
    const jwtValid = await verifyJwtAdminAccess(req, supabaseClient);

    if (!passcodeValid && !jwtValid) {
      logStep("Unauthorized access attempt");
      return new Response(
        JSON.stringify({ error: "Admin authorization required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    logStep("Admin access verified");

    // Fetch all beta codes with stats
    const { data: codes, error: codesError } = await supabaseClient
      .from("beta_promo_codes")
      .select("*")
      .order("created_at", { ascending: true });

    if (codesError) {
      throw new Error(`Error fetching codes: ${codesError.message}`);
    }

    // Fetch redemption details for each code
    const now = new Date();
    const codesWithStats = await Promise.all(codes.map(async (code: any) => {
      // Get all redemptions for this code
      const { data: redemptions, error: redemptionsError } = await supabaseClient
        .from("beta_code_redemptions")
        .select("user_id, redeemed_at, expires_at")
        .eq("code_id", code.id);

      if (redemptionsError) {
        logStep("Error fetching redemptions", { codeId: code.id, error: redemptionsError.message });
        return {
          ...code,
          activeUsers: 0,
          expiredUsers: 0,
          avgExpiryDate: null,
          redemptions: []
        };
      }

      const activeUsers = redemptions?.filter((r: any) => new Date(r.expires_at) > now).length || 0;
      const expiredUsers = (redemptions?.length || 0) - activeUsers;

      // Calculate average expiry date for active users
      const activeRedemptions = redemptions?.filter((r: any) => new Date(r.expires_at) > now) || [];
      let avgExpiryDate = null;
      if (activeRedemptions.length > 0) {
        const totalMs = activeRedemptions.reduce((sum: number, r: any) => sum + new Date(r.expires_at).getTime(), 0);
        avgExpiryDate = new Date(totalMs / activeRedemptions.length).toISOString();
      }

      return {
        ...code,
        activeUsers,
        expiredUsers,
        avgExpiryDate,
        redemptions: redemptions || []
      };
    }));

    // Summary stats
    const totalRedemptions = codesWithStats.reduce((sum, c) => sum + c.current_uses, 0);
    const totalActiveUsers = codesWithStats.reduce((sum, c) => sum + c.activeUsers, 0);
    const totalCapacity = codesWithStats.reduce((sum, c) => sum + c.max_uses, 0);

    logStep("Stats fetched successfully", { 
      codesCount: codesWithStats.length, 
      totalRedemptions,
      totalActiveUsers 
    });

    return new Response(
      JSON.stringify({
        codes: codesWithStats,
        summary: {
          totalRedemptions,
          totalActiveUsers,
          totalCapacity,
          utilizationPercent: totalCapacity > 0 ? Math.round((totalRedemptions / totalCapacity) * 100) : 0
        }
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
