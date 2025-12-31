import { Award, Lock, Flame, Crown, Smile, Heart, Sparkles, Shield, Lightbulb, Users, Footprints } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBadges } from "@/hooks/useBadges";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  footprints: Footprints,
  flame: Flame,
  crown: Crown,
  smile: Smile,
  heart: Heart,
  sparkles: Sparkles,
  shield: Shield,
  lightbulb: Lightbulb,
  users: Users,
  award: Award,
};

export const AchievementBadges = () => {
  const { badges, getEarnedBadge, isLoading } = useBadges();

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-xl bg-muted animate-pulse"
          />
        ))}
      </div>
    );
  }

  const getIcon = (iconName: string) => {
    return iconMap[iconName] || Award;
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      {badges.map((badge) => {
        const earned = getEarnedBadge(badge.id);
        const Icon = getIcon(badge.icon_name);

        return (
          <Tooltip key={badge.id}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "aspect-square rounded-xl flex flex-col items-center justify-center p-2 transition-all",
                  earned
                    ? "bg-primary/10 border-2 border-primary shadow-lg"
                    : "bg-muted/50 border border-border opacity-50"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center mb-1",
                    earned ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}
                >
                  {earned ? (
                    <Icon className="w-5 h-5" />
                  ) : (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs text-center font-medium line-clamp-2",
                    earned ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {badge.name}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">{badge.name}</p>
              <p className="text-xs text-muted-foreground">
                {badge.description}
              </p>
              {earned && (
                <p className="text-xs text-primary mt-1">
                  Earned {new Date(earned.earned_at).toLocaleDateString()}
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
};
