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
      <div className="fixed bottom-16 left-0 right-0 z-40 px-4 pb-2">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => setShowUpgrade(true)}
            className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/95 via-primary to-primary/90 border border-accent/30 py-3 px-4 flex items-center justify-between transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
          >
            {/* Glow effect */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-accent/20 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity" />
            <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-accent/15 rounded-full blur-2xl opacity-50" />
            
            {/* Left side - Icon & Text */}
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 text-accent-foreground" />
                <Sparkles className="w-2.5 h-2.5 text-accent-foreground absolute top-1 right-1" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-primary-foreground text-sm">
                  Upgrade to Pro
                </h3>
                <p className="text-primary-foreground/70 text-xs">
                  Go Ad-Free & Support the Dev! 🎁
                </p>
              </div>
            </div>
            
            {/* Right side - CTA Button */}
            <div className="relative z-10 px-4 py-2 rounded-full bg-gradient-to-r from-accent to-accent/80 text-accent-foreground text-xs font-semibold whitespace-nowrap shadow-md">
              Unlock for $0.99
            </div>
          </button>
        </div>
      </div>
      
      <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} />
    </>
  );
};

export default AdBanner;
