import { useState } from "react";
import { useLocation } from "react-router-dom";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import HelpDrawer from "./HelpDrawer";
import { getHelpContentForRoute } from "@/lib/helpContent";

interface HelpButtonProps {
  onReplayTour: () => void;
}

const HelpButton = ({ onReplayTour }: HelpButtonProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const location = useLocation();
  
  // Only show on pages that have help content
  const helpContent = getHelpContentForRoute(location.pathname);
  if (!helpContent) return null;

  return (
    <>
      <button
        onClick={() => setIsDrawerOpen(true)}
        className={cn(
          "fixed z-40 p-2 rounded-full transition-all duration-300",
          "bg-secondary/70 hover:bg-secondary text-muted-foreground hover:text-foreground",
          "shadow-md hover:shadow-lg",
          "right-4 bottom-[calc(70px+env(safe-area-inset-bottom,0px))]",
          "opacity-60 hover:opacity-100"
        )}
        aria-label="Help and tips"
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      <HelpDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onReplayTour={onReplayTour}
      />
    </>
  );
};

export default HelpButton;
