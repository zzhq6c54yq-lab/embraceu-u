import { ReactNode, useState, useCallback } from "react";
import BottomNav from "./BottomNav";
import AppHeader from "./AppHeader";
import AdBanner from "./AdBanner";
import HelpButton from "./HelpButton";
import QuickActionsFAB from "./QuickActionsFAB";
import StreakCelebration from "./StreakCelebration";
import { cn } from "@/lib/utils";
import { usePremium } from "@/hooks/usePremium";
import { useStreakMilestones } from "@/hooks/useStreakMilestones";

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
  const { pendingMilestone, currentStreak, celebrateMilestone } = useStreakMilestones();
  const [tourKey, setTourKey] = useState(0);
  
  const handleReplayTour = useCallback(() => {
    setTourKey(prev => prev + 1);
    onReplayTour?.();
  }, [onReplayTour]);

  const handleCelebrationClose = () => {
    if (pendingMilestone) {
      celebrateMilestone(pendingMilestone);
    }
  };
  
  const bottomPadding = isPremium 
    ? "pb-[calc(60px+env(safe-area-inset-bottom,0px))]"
    : "pb-[calc(120px+env(safe-area-inset-bottom,0px))]";

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
      <QuickActionsFAB />
      <HelpButton onReplayTour={handleReplayTour} />
      {showNav && <BottomNav />}
      
      {/* Streak Celebration Modal */}
      <StreakCelebration
        isOpen={!!pendingMilestone}
        onClose={handleCelebrationClose}
        milestone={pendingMilestone || 7}
        currentStreak={currentStreak}
      />
    </div>
  );
};

export { type AppLayoutProps };
export default AppLayout;
