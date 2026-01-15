import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-passcode-1, x-admin-passcode-2, x-admin-passcode-3',
};

interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  user_ids?: string[]; // Send to specific users, or omit for broadcast
  pro_only?: boolean; // Send only to pro subscribers
  passcode1?: string;
  passcode2?: string;
  passcode3?: string;
}

// Verify admin access via passcode (check both headers and body)
function verifyAdminAccess(req: Request, payload: PushPayload): boolean {
  // Check headers first
  const headerPasscode1 = req.headers.get('x-admin-passcode-1');
  const headerPasscode2 = req.headers.get('x-admin-passcode-2');
  const headerPasscode3 = req.headers.get('x-admin-passcode-3');
  
  // Also check body for passcodes (more reliable with Supabase client)
  const bodyPasscode1 = payload.passcode1;
  const bodyPasscode2 = payload.passcode2;
  const bodyPasscode3 = payload.passcode3;
  
  const passcode1 = headerPasscode1 || bodyPasscode1;
  const passcode2 = headerPasscode2 || bodyPasscode2;
  const passcode3 = headerPasscode3 || bodyPasscode3;
  
  const adminCode1 = Deno.env.get('ADMIN_CODE_1');
  const adminCode2 = Deno.env.get('ADMIN_CODE_2');
  const adminCode3 = Deno.env.get('ADMIN_CODE_3');
  
  console.log('Admin verification:', { 
    hasPasscode1: !!passcode1, 
    hasPasscode2: !!passcode2, 
    hasPasscode3: !!passcode3,
    matches1: passcode1 === adminCode1,
    matches2: passcode2 === adminCode2,
    matches3: passcode3 === adminCode3
  });
  
  return passcode1 === adminCode1 && 
         passcode2 === adminCode2 && 
         passcode3 === adminCode3;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Optional: FCM Server Key for Android (add later)
    const fcmServerKey = Deno.env.get('FCM_SERVER_KEY');

    const payload: PushPayload = await req.json();
    const { title, body, data, user_ids, pro_only } = payload;

    // Check admin authorization AFTER parsing body (so we can check body passcodes)
    const isAdminRequest = verifyAdminAccess(req, payload);

    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: 'Title and body are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For broadcast notifications (no specific user_ids), require admin auth
    const isBroadcast = !user_ids || user_ids.length === 0;
    if (isBroadcast && !isAdminRequest) {
      console.log('Unauthorized broadcast attempt - admin auth failed');
      return new Response(
        JSON.stringify({ error: 'Admin authorization required for broadcast notifications' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Sending push notification:', { 
      title, 
      body, 
      user_ids: user_ids?.length || 'broadcast',
      pro_only,
      isAdmin: isAdminRequest 
    });

    // Fetch push tokens from database
    let query = supabase.from('push_tokens').select('token, platform, user_id');
    
    if (user_ids && user_ids.length > 0) {
      query = query.in('user_id', user_ids);
    }

    const { data: tokens, error: tokensError } = await query;

    if (tokensError) {
      console.error('Error fetching tokens:', tokensError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch push tokens' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!tokens || tokens.length === 0) {
      console.log('No push tokens found');
      return new Response(
        JSON.stringify({ message: 'No push tokens found', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${tokens.length} push tokens`);

    // Separate tokens by platform
    const androidTokens = tokens.filter(t => t.platform === 'android').map(t => t.token);
    const iosTokens = tokens.filter(t => t.platform === 'ios').map(t => t.token);

    const results = {
      android: { sent: 0, failed: 0 },
      ios: { sent: 0, failed: 0 },
    };

    // Send to Android devices via FCM
    if (androidTokens.length > 0) {
      if (fcmServerKey) {
        try {
          const fcmResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
            method: 'POST',
            headers: {
              'Authorization': `key=${fcmServerKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              registration_ids: androidTokens,
              notification: { title, body },
              data: data || {},
            }),
          });

          const fcmResult = await fcmResponse.json();
          console.log('FCM response:', fcmResult);
          
          results.android.sent = fcmResult.success || 0;
          results.android.failed = fcmResult.failure || 0;
        } catch (fcmError) {
          console.error('FCM error:', fcmError);
          results.android.failed = androidTokens.length;
        }
      } else {
        console.log('FCM_SERVER_KEY not configured - skipping Android push');
        results.android.failed = androidTokens.length;
      }
    }

    // Send to iOS devices via APNs
    if (iosTokens.length > 0) {
      console.log('APNs not configured - skipping iOS push');
      console.log(`Would send to ${iosTokens.length} iOS devices`);
      results.ios.failed = iosTokens.length;
    }

    const totalSent = results.android.sent + results.ios.sent;
    const totalFailed = results.android.failed + results.ios.failed;

    console.log(`Push notification complete: ${totalSent} sent, ${totalFailed} failed`);

    return new Response(
      JSON.stringify({
        message: 'Push notification processed',
        sent: totalSent,
        failed: totalFailed,
        details: results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in send-push-notification:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
