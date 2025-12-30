import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const SAVE_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const useSessionTracking = () => {
  const { user } = useAuth();
  const sessionStart = useRef<number>(Date.now());
  const accumulatedTime = useRef<number>(0);
  const lastSaveTime = useRef<number>(Date.now());
  const isActive = useRef<boolean>(true);

  const saveTimeToDatabase = useCallback(async () => {
    if (!user?.id) return;
    
    const now = Date.now();
    const sessionDuration = Math.floor((now - sessionStart.current) / 1000);
    const timeToAdd = Math.floor((now - lastSaveTime.current) / 1000);
    
    if (timeToAdd < 10) return; // Don't save if less than 10 seconds

    try {
      // Get current total time and add to it
      const { data: profile } = await supabase
        .from("profiles")
        .select("total_time_spent_seconds")
        .eq("user_id", user.id)
        .single();

      const currentTotal = profile?.total_time_spent_seconds || 0;
      
      await supabase
        .from("profiles")
        .update({
          total_time_spent_seconds: currentTotal + timeToAdd,
          last_session_duration_seconds: sessionDuration
        })
        .eq("user_id", user.id);

      lastSaveTime.current = now;
      accumulatedTime.current = 0;
    } catch (error) {
      console.error("Error saving session time:", error);
    }
  }, [user?.id]);

  // Handle visibility change (tab focus/blur)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isActive.current = false;
        saveTimeToDatabase();
      } else {
        isActive.current = true;
        lastSaveTime.current = Date.now();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [saveTimeToDatabase]);

  // Periodic save
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      if (isActive.current) {
        saveTimeToDatabase();
      }
    }, SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [user?.id, saveTimeToDatabase]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveTimeToDatabase();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveTimeToDatabase]);

  return null;
};
