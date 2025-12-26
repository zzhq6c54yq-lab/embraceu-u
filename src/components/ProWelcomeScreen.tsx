import { useEffect, useState } from "react";
import { usePremium } from "@/hooks/usePremium";
import { Crown, Sparkles, Diamond, Star, Check, X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Sparkles, text: "Ad-free experience" },
  { icon: Diamond, text: "Premium gold theme" },
  { icon: Heart, text: "Unlimited gratitude entries" },
  { icon: Star, text: "Exclusive content access" },
];

const ProWelcomeScreen = () => {
  const { showCelebration, completeCelebration } = usePremium();
  const [phase, setPhase] = useState<"hidden" | "celebrating" | "welcome">("hidden");
  const [featuresVisible, setFeaturesVisible] = useState<number[]>([]);

  useEffect(() => {
    if (showCelebration) {
      // Wait for celebration animation to mostly finish, then show welcome
      const timer = setTimeout(() => {
        setPhase("welcome");
        // Stagger feature reveals
        features.forEach((_, index) => {
          setTimeout(() => {
            setFeaturesVisible(prev => [...prev, index]);
          }, 300 + index * 150);
        });
      }, 2500);

      return () => clearTimeout(timer);
    } else {
      setPhase("hidden");
      setFeaturesVisible([]);
    }
  }, [showCelebration]);

  const handleContinue = () => {
    completeCelebration();
    setPhase("hidden");
    setFeaturesVisible([]);
  };

  if (phase !== "welcome") return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/90 backdrop-blur-xl animate-fade-in"
        onClick={handleContinue}
      />
      
      {/* Welcome Card */}
      <div className="relative z-10 w-full max-w-md animate-premium-reveal">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card to-secondary/30 border border-accent/40 p-8">
          {/* Luxurious glow effects */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-accent/40 via-accent/20 to-transparent rounded-full blur-3xl animate-luxe-float" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-primary/30 via-accent/15 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
          
          {/* Close button */}
          <button 
            onClick={handleContinue}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          {/* Decorative elements */}
          <Diamond className="absolute top-6 left-6 w-4 h-4 text-accent/50 animate-sparkle-float" />
          <Sparkles className="absolute bottom-24 right-8 w-5 h-5 text-accent/40 animate-sparkle-float" style={{ animationDelay: "0.5s" }} />
          
          {/* Content */}
          <div className="relative z-10 text-center space-y-6">
            {/* Crown with luxe styling */}
            <div className="flex justify-center mb-2">
              <div className="w-24 h-24 rounded-full pro-icon-container flex items-center justify-center">
                <Crown className="w-12 h-12 text-accent-foreground pro-crown-luxe" />
              </div>
            </div>
            
            {/* Welcome text */}
            <div className="space-y-2">
              <h1 className="text-3xl font-serif font-bold premium-gold-text">
                Welcome to Pro
              </h1>
              <p className="text-muted-foreground font-serif italic">
                You've unlocked the full EmbraceU experience
              </p>
            </div>
            
            {/* Premium separator */}
            <div className="premium-separator" />
            
            {/* Features list */}
            <div className="space-y-4 text-left">
              <p className="text-sm text-center text-muted-foreground font-medium uppercase tracking-wider">
                Your new benefits
              </p>
              {features.map((feature, index) => (
                <div 
                  key={feature.text}
                  className={`
                    flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-accent/10 to-transparent
                    border border-accent/20 transition-all duration-500
                    ${featuresVisible.includes(index) 
                      ? "opacity-100 translate-x-0" 
                      : "opacity-0 -translate-x-4"
                    }
                  `}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center border border-accent/30">
                    <feature.icon className="w-5 h-5 text-accent" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{feature.text}</span>
                  <Check className="w-4 h-4 text-accent ml-auto" />
                </div>
              ))}
            </div>
            
            {/* Premium separator */}
            <div className="premium-separator" />
            
            {/* CTA Button */}
            <Button
              onClick={handleContinue}
              className="w-full btn-premium text-base py-6"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Exploring
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProWelcomeScreen;
