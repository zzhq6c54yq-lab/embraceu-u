import { usePremium } from "@/hooks/usePremium";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProBadgeProps {
  className?: string;
  showGlow?: boolean;
  size?: "sm" | "default" | "lg";
}

const ProBadge = ({ className, showGlow = true, size = "default" }: ProBadgeProps) => {
  const { isPremium } = usePremium();

  if (!isPremium) return null;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    default: "px-3 py-1.5 text-xs gap-1.5",
    lg: "px-4 py-2 text-sm gap-2"
  };

  const iconSizes = {
    sm: "w-2.5 h-2.5",
    default: "w-3.5 h-3.5",
    lg: "w-4 h-4"
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full font-bold uppercase tracking-[0.2em]",
        "pro-badge-luxe text-accent-foreground",
        showGlow && "animate-pro-glow",
        sizeClasses[size],
        className
      )}
    >
      <Crown className={cn(iconSizes[size], "pro-crown-luxe")} />
      <span className="relative">Pro</span>
    </div>
  );
};

export default ProBadge;
