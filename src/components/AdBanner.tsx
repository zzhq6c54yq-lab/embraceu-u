import { usePremium } from "@/hooks/usePremium";
import { useState } from "react";
import { Shield, Sparkles } from "lucide-react";
import UpgradeModal from "./UpgradeModal";

const AdBanner = () => {
  const { isPremium } = usePremium();
  const [showUpgrade, setShowUpgrade] = useState(false);

  if (isPremium) return null;

  return (
    <>
      {/* Position above bottom nav with safe area consideration */}
      <div 
        className="fixed left-0 right-0 z-40 px-3 sm:px-4 pb-1 sm:pb-2"
        style={{ bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => setShowUpgrade(true)}
            className="w-full group relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary/95 via-primary to-primary/90 border border-accent/30 py-2.5 sm:py-3 px-3 sm:px-4 flex items-center justify-between transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
          >
            {/* Glow effect */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-accent/20 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity" />
            <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-accent/15 rounded-full blur-2xl opacity-50" />
            
            {/* Left side - Icon & Text */}
            <div className="relative z-10 flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center shadow-lg flex-shrink-0">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-accent-foreground" />
                <Sparkles className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-accent-foreground absolute top-0.5 right-0.5 sm:top-1 sm:right-1" />
              </div>
              <div className="text-left min-w-0">
                <h3 className="font-semibold text-primary-foreground text-xs sm:text-sm">
                  Upgrade to Pro
                </h3>
                <p className="text-primary-foreground/70 text-[10px] sm:text-xs truncate">
                  Go Ad-Free & Support the Dev! 🎁
                </p>
              </div>
            </div>
            
            {/* Right side - CTA Button */}
            <div className="relative z-10 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-accent to-accent/80 text-accent-foreground text-[10px] sm:text-xs font-semibold whitespace-nowrap shadow-md flex-shrink-0">
              $0.99/week
            </div>
          </button>
        </div>
      </div>
      
      <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} />
    </>
  );
};

export default AdBanner;
