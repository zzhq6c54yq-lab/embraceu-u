import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePremium } from "@/hooks/usePremium";
import { Crown, Check, X } from "lucide-react";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const features = [
  "Ad-free experience",
  "Premium gold theme accents",
  "Priority support",
  "Exclusive content",
];

const UpgradeModal = ({ open, onOpenChange }: UpgradeModalProps) => {
  const { setPremium } = usePremium();

  const handleUpgrade = () => {
    // In production, this would trigger payment flow
    setPremium(true);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-transparent border-white/10 backdrop-blur-xl max-w-sm mx-auto">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card/95 via-card/90 to-secondary/80 border border-accent/20 p-6">
          {/* Gold glow effect */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
          
          <DialogHeader className="relative z-10">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center shadow-pro-glow animate-pro-glow">
                <Crown className="w-8 h-8 text-accent-foreground" />
              </div>
            </div>
            <DialogTitle className="text-center font-serif text-2xl">
              Upgrade to Pro
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground font-serif italic">
              Unlock the full EmbraceU experience
            </DialogDescription>
          </DialogHeader>

          <div className="relative z-10 mt-6 space-y-3">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-accent" />
                </div>
                <span className="text-sm text-foreground">{feature}</span>
              </div>
            ))}
          </div>

          <div className="relative z-10 mt-8 text-center">
            <div className="mb-4">
              <span className="text-3xl font-bold text-foreground">$0.99</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            
            <Button
              onClick={handleUpgrade}
              className="w-full btn-premium"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade Now
            </Button>
            
            <button
              onClick={() => onOpenChange(false)}
              className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
