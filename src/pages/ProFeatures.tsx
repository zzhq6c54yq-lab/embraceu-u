import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { usePremium } from "@/hooks/usePremium";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import UpgradeModal from "@/components/UpgradeModal";
import { 
  Crown, 
  Mic, 
  Volume2, 
  Sparkles, 
  FileDown, 
  Layers, 
  Link2, 
  Palette, 
  BookOpen,
  Check,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";

const proFeatures = [
  {
    icon: Mic,
    title: "Voice Journaling",
    description: "Speak your thoughts and have them transcribed automatically",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Volume2,
    title: "Text-to-Speech",
    description: "Listen to insights and affirmations with soothing voice playback",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: Sparkles,
    title: "AI Personal Insights",
    description: "Get personalized recommendations based on your mood patterns",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    icon: FileDown,
    title: "PDF & CSV Export",
    description: "Download your progress, insights, and journal entries",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    icon: Layers,
    title: "Custom Rituals Builder",
    description: "Create personalized wellness routines with drag-and-drop",
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
  },
  {
    icon: Link2,
    title: "Duo Mode",
    description: "Connect with a partner and track shared streaks together",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
  },
  {
    icon: Palette,
    title: "Premium Themes",
    description: "Unlock exclusive themes to personalize your experience",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
  },
  {
    icon: BookOpen,
    title: "Exclusive Content",
    description: "Access premium insights, guides, and growth resources",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
];

const ProFeatures = () => {
  const { isPremium } = usePremium();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  return (
    <AppLayout>
      <div className="min-h-screen p-6 pb-24">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className={cn(
              "inline-flex items-center justify-center w-20 h-20 rounded-full mb-2",
              isPremium 
                ? "bg-gradient-to-br from-accent to-primary animate-glow-pulse" 
                : "bg-gradient-to-br from-primary/20 to-accent/20"
            )}>
              <Crown className={cn(
                "w-10 h-10",
                isPremium ? "text-primary-foreground" : "text-primary"
              )} />
            </div>
            
            {isPremium ? (
              <>
                <h1 className="text-3xl font-display font-bold text-foreground">
                  You're a Pro! ✨
                </h1>
                <p className="text-muted-foreground">
                  All features are unlocked. Enjoy your growth journey.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-display font-bold text-foreground">
                  Unlock Pro Features
                </h1>
                <p className="text-muted-foreground">
                  Supercharge your growth with premium tools
                </p>
              </>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid gap-4">
            {proFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index}
                  className={cn(
                    "transition-all duration-300",
                    isPremium 
                      ? "bg-card border-border/50" 
                      : "bg-card/50 border-border/30"
                  )}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                      feature.bgColor
                    )}>
                      <Icon className={cn("w-6 h-6", feature.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        {feature.title}
                        {isPremium ? (
                          <Check className="w-4 h-4 text-success-foreground" />
                        ) : (
                          <Lock className="w-3 h-3 text-muted-foreground" />
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {feature.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* CTA for non-premium */}
          {!isPremium && (
            <div className="sticky bottom-20 pt-4">
              <Button
                onClick={() => setShowUpgradeModal(true)}
                className="w-full btn-premium py-6 text-lg"
              >
                <Crown className="w-5 h-5 mr-2" />
                Upgrade to Pro
              </Button>
            </div>
          )}
        </div>
      </div>

      <UpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
    </AppLayout>
  );
};

export default ProFeatures;
