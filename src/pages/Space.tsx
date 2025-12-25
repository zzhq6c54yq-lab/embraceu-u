import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface MoodEntry {
  recorded_at: string;
  mood: string;
}

interface RitualEntry {
  completed_at: string;
  ritual_type: string;
}

const Space = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [moodDays, setMoodDays] = useState<number[]>([]);
  const [ritualDays, setRitualDays] = useState<number[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [dayDetails, setDayDetails] = useState<{ moods: string[]; rituals: string[] }>({ moods: [], rituals: [] });

  const month = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();

  const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, currentDate.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  // Fetch user activity data
  useEffect(() => {
    if (!user) return;

    const fetchActivity = async () => {
      const startOfMonth = new Date(year, currentDate.getMonth(), 1).toISOString().split("T")[0];
      const endOfMonth = new Date(year, currentDate.getMonth() + 1, 0).toISOString().split("T")[0];

      const [moodsRes, ritualsRes] = await Promise.all([
        supabase
          .from("mood_entries")
          .select("recorded_at, mood")
          .eq("user_id", user.id)
          .gte("recorded_at", startOfMonth)
          .lte("recorded_at", endOfMonth),
        supabase
          .from("rituals_completed")
          .select("completed_at, ritual_type")
          .eq("user_id", user.id)
          .gte("completed_at", startOfMonth)
          .lte("completed_at", endOfMonth),
      ]);

      if (moodsRes.data) {
        const mDays = moodsRes.data.map((m: MoodEntry) => new Date(m.recorded_at).getDate());
        setMoodDays([...new Set(mDays)]);
      }

      if (ritualsRes.data) {
        const rDays = ritualsRes.data.map((r: RitualEntry) => new Date(r.completed_at).getDate());
        setRitualDays([...new Set(rDays)]);
      }
    };

    fetchActivity();
  }, [user, currentDate]);

  const prevMonth = () => {
    setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  const handleDayClick = async (day: number) => {
    if (!user) return;

    setSelectedDay(day);
    const dateStr = new Date(year, currentDate.getMonth(), day).toISOString().split("T")[0];

    const [moodsRes, ritualsRes] = await Promise.all([
      supabase
        .from("mood_entries")
        .select("mood")
        .eq("user_id", user.id)
        .eq("recorded_at", dateStr),
      supabase
        .from("rituals_completed")
        .select("ritual_type")
        .eq("user_id", user.id)
        .eq("completed_at", dateStr),
    ]);

    setDayDetails({
      moods: moodsRes.data?.map((m) => m.mood) || [],
      rituals: ritualsRes.data?.map((r) => r.ritual_type) || [],
    });
  };

  return (
    <AppLayout>
      {/* Month header */}
      <div className="flex items-center justify-between mt-2 mb-8">
        <div>
          <h1 className="font-serif italic text-3xl text-foreground">{month}</h1>
          <span className="text-label">{year}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-full border border-border hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-full border border-border hover:bg-secondary transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="card-embrace">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
            <div
              key={i}
              className="text-center text-xs font-semibold text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-2">
          {emptyDays.map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {days.map((day) => {
            const hasMood = moodDays.includes(day);
            const hasRitual = ritualDays.includes(day);
            const isToday =
              day === new Date().getDate() &&
              currentDate.getMonth() === new Date().getMonth() &&
              currentDate.getFullYear() === new Date().getFullYear();
            const isSelected = selectedDay === day;

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={cn(
                  "aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all",
                  "border border-border hover:border-primary/50",
                  isToday && "border-primary bg-primary/5",
                  isSelected && "bg-primary/10 border-primary"
                )}
              >
                <span
                  className={cn(
                    "text-sm",
                    isToday ? "font-semibold text-primary" : "text-foreground"
                  )}
                >
                  {day}
                </span>
                <div className="flex gap-0.5 mt-1">
                  {hasMood && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                  {hasRitual && (
                    <div className="w-1.5 h-1.5 rounded-full bg-success-foreground" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day details */}
      {selectedDay && (
        <div className="mt-6 card-embrace animate-fade-in">
          <h3 className="text-label mb-4">
            {month.toUpperCase()} {selectedDay}
          </h3>
          {dayDetails.moods.length > 0 ? (
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2">MOODS</p>
              <div className="flex flex-wrap gap-2">
                {dayDetails.moods.map((mood, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                  >
                    {mood}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {dayDetails.rituals.length > 0 ? (
            <div>
              <p className="text-xs text-muted-foreground mb-2">RITUALS</p>
              <div className="flex flex-wrap gap-2">
                {dayDetails.rituals.map((ritual, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full bg-success/20 text-success-foreground text-sm font-medium"
                  >
                    {ritual}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {dayDetails.moods.length === 0 && dayDetails.rituals.length === 0 && (
            <p className="text-muted-foreground font-serif italic">
              No activity recorded for this day.
            </p>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="mt-8 border-t border-border pt-6 pb-8">
        <h2 className="text-label mb-4">ACTIVITY LEGEND</h2>
        <div className="flex gap-8">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs font-semibold text-muted-foreground tracking-wide">
              MOOD CAPTURED
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success-foreground" />
            <span className="text-xs font-semibold text-muted-foreground tracking-wide">
              RITUAL COMPLETED
            </span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Space;
