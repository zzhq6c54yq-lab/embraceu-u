import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Sparkles, Brain, HeartHandshake, Users, TrendingUp, ArrowRight, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ChallengeTemplate {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon_name: string;
  color: string;
}

interface ChallengeLibraryCardProps {
  template: ChallengeTemplate;
}

const iconMap: Record<string, React.ElementType> = {
  Heart,
  Sparkles,
  Brain,
  HeartHandshake,
  Users,
  TrendingUp,
};

const colorMap: Record<string, string> = {
  rose: "from-rose-500/20 to-rose-600/10 border-rose-500/30",
  amber: "from-amber-500/20 to-amber-600/10 border-amber-500/30",
  cyan: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30",
  pink: "from-pink-500/20 to-pink-600/10 border-pink-500/30",
  violet: "from-violet-500/20 to-violet-600/10 border-violet-500/30",
  emerald: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30",
};

const iconColorMap: Record<string, string> = {
  rose: "text-rose-500",
  amber: "text-amber-500",
  cyan: "text-cyan-500",
  pink: "text-pink-500",
  violet: "text-violet-500",
  emerald: "text-emerald-500",
};

const ChallengeLibraryCard = ({ template }: ChallengeLibraryCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [completedCount, setCompletedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const Icon = iconMap[template.icon_name] || Heart;
  const gradientClass = colorMap[template.color] || colorMap.rose;
  const iconColorClass = iconColorMap[template.color] || iconColorMap.rose;

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("challenge_progress")
        .select("day_number")
        .eq("user_id", user.id)
        .eq("template_id", template.id);

      if (!error && data) {
        setCompletedCount(data.length);
      }
      setIsLoading(false);
    };

    fetchProgress();
  }, [user, template.id]);

  const progressPercentage = (completedCount / 30) * 100;
  const isCompleted = completedCount === 30;
  const hasStarted = completedCount > 0;

  return (
    <div
      className={cn(
        "p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer",
        "bg-gradient-to-br",
        gradientClass
      )}
      onClick={() => navigate(`/challenges/${template.slug}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", "bg-background/50")}>
          <Icon className={cn("w-6 h-6", iconColorClass)} />
        </div>
        {isCompleted && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
            <Check className="w-3 h-3" />
            Completed
          </div>
        )}
      </div>

      {/* Content */}
      <h3 className="font-display font-semibold text-lg text-foreground mb-2">
        {template.name}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {template.description}
      </p>

      {/* Progress */}
      {!isLoading && (
        <>
          {hasStarted ? (
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium text-foreground">{completedCount}/30 days</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mb-4">30-day challenge</p>
          )}
        </>
      )}

      {/* Action */}
      <Button
        variant={hasStarted ? "default" : "outline"}
        className="w-full gap-2"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/challenges/${template.slug}`);
        }}
      >
        {isCompleted ? "View Journey" : hasStarted ? "Continue" : "Start Challenge"}
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

export { ChallengeLibraryCard };
export default ChallengeLibraryCard;
