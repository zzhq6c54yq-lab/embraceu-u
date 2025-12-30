import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useAppUsageTracking = () => {
  const { user } = useAuth();
  const hasChecked = useRef(false);

  useEffect(() => {
    if (!user?.id || hasChecked.current) return;
    hasChecked.current = true;

    const checkAndUpdatePWAStatus = async () => {
      // Check if running as PWA
      const isPWA = 
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes("android-app://");

      if (isPWA) {
        try {
          // Check if already marked as installed
          const { data: profile } = await supabase
            .from("profiles")
            .select("pwa_installed")
            .eq("user_id", user.id)
            .single();

          if (!profile?.pwa_installed) {
            await supabase
              .from("profiles")
              .update({
                pwa_installed: true,
                pwa_installed_at: new Date().toISOString()
              })
              .eq("user_id", user.id);
          }
        } catch (error) {
          console.error("Error updating PWA status:", error);
        }
      }
    };

    checkAndUpdatePWAStatus();

    // Listen for PWA install event
    const handleAppInstalled = async () => {
      try {
        await supabase
          .from("profiles")
          .update({
            pwa_installed: true,
            pwa_installed_at: new Date().toISOString()
          })
          .eq("user_id", user.id);
      } catch (error) {
        console.error("Error updating PWA install status:", error);
      }
    };

    window.addEventListener("appinstalled", handleAppInstalled);
    return () => window.removeEventListener("appinstalled", handleAppInstalled);
  }, [user?.id]);

  return null;
};
