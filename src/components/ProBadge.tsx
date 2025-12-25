import { usePremium } from "@/hooks/usePremium";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProBadgeProps {
  className?: string;
  showGlow?: boolean;
}

const ProBadge = ({ className, showGlow = true }: ProBadgeProps) => {
  const { isPremium } = usePremium();

  if (!isPremium) return null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider",
        "bg-gradient-to-r from-accent to-accent/80 text-accent-foreground",
        showGlow && "animate-pro-glow shadow-pro-glow",
        className
      )}
    >
      <Crown className="w-3 h-3" />
      <span>Pro</span>
    </div>
  );
};

export default ProBadge;
