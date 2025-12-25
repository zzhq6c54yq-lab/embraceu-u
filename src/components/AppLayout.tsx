import { ReactNode } from "react";
import BottomNav from "./BottomNav";
import AppHeader from "./AppHeader";
import { cn } from "@/lib/utils";

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
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {showHeader && <AppHeader />}
      <main 
        className={cn(
          "flex-1 px-4 pb-24 animate-fade-in",
          !showHeader && "pt-4",
          className
        )}
      >
        <div className="max-w-lg mx-auto w-full">
          {children}
        </div>
      </main>
      {showNav && <BottomNav />}
    </div>
  );
};

export default AppLayout;
