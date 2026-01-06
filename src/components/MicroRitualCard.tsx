import { useState } from "react";
import { Check, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface MicroRitualCardProps {
  id: string;
  name: string;
  description: string;
  duration: string;
  icon: React.ReactNode;
  color: string;
  onStart: () => void;
}

const MicroRitualCard = ({
  id,
  name,
  description,
  duration,
  icon,
  color,
  onStart,
}: MicroRitualCardProps) => {
  const { user } = useAuth();
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    if (!user) {
      toast.error("Sign in to track rituals");
      return;
    }

    setIsLoading(true);
    try {
      await supabase.from("rituals_completed").insert({
        user_id: user.id,
        ritual_type: `micro_${id}`,
        duration_seconds: parseInt(duration) || 30,
      });

      setIsCompleted(true);
      toast.success(`${name} complete!`);
    } catch (error) {
      toast.error("Failed to log ritual");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "card-embrace p-4 transition-all duration-300",
        isCompleted && "ring-2 ring-success-foreground bg-success/10"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center",
          color
        )}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-serif italic text-foreground text-lg">{name}</h4>
          <p className="text-xs text-muted-foreground">{duration} • {description}</p>
        </div>
        <button
          onClick={isCompleted ? undefined : onStart}
          disabled={isCompleted || isLoading}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all",
            isCompleted 
              ? "bg-success-foreground/20" 
              : "bg-primary/10 hover:bg-primary/20"
          )}
        >
          {isCompleted ? (
            <Check className="w-5 h-5 text-success-foreground" />
          ) : (
            <Play className="w-5 h-5 text-primary" />
          )}
        </button>
      </div>
    </div>
  );
};

export default MicroRitualCard;
