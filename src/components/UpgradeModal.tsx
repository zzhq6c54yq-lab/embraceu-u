import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePremium } from "@/hooks/usePremium";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Crown, Check, Sparkles, Diamond, Loader2, RefreshCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const features = [
  "Ad-free experience",
  "Premium gold theme accents",
  "Priority support",
  "Exclusive content",
  "Unlimited gratitude entries",
];

const UpgradeModal = ({ open, onOpenChange }: UpgradeModalProps) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const { checkSubscription } = usePremium();
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      // Get fresh session to ensure token is valid
      const { data: { session: freshSession } } = await supabase.auth.getSession();
      
      if (!freshSession?.access_token) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to upgrade to Pro.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout');

      if (error) {
        throw error;
      }

      if (data?.url) {
        // Redirect to Stripe Checkout (more reliable than popup)
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-transparent border-0 backdrop-blur-xl max-w-sm mx-auto p-0 overflow-visible">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card to-secondary/50 border border-accent/30 p-8">
          {/* Luxurious ambient glow effects */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-accent/30 via-accent/15 to-transparent rounded-full blur-3xl animate-luxe-float" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-primary/20 via-accent/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-accent/5 to-transparent opacity-50" />
          
          {/* Decorative corner diamonds */}
          <Diamond className="absolute top-4 left-4 w-3 h-3 text-accent/40 animate-sparkle-float" />
          <Diamond className="absolute top-4 right-4 w-3 h-3 text-accent/40 animate-sparkle-float" style={{ animationDelay: '0.5s' }} />
          <Sparkles className="absolute bottom-20 right-6 w-4 h-4 text-accent/30 animate-sparkle-float" style={{ animationDelay: '1s' }} />
          
          <DialogHeader className="relative z-10">
            {/* Crown container with luxe styling */}
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 rounded-full pro-icon-container flex items-center justify-center">
                <Crown className="w-10 h-10 text-accent-foreground pro-crown-luxe" />
              </div>
            </div>
            
            <DialogTitle className="text-center font-serif text-3xl premium-gold-text">
              Upgrade to Pro
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground font-serif italic mt-2">
              Unlock the full EmbraceU experience
            </DialogDescription>
          </DialogHeader>

          {/* Premium separator */}
          <div className="premium-separator my-6" />

          <div className="relative z-10 space-y-4">
            {features.map((feature, index) => (
              <div 
                key={feature} 
                className="flex items-center gap-4 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center border border-accent/30 group-hover:scale-110 transition-transform">
                  <Check className="w-3.5 h-3.5 text-accent" />
                </div>
                <span className="text-sm text-foreground font-medium">{feature}</span>
              </div>
            ))}
          </div>

          {/* Premium separator */}
          <div className="premium-separator my-6" />

          <div className="relative z-10 text-center">
            <div className="mb-6">
              <span className="text-4xl font-bold premium-gold-text">$0.99</span>
              <span className="text-muted-foreground ml-1">/month</span>
            </div>
            
            <Button
              onClick={handleUpgrade}
              disabled={isLoading}
              className="w-full btn-premium text-base py-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Crown className="w-5 h-5 mr-2" />
                  Upgrade Now
                </>
              )}
            </Button>
            
            <button
              onClick={() => onOpenChange(false)}
              className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Maybe later
            </button>

            {/* Restore Purchases - Required by Apple */}
            <button
              onClick={async () => {
                setIsRestoring(true);
                await checkSubscription();
                setIsRestoring(false);
                toast({ title: 'Checked', description: 'Subscription status verified' });
              }}
              disabled={isRestoring}
              className="mt-3 text-[10px] text-muted-foreground/60 hover:text-muted-foreground transition-colors flex items-center justify-center gap-1 mx-auto"
            >
              {isRestoring ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCcw className="w-3 h-3" />
              )}
              Restore Purchases
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
