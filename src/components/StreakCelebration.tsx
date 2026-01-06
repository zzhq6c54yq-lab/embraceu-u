import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Flame, Star, Trophy, Sun, Calendar, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StreakCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  milestone: number;
  currentStreak: number;
}

const milestoneConfig: Record<number, {
  title: string;
  subtitle: string;
  icon: typeof Flame;
  color: string;
  bgGradient: string;
}> = {
  7: {
    title: "One Week Wonder!",
    subtitle: "7 days of consistent growth",
    icon: Flame,
    color: "text-orange-500",
    bgGradient: "from-orange-500/20 to-yellow-500/20",
  },
  14: {
    title: "Two Week Champion!",
    subtitle: "14 days of dedication",
    icon: Calendar,
    color: "text-blue-500",
    bgGradient: "from-blue-500/20 to-cyan-500/20",
  },
  30: {
    title: "Monthly Master!",
    subtitle: "30 days of transformation",
    icon: Star,
    color: "text-purple-500",
    bgGradient: "from-purple-500/20 to-pink-500/20",
  },
  60: {
    title: "60 Day Devotee!",
    subtitle: "Two months of commitment",
    icon: Trophy,
    color: "text-amber-500",
    bgGradient: "from-amber-500/20 to-orange-500/20",
  },
  100: {
    title: "Century Soul!",
    subtitle: "100 days of growth",
    icon: Star,
    color: "text-yellow-500",
    bgGradient: "from-yellow-400/20 to-amber-500/20",
  },
  365: {
    title: "Year of Growth!",
    subtitle: "365 days of transformation",
    icon: Sun,
    color: "text-pink-500",
    bgGradient: "from-pink-500/20 to-rose-500/20",
  },
};

const StreakCelebration = ({
  isOpen,
  onClose,
  milestone,
  currentStreak,
}: StreakCelebrationProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const config = milestoneConfig[milestone] || milestoneConfig[7];
  const Icon = config.icon;

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${milestone}-Day Streak!`,
        text: `I just hit a ${milestone}-day streak on EmbraceU! 🔥`,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm border-0 overflow-hidden">
        {/* Animated background */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-50",
          config.bgGradient
        )} />

        {/* Confetti effect */}
        {showConfetti && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: "-10px",
                  backgroundColor: ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"][i % 5],
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        )}

        <div className="relative z-10 text-center py-6">
          {/* Icon with glow */}
          <div className={cn(
            "w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center",
            "animate-pulse-soft",
            config.bgGradient.replace("to-", "via-").replace("/20", "/30")
          )}>
            <Icon className={cn("w-12 h-12", config.color)} />
          </div>

          {/* Title */}
          <h2 className="font-serif italic text-3xl text-foreground mb-2">
            {config.title}
          </h2>
          <p className="text-muted-foreground mb-6">{config.subtitle}</p>

          {/* Streak display */}
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-card border border-border mb-6">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-2xl font-bold text-foreground">{currentStreak}</span>
            <span className="text-muted-foreground">day streak</span>
          </div>

          {/* Message */}
          <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
            Your dedication is inspiring. Keep nurturing your growth—you're creating lasting change.
          </p>

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={handleShare}
              className="flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button onClick={onClose} className="btn-embrace">
              Keep Going
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StreakCelebration;
