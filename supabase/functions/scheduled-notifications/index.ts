import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPreference {
  user_id: string;
  morning_reminder: boolean;
  morning_reminder_time: string;
  streak_warning: boolean;
  weekly_summary: boolean;
}

interface Profile {
  user_id: string;
  nickname: string;
  current_streak: number | null;
  last_active_date: string | null;
}

// Morning motivation messages
const morningMessages = [
  "Good morning! Your journey of growth awaits. What will you nurture today?",
  "Rise and thrive! Take a moment to set your intention for today.",
  "A new day, a new opportunity. Your streak is waiting for you!",
  "Morning! Start your day with gratitude and watch the magic unfold.",
  "Hello beautiful soul! Ready for another day of growth?",
  "Good morning! Small steps today lead to big transformations tomorrow.",
  "Wake up and embrace your potential. Today is full of possibilities!",
  "Morning reminder: You're doing amazing. Keep showing up for yourself!",
];

// Streak warning messages
const streakWarningMessages = [
  "Your {streak}-day streak is at risk! A quick check-in takes only 30 seconds.",
  "Don't let your {streak}-day streak slip away! Log your mood to keep going.",
  "Hey! Your streak needs you. A moment of reflection keeps growth alive.",
  "Quick reminder: Your {streak}-day streak is waiting. Don't break the chain!",
];

