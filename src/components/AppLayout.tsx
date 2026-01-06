import { ReactNode, useState, useCallback } from "react";
import BottomNav from "./BottomNav";
import AppHeader from "./AppHeader";
import AdBanner from "./AdBanner";
import HelpButton from "./HelpButton";
import { cn } from "@/lib/utils";
import { usePremium } from "@/hooks/usePremium";

interface AppLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showNav?: boolean;
  className?: string;
  onReplayTour?: () => void;
}

const AppLayout = ({ 
  children, 
  showHeader = true, 
  showNav = true,
  className,
  onReplayTour
}: AppLayoutProps) => {
  const { isPremium } = usePremium();
  const [tourKey, setTourKey] = useState(0);
  
  const handleReplayTour = useCallback(() => {
    setTourKey(prev => prev + 1);
    onReplayTour?.();
  }, [onReplayTour]);
  
  // Calculate bottom padding based on nav + ad banner + safe area
  // Nav: ~52px, Ad banner: ~60px (when shown), safe area: variable
  const bottomPadding = isPremium 
    ? "pb-[calc(60px+env(safe-area-inset-bottom,0px))]" // Just nav
    : "pb-[calc(120px+env(safe-area-inset-bottom,0px))]"; // Nav + ad banner

  return (
    <div className={cn(
      "min-h-screen bg-background flex flex-col relative",
      isPremium && "theme-premium premium-ambient-glow"
    )}>
      {showHeader && <AppHeader />}
      <main 
        className={cn(
          "flex-1 px-3 sm:px-4 animate-fade-in relative z-10",
          !showHeader && "pt-4",
          bottomPadding,
          className
        )}
      >
        <div className="max-w-lg mx-auto w-full">
          {children}
        </div>
      </main>
      <AdBanner />
      <HelpButton onReplayTour={handleReplayTour} />
      {showNav && <BottomNav />}
    </div>
  );
};

export { type AppLayoutProps };
export default AppLayout;
