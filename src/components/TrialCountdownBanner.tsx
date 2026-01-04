import { Crown, Sparkles } from "lucide-react";
import { usePremium } from "@/hooks/usePremium";

const TrialCountdownBanner = () => {
  const { isTrial, trialDaysRemaining } = usePremium();

  if (!isTrial || trialDaysRemaining === null) return null;

  const getMessage = () => {
    if (trialDaysRemaining === 0) {
      return "Last day of your Pro trial!";
    } else if (trialDaysRemaining === 1) {
      return "1 day left of your Pro trial";
    } else {
      return `${trialDaysRemaining} days left of your Pro trial`;
    }
  };

  const isUrgent = trialDaysRemaining <= 1;

  return (
    <div 
      className={`relative overflow-hidden rounded-2xl border p-4 mb-6 ${
        isUrgent 
          ? "bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/20 border-amber-500/30" 
          : "bg-gradient-to-r from-accent/20 via-primary/15 to-accent/20 border-accent/30"
      }`}
    >
      {/* Decorative sparkles */}
      <Sparkles className="absolute top-2 right-2 w-4 h-4 text-accent/40 animate-pulse" />
      
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isUrgent ? "bg-amber-500/20" : "bg-accent/20"
        }`}>
          <Crown className={`w-5 h-5 ${isUrgent ? "text-amber-500" : "text-accent"}`} />
        </div>
        
        <div className="flex-1">
          <p className="font-semibold text-foreground">
            {getMessage()}
          </p>
          <p className="text-xs text-muted-foreground">
            {isUrgent 
              ? "Subscribe now to keep your Pro features" 
              : "Enjoying Pro? Subscribe anytime to keep access"
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrialCountdownBanner;
