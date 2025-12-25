import { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface PremiumContextType {
  isPremium: boolean;
  togglePremium: () => void;
  setPremium: (value: boolean) => void;
  showCelebration: boolean;
  triggerCelebration: () => void;
  completeCelebration: () => void;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export const PremiumProvider = ({ children }: { children: ReactNode }) => {
  const [isPremium, setIsPremiumState] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const togglePremium = () => setIsPremiumState((prev) => !prev);
  
  const triggerCelebration = useCallback(() => {
    setShowCelebration(true);
  }, []);

  const completeCelebration = useCallback(() => {
    setShowCelebration(false);
    setIsPremiumState(true);
  }, []);

  const setPremium = useCallback((value: boolean) => {
    if (value && !isPremium) {
      // Trigger celebration when upgrading to premium
      triggerCelebration();
    } else {
      setIsPremiumState(value);
    }
  }, [isPremium, triggerCelebration]);

  return (
    <PremiumContext.Provider value={{ 
      isPremium, 
      togglePremium, 
      setPremium, 
      showCelebration, 
      triggerCelebration, 
      completeCelebration 
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
