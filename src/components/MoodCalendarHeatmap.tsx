import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MoodCalendarHeatmapProps {
  className?: string;
}

interface MoodEntry {
  recorded_at: string;
  mood: string;
  note?: string;
}

const moodColors: Record<string, string> = {
  Joyful: "bg-yellow-400",
  Peaceful: "bg-blue-400",
  Grateful: "bg-green-400",
  Anxious: "bg-orange-400",
  Sad: "bg-indigo-400",
  Stressed: "bg-red-400",
  Calm: "bg-cyan-400",
  Energized: "bg-amber-400",
  Tired: "bg-slate-400",
  Hopeful: "bg-emerald-400",
  Frustrated: "bg-rose-400",
  Content: "bg-teal-400",
  Overwhelmed: "bg-purple-400",
  Motivated: "bg-lime-400",
  Lonely: "bg-violet-400",
};

const getMoodColor = (mood: string): string => {
  return moodColors[mood] || "bg-primary/50";
};

const MoodCalendarHeatmap = ({ className }: MoodCalendarHeatmapProps) => {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [moodData, setMoodData] = useState<Record<string, MoodEntry[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchMoods = async () => {
      const startOfMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1
      );
      const endOfMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        0
      );

      try {
        const { data } = await supabase
          .from("mood_entries")
          .select("recorded_at, mood, note")
          .eq("user_id", user.id)
          .gte("recorded_at", startOfMonth.toISOString().split("T")[0])
          .lte("recorded_at", endOfMonth.toISOString().split("T")[0]);

        // Group by date
        const grouped: Record<string, MoodEntry[]> = {};
        data?.forEach((entry) => {
          const date = entry.recorded_at;
          if (!grouped[date]) grouped[date] = [];
          grouped[date].push(entry);
        });

        setMoodData(grouped);
      } catch (error) {
        console.error("Error fetching moods:", error);
      }

      setIsLoading(false);
    };

    fetchMoods();
  }, [user, currentMonth]);

  const navigateMonth = (direction: number) => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1)
    );
  };

  // Generate calendar days
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  if (isLoading) {
    return (
      <div className={cn("card-embrace", className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-secondary rounded w-1/3 mx-auto mb-4" />
          <div className="grid grid-cols-7 gap-1">
            {[...Array(35)].map((_, i) => (
              <div key={i} className="aspect-square bg-secondary rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("card-embrace", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 rounded-full hover:bg-secondary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="font-serif italic text-lg">{monthName}</h3>
        <button
          onClick={() => navigateMonth(1)}
          className="p-2 rounded-full hover:bg-secondary transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
          <div
            key={i}
            className="text-center text-xs text-muted-foreground font-medium"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (!day) {
            return <div key={index} className="aspect-square" />;
          }

          const dateStr = `${currentMonth.getFullYear()}-${String(
            currentMonth.getMonth() + 1
          ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const moods = moodData[dateStr] || [];
          const hasMood = moods.length > 0;
          const primaryMood = moods[0]?.mood;
          const isToday =
            new Date().toISOString().split("T")[0] === dateStr;

          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "aspect-square rounded-lg flex items-center justify-center text-xs transition-all cursor-pointer",
                    hasMood
                      ? cn(getMoodColor(primaryMood), "text-white font-medium")
                      : "bg-secondary/50 text-muted-foreground",
                    isToday && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  )}
                >
                  {day}
                </div>
              </TooltipTrigger>
              {hasMood && (
                <TooltipContent>
                  <div className="text-sm">
                    <p className="font-medium">{moods.map((m) => m.mood).join(", ")}</p>
                    {moods[0]?.note && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {moods[0].note}
                      </p>
                    )}
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2">Mood Legend:</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(moodColors).slice(0, 6).map(([mood, color]) => (
            <div key={mood} className="flex items-center gap-1">
              <div className={cn("w-3 h-3 rounded", color)} />
              <span className="text-xs text-muted-foreground">{mood}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoodCalendarHeatmap;
