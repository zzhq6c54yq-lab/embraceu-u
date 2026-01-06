import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WellnessScoreProps {
  className?: string;
}

interface ScoreBreakdown {
  moodConsistency: number;
  ritualEngagement: number;
  streakMaintenance: number;
  gratitudeEntries: number;
  patternWork: number;
  coachUsage: number;
}

const getTier = (score: number): { label: string; color: string } => {
  if (score >= 76) return { label: "Wellness Master", color: "text-yellow-500" };
  if (score >= 51) return { label: "Thriving", color: "text-green-500" };
  if (score >= 26) return { label: "Building Momentum", color: "text-blue-500" };
  return { label: "Getting Started", color: "text-muted-foreground" };
};

const WeeklyWellnessScore = ({ className }: WellnessScoreProps) => {
  const { user } = useAuth();
  const [score, setScore] = useState(0);
  const [previousScore, setPreviousScore] = useState(0);
  const [breakdown, setBreakdown] = useState<ScoreBreakdown>({
    moodConsistency: 0,
    ritualEngagement: 0,
    streakMaintenance: 0,
    gratitudeEntries: 0,
    patternWork: 0,
    coachUsage: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const calculateScore = async () => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split("T")[0];

      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      const twoWeeksAgoStr = twoWeeksAgo.toISOString().split("T")[0];

      try {
        const [
          moodsRes,
          ritualsRes,
          profileRes,
          gratitudeRes,
          patternsRes,
          coachRes,
          prevMoodsRes,
          prevRitualsRes,
        ] = await Promise.all([
          // This week's data
          supabase
            .from("mood_entries")
            .select("id")
            .eq("user_id", user.id)
            .gte("recorded_at", weekAgoStr),
          supabase
            .from("rituals_completed")
            .select("id")
            .eq("user_id", user.id)
            .gte("completed_at", weekAgoStr),
          supabase
            .from("profiles")
            .select("current_streak")
            .eq("user_id", user.id)
            .single(),
          supabase
            .from("gratitude_entries")
            .select("id")
            .eq("user_id", user.id)
            .gte("created_at", new Date(weekAgo).toISOString()),
          supabase
            .from("user_patterns")
            .select("id")
            .eq("user_id", user.id)
            .eq("is_released", true)
            .gte("released_at", new Date(weekAgo).toISOString()),
          supabase
            .from("ai_coach_conversations")
            .select("id")
            .eq("user_id", user.id)
            .gte("created_at", new Date(weekAgo).toISOString()),
          // Previous week's data for comparison
          supabase
            .from("mood_entries")
            .select("id")
            .eq("user_id", user.id)
            .gte("recorded_at", twoWeeksAgoStr)
            .lt("recorded_at", weekAgoStr),
          supabase
            .from("rituals_completed")
            .select("id")
            .eq("user_id", user.id)
            .gte("completed_at", twoWeeksAgoStr)
            .lt("completed_at", weekAgoStr),
        ]);

        const moodsThisWeek = moodsRes.data?.length || 0;
        const ritualsThisWeek = ritualsRes.data?.length || 0;
        const hasStreak = (profileRes.data?.current_streak || 0) > 0;
        const gratitudeCount = gratitudeRes.data?.length || 0;
        const patternsWorked = patternsRes.data?.length || 0;
        const usedCoach = (coachRes.data?.length || 0) > 0;

        // Calculate breakdown
        const newBreakdown: ScoreBreakdown = {
          moodConsistency: Math.min((moodsThisWeek / 7) * 25, 25),
          ritualEngagement: Math.min(ritualsThisWeek * 5, 25),
          streakMaintenance: hasStreak ? 20 : 0,
          gratitudeEntries: Math.min(gratitudeCount * 5, 15),
          patternWork: patternsWorked > 0 ? 10 : 0,
          coachUsage: usedCoach ? 5 : 0,
        };

        const totalScore = Math.round(
          Object.values(newBreakdown).reduce((a, b) => a + b, 0)
        );

        // Calculate previous week score
        const prevMoods = prevMoodsRes.data?.length || 0;
        const prevRituals = prevRitualsRes.data?.length || 0;
        const prevScore = Math.round(
          Math.min((prevMoods / 7) * 25, 25) + Math.min(prevRituals * 5, 25)
        );

        setBreakdown(newBreakdown);
        setScore(totalScore);
        setPreviousScore(prevScore);
      } catch (error) {
        console.error("Error calculating wellness score:", error);
      }

      setIsLoading(false);
    };

    calculateScore();
  }, [user]);

  const tier = getTier(score);
  const scoreDiff = score - previousScore;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  if (isLoading) {
    return (
      <div className={cn("card-embrace p-6", className)}>
        <div className="animate-pulse flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-secondary" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("card-embrace p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-label">WEEKLY WELLNESS SCORE</h3>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="p-1 rounded-full hover:bg-secondary transition-colors">
              <Info className="w-4 h-4 text-muted-foreground" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs p-4" side="left">
            <p className="font-semibold mb-2">Score Breakdown:</p>
            <ul className="text-xs space-y-1">
              <li>Mood Tracking: {Math.round(breakdown.moodConsistency)}/25</li>
              <li>Rituals: {Math.round(breakdown.ritualEngagement)}/25</li>
              <li>Streak: {breakdown.streakMaintenance}/20</li>
              <li>Gratitude: {Math.round(breakdown.gratitudeEntries)}/15</li>
              <li>Pattern Work: {breakdown.patternWork}/10</li>
              <li>Coach: {breakdown.coachUsage}/5</li>
            </ul>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="flex flex-col items-center">
        {/* Circular progress */}
        <div className="relative w-32 h-32 mb-4">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-secondary"
            />
            <circle
              cx="64"
              cy="64"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="text-primary transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-foreground">{score}</span>
            <span className="text-xs text-muted-foreground">/100</span>
          </div>
        </div>

        {/* Tier label */}
        <p className={cn("font-serif italic text-lg mb-2", tier.color)}>
          {tier.label}
        </p>

        {/* Week over week */}
        <div className="flex items-center gap-1 text-sm">
          {scoreDiff > 0 ? (
            <>
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-green-500">+{scoreDiff} from last week</span>
            </>
          ) : scoreDiff < 0 ? (
            <>
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span className="text-red-500">{scoreDiff} from last week</span>
            </>
          ) : (
            <>
              <Minus className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Same as last week</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyWellnessScore;
