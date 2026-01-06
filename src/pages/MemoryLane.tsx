import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import MemoryCard from "@/components/MemoryCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { format, subDays, isToday, subYears } from "date-fns";

type FilterType = "all" | "mood" | "gratitude" | "pattern" | "quality" | "vision";
type TimeRange = "week" | "month" | "all";

interface Memory {
  id: string;
  type: "mood" | "gratitude" | "pattern" | "quality" | "vision";
  title: string;
  content: string;
  date: string;
  metadata?: Record<string, string>;
}

const MemoryLane = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [timeRange, setTimeRange] = useState<TimeRange>("all");
  const [onThisDay, setOnThisDay] = useState<Memory[]>([]);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchMemories = async () => {
      const startDate = timeRange === "week"
        ? subDays(new Date(), 7).toISOString()
        : timeRange === "month"
        ? subDays(new Date(), 30).toISOString()
        : null;

      try {
        const queries = [];

        // Fetch moods
        if (filter === "all" || filter === "mood") {
          let moodQuery = supabase
            .from("mood_entries")
            .select("id, mood, note, recorded_at")
            .eq("user_id", user.id)
            .order("recorded_at", { ascending: false })
            .limit(50);
          if (startDate) moodQuery = moodQuery.gte("recorded_at", startDate.split("T")[0]);
          queries.push(moodQuery);
        }

        // Fetch gratitude
        if (filter === "all" || filter === "gratitude") {
          let gratitudeQuery = supabase
            .from("gratitude_entries")
            .select("id, gratitude_text, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(50);
          if (startDate) gratitudeQuery = gratitudeQuery.gte("created_at", startDate);
          queries.push(gratitudeQuery);
        }

        // Fetch released patterns
        if (filter === "all" || filter === "pattern") {
          let patternQuery = supabase
            .from("user_patterns")
            .select("id, pattern_name, release_intention, released_at")
            .eq("user_id", user.id)
            .eq("is_released", true)
            .order("released_at", { ascending: false })
            .limit(50);
          if (startDate) patternQuery = patternQuery.gte("released_at", startDate);
          queries.push(patternQuery);
        }

        // Fetch cultivated qualities
        if (filter === "all" || filter === "quality") {
          let qualityQuery = supabase
            .from("user_qualities")
            .select("id, quality_name, progress, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(50);
          if (startDate) qualityQuery = qualityQuery.gte("created_at", startDate);
          queries.push(qualityQuery);
        }

        // Fetch visions
        if (filter === "all" || filter === "vision") {
          let visionQuery = supabase
            .from("user_visions")
            .select("id, vision_text, is_completed, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(50);
          if (startDate) visionQuery = visionQuery.gte("created_at", startDate);
          queries.push(visionQuery);
        }

        const results = await Promise.all(queries);
        const allMemories: Memory[] = [];

        results.forEach((result, index) => {
          const data = result.data || [];
          
          if (filter === "all") {
            // Map based on index
            if (index === 0) {
              data.forEach((item: any) => {
                allMemories.push({
                  id: item.id,
                  type: "mood",
                  title: item.mood,
                  content: item.note || "No note added",
                  date: item.recorded_at,
                });
              });
            } else if (index === 1) {
              data.forEach((item: any) => {
                allMemories.push({
                  id: item.id,
                  type: "gratitude",
                  title: "Gratitude",
                  content: item.gratitude_text,
                  date: item.created_at,
                });
              });
            } else if (index === 2) {
              data.forEach((item: any) => {
                allMemories.push({
                  id: item.id,
                  type: "pattern",
                  title: item.pattern_name,
                  content: item.release_intention || "Pattern released",
                  date: item.released_at,
                });
              });
            } else if (index === 3) {
              data.forEach((item: any) => {
                allMemories.push({
                  id: item.id,
                  type: "quality",
                  title: item.quality_name,
                  content: `Progress: ${item.progress}%`,
                  date: item.created_at,
                  metadata: { progress: `${item.progress}%` },
                });
              });
            } else if (index === 4) {
              data.forEach((item: any) => {
                allMemories.push({
                  id: item.id,
                  type: "vision",
                  title: item.vision_text.slice(0, 50) + (item.vision_text.length > 50 ? "..." : ""),
                  content: item.vision_text,
                  date: item.created_at,
                  metadata: item.is_completed ? { status: "Completed" } : undefined,
                });
              });
            }
          } else {
            // Single type filter
            data.forEach((item: any) => {
              allMemories.push({
                id: item.id,
                type: filter,
                title: item.mood || item.pattern_name || item.quality_name || 
                       (item.vision_text?.slice(0, 50) + "...") || "Gratitude",
                content: item.note || item.gratitude_text || item.release_intention || 
                        item.vision_text || `Progress: ${item.progress}%`,
                date: item.recorded_at || item.created_at || item.released_at,
              });
            });
          }
        });

        // Sort by date
        allMemories.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setMemories(allMemories);

        // Fetch "On This Day" memories
        const today = format(new Date(), "MM-dd");
        const lastYear = subYears(new Date(), 1);
        
        const onThisDayMemories = allMemories.filter((m) => {
          const memoryDate = new Date(m.date);
          return format(memoryDate, "MM-dd") === today && 
                 memoryDate < new Date() && 
                 !isToday(memoryDate);
        });
        setOnThisDay(onThisDayMemories.slice(0, 3));

      } catch (error) {
        console.error("Error fetching memories:", error);
      }

      setIsLoading(false);
    };

    fetchMemories();
  }, [user, filter, timeRange]);

  const filterOptions: { value: FilterType; label: string }[] = [
    { value: "all", label: "All" },
    { value: "mood", label: "Moods" },
    { value: "gratitude", label: "Gratitude" },
    { value: "pattern", label: "Patterns" },
    { value: "quality", label: "Qualities" },
    { value: "vision", label: "Visions" },
  ];

  const timeOptions: { value: TimeRange; label: string }[] = [
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "all", label: "All Time" },
  ];

  return (
    <AppLayout>
      <div className="mt-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>

        <div className="flex items-center gap-3 mb-2">
          <Calendar className="w-6 h-6 text-primary" />
          <h1 className="font-serif italic text-3xl text-foreground">
            Memory Lane
          </h1>
        </div>
        <p className="text-muted-foreground">
          Revisit your journey of growth and reflection
        </p>
      </div>

      {/* On This Day Section */}
      {onThisDay.length > 0 && (
        <section className="mb-8">
          <h2 className="text-label mb-4">ON THIS DAY</h2>
          <div className="space-y-3">
            {onThisDay.map((memory) => (
              <MemoryCard key={memory.id} {...memory} />
            ))}
          </div>
        </section>
      )}

      {/* Filters */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                filter === option.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {timeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeRange(option.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                timeRange === option.value
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Memories List */}
      <section className="pb-8">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card-embrace animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-secondary rounded w-1/3" />
                    <div className="h-3 bg-secondary rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : memories.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-serif italic text-lg text-muted-foreground">
              No memories yet. Start logging your journey!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {memories.map((memory) => (
              <MemoryCard key={memory.id} {...memory} />
            ))}
          </div>
        )}
      </section>
    </AppLayout>
  );
};

export default MemoryLane;
