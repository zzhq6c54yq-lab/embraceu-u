import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface AdminAuthState {
  isAdmin: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
}

export const useAdminAuth = () => {
  const [state, setState] = useState<AdminAuthState>({
    isAdmin: false,
    isLoading: true,
    user: null,
    error: null,
  });

  const checkAdminStatus = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // First check if user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        setState({
          isAdmin: false,
          isLoading: false,
          user: null,
          error: null,
        });
        return;
      }

      // Check admin role server-side by calling the edge function
      const { data, error } = await supabase.functions.invoke('fetch-admin-stats');
      
      if (error) {
        // If 403, user is authenticated but not an admin
        if (error.message?.includes('403') || error.message?.includes('Access denied')) {
          setState({
            isAdmin: false,
            isLoading: false,
            user: session.user,
            error: "You don't have admin access",
          });
          return;
        }
        throw error;
      }

      // Successfully got admin data - user is an admin
      setState({
        isAdmin: true,
        isLoading: false,
        user: session.user,
        error: null,
      });
    } catch (error) {
      console.error("Admin auth check failed:", error);
      setState({
        isAdmin: false,
        isLoading: false,
        user: null,
        error: error instanceof Error ? error.message : "Failed to verify admin status",
      });
    }
  }, []);

  const clearAdminStatus = useCallback(async () => {
    await supabase.auth.signOut();
    setState({
      isAdmin: false,
      isLoading: false,
      user: null,
      error: null,
    });
  }, []);

  useEffect(() => {
    checkAdminStatus();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        checkAdminStatus();
      } else if (event === 'SIGNED_OUT') {
        setState({
          isAdmin: false,
          isLoading: false,
          user: null,
          error: null,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [checkAdminStatus]);

  return { 
    ...state, 
    checkAdminStatus, 
    clearAdminStatus 
  };
};