// Weekly summary intro messages
const weeklySummaryMessages = [
  "Your week in review: {activities} activities, {streak}-day streak. You're growing!",
  "Weekly reflection: You logged {moods} moods and completed {rituals} rituals this week!",
  "Look at you grow! This week: {activities} mindful moments. Keep it up!",
];

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body for notification type
    let notificationType = 'all';
    try {
      const body = await req.json();
      notificationType = body.type || 'all';
    } catch {
      // Default to 'all' if no body provided
    }

    console.log(`Processing scheduled notifications: type=${notificationType}`);

    const now = new Date();
    const currentHour = now.getUTCHours();
    const currentDay = now.getUTCDay(); // 0 = Sunday
    const today = now.toISOString().split('T')[0];

    const results = {
      morning_reminders: { sent: 0, skipped: 0 },
      streak_warnings: { sent: 0, skipped: 0 },
      weekly_summaries: { sent: 0, skipped: 0 },
    };

    // Fetch all notification preferences with push tokens
    const { data: preferencesData, error: prefError } = await supabase
      .from('notification_preferences')
      .select('*');

    if (prefError) {
      console.error('Error fetching preferences:', prefError);
      throw prefError;
    }

    const preferences: NotificationPreference[] = preferencesData || [];
    console.log(`Found ${preferences.length} users with notification preferences`);

    // Get user profiles for streak data
    const userIds = preferences.map(p => p.user_id);
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, nickname, current_streak, last_active_date')
      .in('user_id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    const profilesMap = new Map<string, Profile>();
    (profilesData || []).forEach((p: Profile) => {
      profilesMap.set(p.user_id, p);
    });

    // Get users with push tokens
    const { data: tokensData, error: tokensError } = await supabase
      .from('push_tokens')
      .select('user_id')
      .in('user_id', userIds);

    if (tokensError) {
      console.error('Error fetching tokens:', tokensError);
    }

    const usersWithTokens = new Set((tokensData || []).map(t => t.user_id));
    console.log(`${usersWithTokens.size} users have push tokens registered`);

    // Helper function to send notification via send-push-notification function
    async function sendNotification(userId: string, title: string, body: string, data?: Record<string, string>) {
      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
            // Include admin codes for internal calls
            'x-admin-passcode-1': Deno.env.get('ADMIN_CODE_1') || '',
            'x-admin-passcode-2': Deno.env.get('ADMIN_CODE_2') || '',
            'x-admin-passcode-3': Deno.env.get('ADMIN_CODE_3') || '',
          },
          body: JSON.stringify({
            title,
            body,
            user_ids: [userId],
            data,
          }),
        });

        const result = await response.json();
        console.log(`Notification sent to ${userId}:`, result);
        return result.sent > 0;
      } catch (error) {
        console.error(`Failed to send notification to ${userId}:`, error);
        return false;
      }
    }

    // Process each user's preferences
    for (const pref of preferences) {
      const profile = profilesMap.get(pref.user_id);
      const hasToken = usersWithTokens.has(pref.user_id);

      if (!hasToken) {
        console.log(`Skipping user ${pref.user_id}: no push token`);
        continue;
      }

      const nickname = profile?.nickname || 'Friend';
      const currentStreak = profile?.current_streak || 0;
      const lastActiveDate = profile?.last_active_date;

      // 1. MORNING REMINDERS
      if ((notificationType === 'all' || notificationType === 'morning') && pref.morning_reminder) {
        // Parse user's preferred time (e.g., "08:00")
        const [prefHour] = (pref.morning_reminder_time || '08:00').split(':').map(Number);
        
        // Check if current hour matches user's preference (with 1-hour tolerance)
        if (Math.abs(currentHour - prefHour) <= 1) {
          const message = morningMessages[Math.floor(Math.random() * morningMessages.length)];
          const sent = await sendNotification(
            pref.user_id,
            `Good morning, ${nickname}!`,
            message,
            { type: 'morning_reminder', route: '/daily' }
          );
          
          if (sent) {
            results.morning_reminders.sent++;
          } else {
            results.morning_reminders.skipped++;
          }
        }
      }

      // 2. STREAK WARNINGS (sent in evening if user hasn't been active today)
      if ((notificationType === 'all' || notificationType === 'streak') && pref.streak_warning) {
        // Send warning between 18:00-20:00 UTC if user hasn't been active today and has a streak
        if (currentHour >= 18 && currentHour <= 20 && currentStreak > 0) {
          const wasActiveToday = lastActiveDate === today;
          
          if (!wasActiveToday) {
            const messageTemplate = streakWarningMessages[Math.floor(Math.random() * streakWarningMessages.length)];
            const message = messageTemplate.replace('{streak}', currentStreak.toString());
            
            const sent = await sendNotification(
              pref.user_id,
              `Don't lose your streak!`,
              message,
              { type: 'streak_warning', route: '/daily' }
            );
            
            if (sent) {
              results.streak_warnings.sent++;
            } else {
              results.streak_warnings.skipped++;
            }
          }
        }
      }

      // 3. WEEKLY SUMMARIES (sent on Sundays)
      if ((notificationType === 'all' || notificationType === 'weekly') && pref.weekly_summary) {
        // Send on Sunday between 10:00-12:00 UTC
        if (currentDay === 0 && currentHour >= 10 && currentHour <= 12) {
          // Calculate week's activities
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          const weekAgoStr = weekAgo.toISOString();

          // Fetch this week's activity counts
          const [moodsResult, ritualsResult] = await Promise.all([
            supabase
              .from('mood_entries')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', pref.user_id)
              .gte('created_at', weekAgoStr),
            supabase
              .from('rituals_completed')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', pref.user_id)
              .gte('created_at', weekAgoStr),
          ]);

          const moodsCount = moodsResult.count || 0;
          const ritualsCount = ritualsResult.count || 0;
          const totalActivities = moodsCount + ritualsCount;

          const messageTemplate = weeklySummaryMessages[Math.floor(Math.random() * weeklySummaryMessages.length)];
          const message = messageTemplate
            .replace('{activities}', totalActivities.toString())
            .replace('{moods}', moodsCount.toString())
            .replace('{rituals}', ritualsCount.toString())
            .replace('{streak}', currentStreak.toString());

          const sent = await sendNotification(
            pref.user_id,
            `Your Week in Review`,
            message,
            { type: 'weekly_summary', route: '/progress' }
          );
          
          if (sent) {
            results.weekly_summaries.sent++;
          } else {
            results.weekly_summaries.skipped++;
          }
        }
      }
    }

    console.log('Scheduled notifications complete:', results);

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: now.toISOString(),
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in scheduled-notifications:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
