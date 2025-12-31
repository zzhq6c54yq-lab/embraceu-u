import { useState, useEffect } from "react";
import { TrendingUp, Activity, Smile, Moon, Sun, Dumbbell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface Correlation {
  activity: string;
  icon: typeof Activity;
  positivePercentage: number;
  count: number;
}

export const MoodCorrelation = () => {
  const { user } = useAuth();
  const [correlations, setCorrelations] = useState<Correlation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const analyzeCorrelations = async () => {
      setIsLoading(true);

      try {
        // Get mood entries from the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: moods } = await supabase
          .from("mood_entries")
          .select("mood, recorded_at")
          .eq("user_id", user.id)
          .gte("recorded_at", thirtyDaysAgo.toISOString().split("T")[0]);

        // Get rituals completed in the same period
        const { data: rituals } = await supabase
          .from("rituals_completed")
          .select("ritual_type, completed_at")
          .eq("user_id", user.id)
          .gte("completed_at", thirtyDaysAgo.toISOString().split("T")[0]);

        if (!moods || moods.length < 5 || !rituals) {
          setIsLoading(false);
          return;
        }

        // Group moods by date
        const moodsByDate: Record<string, string[]> = {};
        moods.forEach((m) => {
          const date = m.recorded_at;
          if (!moodsByDate[date]) moodsByDate[date] = [];
          moodsByDate[date].push(m.mood);
        });

        // Group rituals by date
        const ritualsByDate: Record<string, string[]> = {};
        rituals.forEach((r) => {
          const date = r.completed_at;
          if (!ritualsByDate[date]) ritualsByDate[date] = [];
          ritualsByDate[date].push(r.ritual_type);
        });

        // Calculate correlations
        const ritualTypes = ["breathwork", "gratitude", "meditation", "journaling"];
        const results: Correlation[] = [];

        const iconMap: Record<string, typeof Activity> = {
          breathwork: Activity,
          gratitude: Smile,
          meditation: Moon,
          journaling: Sun,
          default: Dumbbell,
        };

        const positiveMoods = ["great", "good"];

        for (const ritualType of ritualTypes) {
          let daysWithRitual = 0;
          let positiveDaysWithRitual = 0;

          for (const date of Object.keys(moodsByDate)) {
            const dayRituals = ritualsByDate[date] || [];
            const dayMoods = moodsByDate[date];

            if (dayRituals.includes(ritualType)) {
              daysWithRitual++;
              if (dayMoods.some((m) => positiveMoods.includes(m))) {
                positiveDaysWithRitual++;
              }
            }
          }

          if (daysWithRitual >= 3) {
            results.push({
              activity: ritualType.charAt(0).toUpperCase() + ritualType.slice(1),
              icon: iconMap[ritualType] || iconMap.default,
              positivePercentage: Math.round(
                (positiveDaysWithRitual / daysWithRitual) * 100
              ),
              count: daysWithRitual,
            });
          }
        }

        // Sort by positive percentage
        results.sort((a, b) => b.positivePercentage - a.positivePercentage);
        setCorrelations(results);
      } catch (error) {
        console.error("Error analyzing correlations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    analyzeCorrelations();
  }, [user]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (correlations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">
          Keep logging moods and completing rituals to see your patterns!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="font-medium text-foreground">Your Mood Boosters</h3>
      </div>

      {correlations.map((correlation) => {
        const Icon = correlation.icon;
        return (
          <div
            key={correlation.activity}
            className="flex items-center gap-4 p-3 rounded-lg bg-muted/30"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm text-foreground">
                {correlation.activity}
              </p>
              <p className="text-xs text-muted-foreground">
                {correlation.count} days tracked
              </p>
            </div>
            <div className="text-right">
              <p
                className={cn(
                  "text-lg font-bold",
                  correlation.positivePercentage >= 70
                    ? "text-green-500"
                    : correlation.positivePercentage >= 50
                    ? "text-yellow-500"
                    : "text-muted-foreground"
                )}
              >
                {correlation.positivePercentage}%
              </p>
              <p className="text-xs text-muted-foreground">positive mood</p>
            </div>
          </div>
        );
      })}

      <p className="text-xs text-muted-foreground text-center mt-4">
        Based on your last 30 days of activity
      </p>
    </div>
  );
};
