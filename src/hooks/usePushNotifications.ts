import { useEffect, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from "@capacitor/push-notifications";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const usePushNotifications = (userId: string | undefined) => {
  const registerToken = useCallback(async (token: string) => {
    if (!userId) return;

    const platform = Capacitor.getPlatform();
    
    try {
      // Upsert the token (insert or update if exists)
      const { error } = await supabase
        .from("push_tokens")
        .upsert(
          { user_id: userId, token, platform },
          { onConflict: "user_id,token" }
        );

      if (error) {
        console.error("Failed to register push token:", error);
      }
    } catch (err) {
      console.error("Error registering push token:", err);
    }
  }, [userId]);

  const initializePushNotifications = useCallback(async () => {
    // Only run on native platforms
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      // Request permission
      const permResult = await PushNotifications.requestPermissions();
      
      if (permResult.receive === "granted") {
        // Register with Apple/Google to receive push
        await PushNotifications.register();
      } else {
        console.log("Push notification permission denied");
      }
    } catch (err) {
      console.error("Error initializing push notifications:", err);
    }
  }, []);

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !userId) {
      return;
    }

    // Listen for registration success
    const registrationListener = PushNotifications.addListener(
      "registration",
      (token: Token) => {
        console.log("Push registration success:", token.value);
        registerToken(token.value);
      }
    );

    // Listen for registration errors
    const errorListener = PushNotifications.addListener(
      "registrationError",
      (error) => {
        console.error("Push registration error:", error);
      }
    );

    // Listen for push notifications received
    const notificationListener = PushNotifications.addListener(
      "pushNotificationReceived",
      (notification: PushNotificationSchema) => {
        console.log("Push notification received:", notification);
        // Show a toast when notification is received while app is open
        if (notification.title) {
          toast(notification.title, {
            description: notification.body,
          });
        }
      }
    );

    // Listen for push notification action performed
    const actionListener = PushNotifications.addListener(
      "pushNotificationActionPerformed",
      (action: ActionPerformed) => {
        console.log("Push notification action performed:", action);
        // Handle notification tap - could navigate to specific screen
      }
    );

    // Initialize push notifications
    initializePushNotifications();

    // Cleanup listeners on unmount
    return () => {
      registrationListener.then(l => l.remove());
      errorListener.then(l => l.remove());
      notificationListener.then(l => l.remove());
      actionListener.then(l => l.remove());
    };
  }, [userId, registerToken, initializePushNotifications]);

  const removeToken = useCallback(async () => {
    if (!userId || !Capacitor.isNativePlatform()) return;

    try {
      const { error } = await supabase
        .from("push_tokens")
        .delete()
        .eq("user_id", userId);

      if (error) {
        console.error("Failed to remove push token:", error);
      }
    } catch (err) {
      console.error("Error removing push token:", err);
    }
  }, [userId]);

  return { initializePushNotifications, removeToken };
};
