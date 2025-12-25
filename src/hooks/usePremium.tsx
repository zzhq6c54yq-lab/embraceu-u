import { createContext, useContext, useState, ReactNode } from "react";

interface PremiumContextType {
  isPremium: boolean;
  togglePremium: () => void;
  setPremium: (value: boolean) => void;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export const PremiumProvider = ({ children }: { children: ReactNode }) => {
  const [isPremium, setIsPremium] = useState(false);

  const togglePremium = () => setIsPremium((prev) => !prev);
  const setPremium = (value: boolean) => setIsPremium(value);

  return (
    <PremiumContext.Provider value={{ isPremium, togglePremium, setPremium }}>
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
