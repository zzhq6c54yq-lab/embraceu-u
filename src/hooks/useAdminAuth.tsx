import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const TIMEOUT_WARNING_MS = 25 * 60 * 1000; // 25 minutes

interface AdminAuthState {
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  sessionTimeRemaining: number | null;
  showTimeoutWarning: boolean;
}

export const useAdminAuth = () => {
  const [state, setState] = useState<AdminAuthState>({
    isAdmin: false,
    isLoading: true,
    error: null,
    sessionTimeRemaining: null,
    showTimeoutWarning: false,
  });
  
  const lastActivityRef = useRef<number>(Date.now());
  const timeoutIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const updateLastActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    sessionStorage.setItem("admin_last_activity", lastActivityRef.current.toString());
  }, []);

  const checkAdminStatus = useCallback(() => {
    const verified = sessionStorage.getItem("admin_verified") === "true";
    const lastActivity = sessionStorage.getItem("admin_last_activity");
    
    if (verified && lastActivity) {
      const elapsed = Date.now() - parseInt(lastActivity, 10);
      if (elapsed > ADMIN_TIMEOUT_MS) {
        // Session expired
        sessionStorage.removeItem("admin_verified");
        sessionStorage.removeItem("admin_last_activity");
        setState({
          isAdmin: false,
          isLoading: false,
          error: "Session expired due to inactivity",
          sessionTimeRemaining: null,
          showTimeoutWarning: false,
        });
        return;
      }
    }
    
    setState(prev => ({
      ...prev,
      isAdmin: verified,
      isLoading: false,
      error: null,
    }));
  }, []);

  const clearAdminStatus = useCallback(() => {
    sessionStorage.removeItem("admin_verified");
    sessionStorage.removeItem("admin_last_activity");
    sessionStorage.removeItem("admin_codes");
    if (timeoutIntervalRef.current) {
      clearInterval(timeoutIntervalRef.current);
    }
    setState({
      isAdmin: false,
      isLoading: false,
      error: null,
      sessionTimeRemaining: null,
      showTimeoutWarning: false,
    });
  }, []);

  const verifyAdminCodes = useCallback(async (code1: string, code2: string, code3: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-admin-stats', {
        headers: {
          'x-admin-code-1': code1,
          'x-admin-code-2': code2,
          'x-admin-code-3': code3,
        }
      });

      if (error) {
        return { success: false, error: "Invalid access codes" };
      }

      const now = Date.now();
      sessionStorage.setItem("admin_verified", "true");
      sessionStorage.setItem("admin_last_activity", now.toString());
      sessionStorage.setItem("admin_codes", JSON.stringify({ code1, code2, code3 }));
      lastActivityRef.current = now;
      
      setState({
        isAdmin: true,
        isLoading: false,
        error: null,
        sessionTimeRemaining: ADMIN_TIMEOUT_MS,
        showTimeoutWarning: false,
      });
      
      return { success: true, data };
    } catch (err) {
      return { success: false, error: "Verification failed" };
    }
  }, []);

  // Monitor session timeout
  useEffect(() => {
    if (!state.isAdmin) {
      if (timeoutIntervalRef.current) {
        clearInterval(timeoutIntervalRef.current);
      }
      return;
    }

    // Check timeout every 10 seconds
    timeoutIntervalRef.current = setInterval(() => {
      const lastActivity = parseInt(sessionStorage.getItem("admin_last_activity") || "0", 10);
      const elapsed = Date.now() - lastActivity;
      const remaining = ADMIN_TIMEOUT_MS - elapsed;

      if (remaining <= 0) {
        clearAdminStatus();
        setState(prev => ({
          ...prev,
          isAdmin: false,
          error: "Session expired due to inactivity",
        }));
      } else {
        setState(prev => ({
          ...prev,
          sessionTimeRemaining: remaining,
          showTimeoutWarning: elapsed >= TIMEOUT_WARNING_MS,
        }));
      }
    }, 10000);

    return () => {
      if (timeoutIntervalRef.current) {
        clearInterval(timeoutIntervalRef.current);
      }
    };
  }, [state.isAdmin, clearAdminStatus]);

  // Listen for user activity
  useEffect(() => {
    if (!state.isAdmin) return;

    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    
    const handleActivity = () => {
      updateLastActivity();
    };

    events.forEach(event => window.addEventListener(event, handleActivity));
    
    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, [state.isAdmin, updateLastActivity]);

  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

  return { 
    ...state, 
    checkAdminStatus, 
    clearAdminStatus,
    verifyAdminCodes,
    updateLastActivity,
  };
};
