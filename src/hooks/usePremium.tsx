import { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface PremiumContextType {
  isPremium: boolean;
  isLifetime: boolean;
  isTrial: boolean;
  trialDaysRemaining: number | null;
  trialExpired: boolean;
  isLoading: boolean;
  subscriptionEnd: string | null;
  togglePremium: () => void;
  setPremium: (value: boolean) => void;
  showCelebration: boolean;
  triggerCelebration: () => void;
  completeCelebration: () => void;
  checkSubscription: () => Promise<void>;
  openCustomerPortal: () => Promise<void>;
  activateTrial: (promoCode: string) => Promise<{ success: boolean; error?: string }>;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export const PremiumProvider = ({ children }: { children: ReactNode }) => {
  const { user, session } = useAuth();
  const [isPremium, setIsPremiumState] = useState(false);
  const [isLifetime, setIsLifetime] = useState(false);
  const [isTrial, setIsTrial] = useState(false);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState<number | null>(null);
  const [trialExpired, setTrialExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasCheckedInitially, setHasCheckedInitially] = useState(false);
  const isPremiumRef = useRef(isPremium);

  // Keep ref in sync with state
  useEffect(() => {
    isPremiumRef.current = isPremium;
  }, [isPremium]);

  const triggerCelebration = useCallback(() => {
    setShowCelebration(true);
  }, []);

  const completeCelebration = useCallback(() => {
    setShowCelebration(false);
    setIsPremiumState(true);
  }, []);

  const checkSubscription = useCallback(async (retryCount = 0): Promise<void> => {
    const maxRetries = 3;
    const retryDelay = 2000;
    
    // Check if we have a valid session before calling the edge function
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (!currentSession) {
      console.log('No session available, skipping subscription check');
      setIsPremiumState(false);
      setSubscriptionEnd(null);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');

      if (error) {
        console.error('Error checking subscription:', error);
        
        // If auth error and we have retries left, wait and retry
        if (error.message?.includes('Auth session missing') && retryCount < maxRetries) {
          console.log(`Retrying subscription check (${retryCount + 1}/${maxRetries})...`);
          setTimeout(() => {
            checkSubscription(retryCount + 1);
          }, retryDelay);
          return;
        }
        
        // Don't reset premium state on error if user was already premium
        if (!isPremiumRef.current) {
          setIsLoading(false);
        }
        return;
      }

      const wasNotPremium = !isPremiumRef.current;
      const isNowPremium = data?.subscribed === true;

      if (wasNotPremium && isNowPremium && hasCheckedInitially) {
        // User just upgraded - trigger celebration
        triggerCelebration();
      } else {
        setIsPremiumState(isNowPremium);
      }

      setIsLifetime(data?.isLifetime === true);
      setIsTrial(data?.isTrial === true);
      setTrialDaysRemaining(data?.trialDaysRemaining ?? null);
      setTrialExpired(data?.trialExpired === true);
      setSubscriptionEnd(data?.subscription_end || null);
    } catch (error) {
      console.error('Error checking subscription:', error);
      // Don't reset premium state on error
    } finally {
      setIsLoading(false);
      setHasCheckedInitially(true);
    }
  }, [hasCheckedInitially, triggerCelebration]);

  const openCustomerPortal = useCallback(async () => {

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) {
        console.error('Error opening customer portal:', error);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
    }
  }, []);

  // Check subscription on auth state change
  useEffect(() => {
    if (user && session) {
      checkSubscription();
    } else {
      setIsPremiumState(false);
      setIsLifetime(false);
      setIsTrial(false);
      setTrialDaysRemaining(null);
      setTrialExpired(false);
      setSubscriptionEnd(null);
      setHasCheckedInitially(false);
    }
  }, [user?.id, session?.access_token]);

  // Poll subscription status every 60 seconds when logged in
  useEffect(() => {
    if (!user || !session) return;

    const interval = setInterval(() => {
      checkSubscription();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [user?.id, session?.access_token, checkSubscription]);

  // Check for checkout success in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') {
      // Remove the query param
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      
      // Set premium immediately for checkout success (optimistic)
      setIsPremiumState(true);
      
      // Trigger celebration
      triggerCelebration();
      
      // Verify subscription in background with retry logic
      const verifySubscription = async () => {
        // Wait for session to be available
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (currentSession) {
          checkSubscription();
        } else {
          // If no session yet, wait and retry
          setTimeout(verifySubscription, 1000);
        }
      };
      
      setTimeout(verifySubscription, 2000);
    }
  }, []);

  const togglePremium = () => setIsPremiumState((prev) => !prev);
  
  const setPremium = useCallback((value: boolean) => {
    if (value && !isPremium) {
      triggerCelebration();
    } else {
      setIsPremiumState(value);
    }
  }, [isPremium, triggerCelebration]);

  const activateTrial = useCallback(async (promoCode: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('activate-trial', {
        body: { promoCode }
      });

      if (error) {
        console.error('Error activating trial:', error);
        return { success: false, error: error.message };
      }

      if (data?.error) {
        return { success: false, error: data.error };
      }

      if (data?.success) {
        // Trial activated - trigger celebration and refresh subscription state
        triggerCelebration();
        await checkSubscription();
        return { success: true };
      }

      return { success: false, error: 'Unknown error' };
    } catch (error) {
      console.error('Error activating trial:', error);
      return { success: false, error: 'Failed to activate trial' };
    }
  }, [triggerCelebration, checkSubscription]);

  return (
    <PremiumContext.Provider value={{ 
      isPremium, 
      isLifetime,
      isTrial,
      trialDaysRemaining,
      trialExpired,
      isLoading,
      subscriptionEnd,
      togglePremium, 
      setPremium, 
      showCelebration, 
      triggerCelebration, 
      completeCelebration,
      checkSubscription,
      openCustomerPortal,
      activateTrial,
    }}>
      {children}
    </PremiumContext.Provider>
  );
};

export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (context === undefined) {
    throw new Error("usePremium must be used within a PremiumProvider");
  }
  return context;
};
