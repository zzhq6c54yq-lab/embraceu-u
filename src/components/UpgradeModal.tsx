import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePremium } from "@/hooks/usePremium";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Crown, Check, Sparkles, Diamond, Loader2, RefreshCcw, Infinity, Zap, Calendar, Tag, Gift, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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

type PlanType = 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'lifetime';

const VALID_PROMO_CODES = ['MTSTRONG100'];

const UpgradeModal = ({ open, onOpenChange }: UpgradeModalProps) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const { checkSubscription, activateTrial } = usePremium();
  const [isLoading, setIsLoading] = useState(false);
  const [isActivatingTrial, setIsActivatingTrial] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('weekly');
  const [promoCode, setPromoCode] = useState('');
  const [showPromoInput, setShowPromoInput] = useState(false);

  const isValidPromo = VALID_PROMO_CODES.includes(promoCode.toUpperCase().trim());

  const handleActivateTrial = async () => {
    setIsActivatingTrial(true);
    try {
      const { data: { session: freshSession } } = await supabase.auth.getSession();
      
      if (!freshSession?.access_token) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to start your free trial.",
          variant: "destructive",
        });
        setIsActivatingTrial(false);
        return;
      }

      const result = await activateTrial(promoCode.toUpperCase().trim());
      
      if (result.success) {
        toast({
          title: "Welcome to Pro! 🎉",
          description: "Your 7-day free trial is now active. Enjoy all Pro features!",
        });
        onOpenChange(false);
      } else {
        // Check for specific error messages from the API
        const errorMessage = result.error || "Please try again.";
        const isAlreadyUsed = errorMessage.toLowerCase().includes('already used') || 
                              errorMessage.toLowerCase().includes('already have');
        
        toast({
          title: isAlreadyUsed ? "Trial Already Used" : "Could not activate trial",
          description: isAlreadyUsed 
            ? "You've already used a free trial. Upgrade to Pro to continue!" 
            : errorMessage,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error activating trial:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to activate trial. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsActivatingTrial(false);
    }
  };

  const handleUpgrade = async (plan: PlanType) => {
    setIsLoading(true);
    try {
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

      const functionMap: Record<PlanType, string> = {
        weekly: 'create-checkout',
        monthly: 'create-checkout',
        quarterly: 'create-bundle-checkout',
        yearly: 'create-yearly-checkout',
        lifetime: 'create-lifetime-checkout',
      };
      
      const functionName = functionMap[plan];
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { planType: plan }
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
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

  const getPlanButtonText = () => {
    if (isLoading) {
      return (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Loading...
        </>
      );
    }
    
    switch (selectedPlan) {
      case 'lifetime':
        return (
          <>
            <Infinity className="w-5 h-5 mr-2" />
            Get Lifetime Access - $99.99
          </>
        );
      case 'yearly':
        return (
          <>
            <Calendar className="w-5 h-5 mr-2" />
            Subscribe - $49.99/year
          </>
        );
      case 'quarterly':
        return (
          <>
            <Calendar className="w-5 h-5 mr-2" />
            Get 3-Month Access - $12.99
          </>
        );
      case 'monthly':
        return (
          <>
            <Crown className="w-5 h-5 mr-2" />
            Subscribe - $4.99/month
          </>
        );
      default:
        return (
          <>
            <Crown className="w-5 h-5 mr-2" />
            {isValidPromo ? 'Get 1 Week FREE!' : 'Subscribe - $1.99/week'}
          </>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-transparent border-0 backdrop-blur-xl max-w-md mx-auto p-0 max-h-[90vh] overflow-y-auto">
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

          {/* Plan Selection - 5 tiers */}
          <div className="relative z-10 space-y-3 mb-6">
            {/* Weekly Plan */}
            <button
              onClick={() => setSelectedPlan('weekly')}
              className={cn(
                "w-full relative p-4 rounded-2xl border-2 transition-all duration-300 text-left flex items-center justify-between",
                selectedPlan === 'weekly'
                  ? "border-accent bg-accent/10"
                  : "border-border/50 bg-card/50 hover:border-border"
              )}
            >
              <div className="absolute -top-2 right-4 px-2 py-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full">
                <span className="text-[10px] font-bold text-white uppercase tracking-wide">Try It</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-foreground block">Weekly</span>
                  <span className="text-xs text-muted-foreground">Try Pro risk-free</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-foreground">$1.99</span>
                <span className="text-xs text-muted-foreground">/week</span>
              </div>
            </button>

            {/* Monthly Plan */}
            <button
              onClick={() => setSelectedPlan('monthly')}
              className={cn(
                "w-full relative p-4 rounded-2xl border-2 transition-all duration-300 text-left flex items-center justify-between",
                selectedPlan === 'monthly'
                  ? "border-accent bg-accent/10"
                  : "border-border/50 bg-card/50 hover:border-border"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-foreground block">Monthly</span>
                  <span className="text-xs text-muted-foreground">Flexible billing</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-foreground">$4.99</span>
                <span className="text-xs text-muted-foreground">/mo</span>
              </div>
            </button>

            {/* Quarterly Bundle */}
            <button
              onClick={() => setSelectedPlan('quarterly')}
              className={cn(
                "w-full relative p-4 rounded-2xl border-2 transition-all duration-300 text-left flex items-center justify-between",
                selectedPlan === 'quarterly'
                  ? "border-accent bg-accent/10"
                  : "border-border/50 bg-card/50 hover:border-border"
              )}
            >
              <div className="absolute -top-2 right-4 px-2 py-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full">
                <span className="text-[10px] font-bold text-white uppercase tracking-wide">Save 13%</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-foreground block">Quarterly</span>
                  <span className="text-xs text-muted-foreground">~$4.33/month</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-foreground">$12.99</span>
                <span className="text-xs text-muted-foreground"> once</span>
              </div>
            </button>

            {/* Yearly Plan */}
            <button
              onClick={() => setSelectedPlan('yearly')}
              className={cn(
                "w-full relative p-4 rounded-2xl border-2 transition-all duration-300 text-left flex items-center justify-between",
                selectedPlan === 'yearly'
                  ? "border-accent bg-accent/10"
                  : "border-border/50 bg-card/50 hover:border-border"
              )}
            >
              <div className="absolute -top-2 right-4 px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                <span className="text-[10px] font-bold text-white uppercase tracking-wide">Save 17%</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-foreground block">Yearly</span>
                  <span className="text-xs text-muted-foreground">~$4.17/month</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-foreground">$49.99</span>
                <span className="text-xs text-muted-foreground">/year</span>
              </div>
            </button>

            {/* Lifetime Plan */}
            <button
              onClick={() => setSelectedPlan('lifetime')}
              className={cn(
                "w-full relative p-4 rounded-2xl border-2 transition-all duration-300 text-left flex items-center justify-between",
                selectedPlan === 'lifetime'
                  ? "border-accent bg-accent/10"
                  : "border-border/50 bg-card/50 hover:border-border"
              )}
            >
              <div className="absolute -top-2 right-4 px-2 py-0.5 bg-gradient-to-r from-accent to-primary rounded-full">
                <span className="text-[10px] font-bold text-accent-foreground uppercase tracking-wide">Best Value</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                  <Infinity className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-foreground block">Lifetime</span>
                  <span className="text-xs text-muted-foreground">Pay once, own forever</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-foreground">$99.99</span>
                <span className="text-xs text-muted-foreground"> once</span>
              </div>
            </button>
          </div>

          {/* Promo Code Section */}
          <div className="relative z-10 mb-4">
            <button
              onClick={() => setShowPromoInput(!showPromoInput)}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Tag className="w-3.5 h-3.5" />
              Have a promo code?
            </button>
            
            {showPromoInput && (
              <div className="mt-3 space-y-3">
                <div className="relative flex-1">
                  <Input
                    placeholder="Enter code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className={cn(
                      "text-sm uppercase",
                      isValidPromo && "border-green-500 bg-green-500/10"
                    )}
                  />
                  {isValidPromo && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-green-500">
                      <Gift className="w-4 h-4" />
                      <span className="text-xs font-semibold">7 Days FREE!</span>
                    </div>
                  )}
                </div>
                
                {isValidPromo && (
                  <Button
                    onClick={handleActivateTrial}
                    disabled={isActivatingTrial}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                  >
                    {isActivatingTrial ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Activating...
                      </>
                    ) : (
                      <>
                        <Gift className="w-4 h-4 mr-2" />
                        Start 7-Day Free Trial - No Card Required
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="relative z-10 space-y-3">
            {features.map((feature, index) => (
              <div 
                key={feature} 
                className="flex items-center gap-3 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center border border-accent/30 group-hover:scale-110 transition-transform">
                  <Check className="w-3 h-3 text-accent" />
                </div>
                <span className="text-sm text-foreground">{feature}</span>
              </div>
            ))}
          </div>

          {/* Premium separator */}
          <div className="premium-separator my-6" />

          <div className="relative z-10 text-center">
            <Button
              onClick={() => handleUpgrade(selectedPlan)}
              disabled={isLoading}
              className="w-full btn-premium text-base py-6"
            >
              {getPlanButtonText()}
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
