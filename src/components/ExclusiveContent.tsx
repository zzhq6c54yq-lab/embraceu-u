import { usePremium } from "@/hooks/usePremium";
import { Lock, Crown, Sparkles, Star, Heart, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExclusiveItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
}

const exclusiveContent: ExclusiveItem[] = [
  {
    id: "guided-meditations",
    title: "Premium Guided Meditations",
    description: "Deep relaxation sessions with exclusive soundscapes",
    icon: <Sparkles className="w-5 h-5" />,
    category: "Meditation",
  },
  {
    id: "affirmation-packs",
    title: "Luxury Affirmation Packs",
    description: "Curated affirmations for success and abundance",
    icon: <Star className="w-5 h-5" />,
    category: "Affirmations",
  },
  {
    id: "breath-techniques",
    title: "Advanced Breathwork",
    description: "Master-level breathing techniques for peak performance",
    icon: <Zap className="w-5 h-5" />,
    category: "Breathwork",
  },
  {
    id: "self-love-rituals",
    title: "Self-Love Rituals",
    description: "Daily rituals designed by wellness experts",
    icon: <Heart className="w-5 h-5" />,
    category: "Rituals",
  },
];

interface ExclusiveContentProps {
  onUpgradeClick?: () => void;
}

const ExclusiveContent = ({ onUpgradeClick }: ExclusiveContentProps) => {
  const { isPremium } = usePremium();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Crown className="w-5 h-5 text-accent" />
        <h3 className="font-serif text-lg">Exclusive Content</h3>
        {!isPremium && (
          <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="w-3 h-3" /> Pro Only
          </span>
        )}
      </div>

      <div className="space-y-3">
        {exclusiveContent.map((item) => (
          <div
            key={item.id}
            className={cn(
              "relative p-4 rounded-xl border transition-all duration-300",
              isPremium
                ? "border-accent/30 bg-gradient-to-br from-card/80 to-accent/5 hover:border-accent/50 cursor-pointer hover:scale-[1.01]"
                : "border-border bg-card/50"
            )}
          >
            <div className="flex items-start gap-4">
              {/* Icon Container */}
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                  isPremium
                    ? "bg-gradient-to-br from-accent/20 to-accent/10 text-accent"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {item.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "font-semibold",
                      isPremium ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {item.title}
                  </span>
                  {isPremium && (
                    <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-medium">
                      Unlocked
                    </span>
                  )}
                </div>
                <p
                  className={cn(
                    "text-sm mt-1",
                    isPremium ? "text-muted-foreground" : "text-muted-foreground/60"
                  )}
                >
                  {item.description}
                </p>
                <span className="text-xs text-accent/70 mt-2 inline-block">
                  {item.category}
                </span>
              </div>

              {/* Lock/Access indicator */}
              {!isPremium && (
                <div className="shrink-0">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Locked overlay for non-premium */}
            {!isPremium && (
              <div
                className="absolute inset-0 rounded-xl bg-background/30 backdrop-blur-[1px] flex items-center justify-center cursor-pointer hover:bg-background/40 transition-colors"
                onClick={onUpgradeClick}
              >
                <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Lock className="w-4 h-4" />
                  Upgrade to unlock
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {isPremium && (
        <p className="text-center text-sm text-muted-foreground mt-6 font-serif italic">
          Enjoy your exclusive Pro content
        </p>
      )}
    </div>
  );
};

export default ExclusiveContent;
