import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  TrendingUp, TrendingDown, Minus, ChevronRight,
  Heart, Sparkles, Target, Calendar, Flame, BarChart3
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";

interface WeeklyStats {
  moodsLogged: number;
  ritualsCompleted: number;
  insightsSaved: number;
  gratitudeEntries: number;
  currentStreak: number;
  weeklyScore: number;
  trend: "up" | "down" | "stable";
  trendPercent: number;
}

const ProgressInsightsCard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<WeeklyStats>({
    moodsLogged: 0,
    ritualsCompleted: 0,
    insightsSaved: 0,
    gratitudeEntries: 0,
    currentStreak: 0,
    weeklyScore: 0,
    trend: "stable",
    trendPercent: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWeeklyStats = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      const today = new Date();
      const weekStart = startOfWeek(today, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
      const lastWeekStart = subDays(weekStart, 7);
      const lastWeekEnd = subDays(weekEnd, 7);

      try {
        // This week's data
        const [moods, rituals, insights, gratitude, profile] = await Promise.all([
          supabase
            .from("mood_entries")
            .select("id")
            .eq("user_id", user.id)
            .gte("recorded_at", format(weekStart, "yyyy-MM-dd"))
            .lte("recorded_at", format(weekEnd, "yyyy-MM-dd")),
          supabase
            .from("rituals_completed")
            .select("id")
            .eq("user_id", user.id)
            .gte("completed_at", format(weekStart, "yyyy-MM-dd"))
            .lte("completed_at", format(weekEnd, "yyyy-MM-dd")),
          supabase
            .from("saved_insights")
            .select("id")
            .eq("user_id", user.id)
            .gte("created_at", weekStart.toISOString())
            .lte("created_at", weekEnd.toISOString()),
          supabase
            .from("gratitude_entries")
            .select("id")
            .eq("user_id", user.id)
            .gte("created_at", weekStart.toISOString())
            .lte("created_at", weekEnd.toISOString()),
          supabase
            .from("profiles")
            .select("current_streak")
            .eq("user_id", user.id)
            .single(),
        ]);

        // Last week's data for comparison
        const [lastMoods, lastRituals] = await Promise.all([
          supabase
            .from("mood_entries")
            .select("id")
            .eq("user_id", user.id)
            .gte("recorded_at", format(lastWeekStart, "yyyy-MM-dd"))
            .lte("recorded_at", format(lastWeekEnd, "yyyy-MM-dd")),
          supabase
            .from("rituals_completed")
            .select("id")
            .eq("user_id", user.id)
            .gte("completed_at", format(lastWeekStart, "yyyy-MM-dd"))
            .lte("completed_at", format(lastWeekEnd, "yyyy-MM-dd")),
        ]);

        const moodsCount = moods.data?.length || 0;
        const ritualsCount = rituals.data?.length || 0;
        const insightsCount = insights.data?.length || 0;
        const gratitudeCount = gratitude.data?.length || 0;
        const streak = profile.data?.current_streak || 0;

        const lastMoodsCount = lastMoods.data?.length || 0;
        const lastRitualsCount = lastRituals.data?.length || 0;

        // Calculate weekly wellness score (0-100)
        const maxMoods = 7; // One per day
        const maxRituals = 14; // Two per day
        const maxInsights = 5;
        const maxGratitude = 7;

        const score = Math.min(100, Math.round(
          (moodsCount / maxMoods) * 25 +
          (ritualsCount / maxRituals) * 25 +
          (insightsCount / maxInsights) * 25 +
          (gratitudeCount / maxGratitude) * 25
        ));

        // Calculate trend
        const thisWeekTotal = moodsCount + ritualsCount;
        const lastWeekTotal = lastMoodsCount + lastRitualsCount;
        
        let trend: "up" | "down" | "stable" = "stable";
        let trendPercent = 0;

        if (lastWeekTotal > 0) {
          trendPercent = Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100);
          if (trendPercent > 10) trend = "up";
          else if (trendPercent < -10) trend = "down";
        } else if (thisWeekTotal > 0) {
          trend = "up";
          trendPercent = 100;
        }

        setStats({
          moodsLogged: moodsCount,
          ritualsCompleted: ritualsCount,
          insightsSaved: insightsCount,
          gratitudeEntries: gratitudeCount,
          currentStreak: streak,
          weeklyScore: score,
          trend,
          trendPercent: Math.abs(trendPercent),
        });
      } catch (error) {
        console.error("Error fetching weekly stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeeklyStats();
  }, [user]);

  if (!user || isLoading) {
    return null;
  }

  const TrendIcon = stats.trend === "up" ? TrendingUp : stats.trend === "down" ? TrendingDown : Minus;
  const trendColor = stats.trend === "up" ? "text-green-500" : stats.trend === "down" ? "text-red-500" : "text-muted-foreground";

  const miniStats = [
    { icon: Heart, value: stats.moodsLogged, label: "Moods", color: "text-pink-500" },
    { icon: Target, value: stats.ritualsCompleted, label: "Rituals", color: "text-green-500" },
    { icon: Sparkles, value: stats.insightsSaved, label: "Insights", color: "text-purple-500" },
    { icon: Flame, value: stats.currentStreak, label: "Streak", color: "text-orange-500" },
  ];

  return (
    <Card className="p-5 bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-foreground">Weekly Insights</h3>
        </div>
        <button
          onClick={() => navigate("/progress")}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          View All
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Weekly Score */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-foreground">{stats.weeklyScore}</span>
            <span className="text-sm text-muted-foreground">/100</span>
          </div>
          <div className={cn("flex items-center gap-1 text-xs font-medium", trendColor)}>
            <TrendIcon className="w-3 h-3" />
            {stats.trendPercent > 0 && `${stats.trendPercent}% vs last week`}
            {stats.trendPercent === 0 && "Same as last week"}
          </div>
        </div>
        <Progress value={stats.weeklyScore} className="h-2" />
        <p className="text-xs text-muted-foreground mt-1">Wellness Score</p>
      </div>

      {/* Mini Stats Grid */}
      <div className="grid grid-cols-4 gap-2">
        {miniStats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center p-2 rounded-lg bg-secondary/30"
          >
            <stat.icon className={cn("w-4 h-4 mb-1", stat.color)} />
            <span className="text-lg font-bold text-foreground">{stat.value}</span>
            <span className="text-[10px] text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Subtle decorative gradient */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-primary/5 blur-2xl" />
    </Card>
  );
};

export default ProgressInsightsCard;
