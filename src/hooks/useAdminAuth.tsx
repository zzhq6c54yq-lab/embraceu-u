import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdminAuthState {
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useAdminAuth = () => {
  const [state, setState] = useState<AdminAuthState>({
    isAdmin: false,
    isLoading: true,
    error: null,
  });

  const checkAdminStatus = useCallback(() => {
    // Check if admin was verified via passcode in this session
    const verified = sessionStorage.getItem("admin_verified") === "true";
    setState({
      isAdmin: verified,
      isLoading: false,
      error: null,
    });
  }, []);

  const clearAdminStatus = useCallback(() => {
    sessionStorage.removeItem("admin_verified");
    setState({
      isAdmin: false,
      isLoading: false,
      error: null,
    });
  }, []);

  // Function to verify admin with codes (called from modal)
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

      sessionStorage.setItem("admin_verified", "true");
      setState({
        isAdmin: true,
        isLoading: false,
        error: null,
      });
      
      return { success: true, data };
    } catch (err) {
      return { success: false, error: "Verification failed" };
    }
  }, []);

  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

  return { 
    ...state, 
    checkAdminStatus, 
    clearAdminStatus,
    verifyAdminCodes
  };
};
