import { supabase } from "@/integrations/supabase/client";

interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  user_ids?: string[]; // Optional: specific users, omit for broadcast
}

interface PushNotificationResult {
  message: string;
  sent: number;
  failed: number;
  details: {
    android: { sent: number; failed: number };
    ios: { sent: number; failed: number };
  };
}

/**
 * Send a push notification to users via the edge function
 * @param payload - The notification payload
 * @returns The result of the push notification attempt
 */
export async function sendPushNotification(
  payload: PushNotificationPayload
): Promise<{ data: PushNotificationResult | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.functions.invoke<PushNotificationResult>(
      'send-push-notification',
      { body: payload }
    );

    if (error) {
      console.error('Push notification error:', error);
      return { data: null, error };
    }

    console.log('Push notification result:', data);
    return { data, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Unknown error');
    console.error('Push notification error:', error);
    return { data: null, error };
  }
}

/**
 * Send a test push notification to the current user
 */
export async function sendTestPushNotification(): Promise<{ data: PushNotificationResult | null; error: Error | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  return sendPushNotification({
    title: 'Test Notification',
    body: 'This is a test push notification from EmbraceU!',
    user_ids: [user.id],
    data: { type: 'test' },
  });
}
