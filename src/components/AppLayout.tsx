import { ReactNode } from "react";
import BottomNav from "./BottomNav";
import AppHeader from "./AppHeader";
import AdBanner from "./AdBanner";
import { cn } from "@/lib/utils";
import { usePremium } from "@/hooks/usePremium";

interface AppLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showNav?: boolean;
  className?: string;
}

const AppLayout = ({ 
  children, 
  showHeader = true, 
  showNav = true,
  className 
}: AppLayoutProps) => {
  const { isPremium } = usePremium();
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {showHeader && <AppHeader />}
      <main 
        className={cn(
          "flex-1 px-4 animate-fade-in",
          !showHeader && "pt-4",
          isPremium ? "pb-24" : "pb-32", // Extra space for ad banner
          className
        )}
      >
        <div className="max-w-lg mx-auto w-full">
          {children}
        </div>
      </main>
      <AdBanner />
      {showNav && <BottomNav />}
    </div>
  );
};

export default AppLayout;
