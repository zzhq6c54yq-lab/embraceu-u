import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface PremiumContextType {
  isPremium: boolean;
  isLoading: boolean;
  subscriptionEnd: string | null;
  togglePremium: () => void;
  setPremium: (value: boolean) => void;
  showCelebration: boolean;
  triggerCelebration: () => void;
  completeCelebration: () => void;
  checkSubscription: () => Promise<void>;
  openCustomerPortal: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export const PremiumProvider = ({ children }: { children: ReactNode }) => {
  const { user, session } = useAuth();
  const [isPremium, setIsPremiumState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasCheckedInitially, setHasCheckedInitially] = useState(false);

  const triggerCelebration = useCallback(() => {
    setShowCelebration(true);
  }, []);

  const completeCelebration = useCallback(() => {
    setShowCelebration(false);
    setIsPremiumState(true);
  }, []);

  const checkSubscription = useCallback(async () => {
    if (!session?.access_token) {
      setIsPremiumState(false);
      setSubscriptionEnd(null);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }

      const wasNotPremium = !isPremium;
      const isNowPremium = data?.subscribed === true;

      if (wasNotPremium && isNowPremium && hasCheckedInitially) {
        // User just upgraded - trigger celebration
        triggerCelebration();
      } else {
        setIsPremiumState(isNowPremium);
      }

      setSubscriptionEnd(data?.subscription_end || null);
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setIsLoading(false);
      setHasCheckedInitially(true);
    }
  }, [session?.access_token, isPremium, hasCheckedInitially, triggerCelebration]);

  const openCustomerPortal = useCallback(async () => {
    if (!session?.access_token) return;

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error opening customer portal:', error);
        return;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
    }
  }, [session?.access_token]);

  // Check subscription on auth state change
  useEffect(() => {
    if (user && session) {
      checkSubscription();
    } else {
      setIsPremiumState(false);
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
      // Check subscription after successful checkout
      setTimeout(() => {
        checkSubscription();
      }, 2000); // Wait 2 seconds for Stripe to process
    }
  }, [checkSubscription]);

  const togglePremium = () => setIsPremiumState((prev) => !prev);
  
  const setPremium = useCallback((value: boolean) => {
    if (value && !isPremium) {
      triggerCelebration();
    } else {
      setIsPremiumState(value);
    }
  }, [isPremium, triggerCelebration]);

  return (
    <PremiumContext.Provider value={{ 
      isPremium, 
      isLoading,
      subscriptionEnd,
      togglePremium, 
      setPremium, 
      showCelebration, 
      triggerCelebration, 
      completeCelebration,
      checkSubscription,
      openCustomerPortal,
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
