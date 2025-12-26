import { useState, useEffect } from "react";
import { BookOpen, CalendarDays, List, Check } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format, isToday, isPast } from "date-fns";
import InsightPracticeModal from "@/components/InsightPracticeModal";

const filters = ["ALL", "INSIGHT", "REFRAME"];

interface SavedItem {
  id: string;
  insight_text: string;
  insight_type: string;
  category: string | null;
  scheduled_date: string | null;
  is_practiced: boolean;
  practice_note: string | null;
}

const Library = () => {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Practice modal state
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<SavedItem | null>(null);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchLibrary = async () => {
      const { data } = await supabase
        .from("saved_insights")
        .select("id, insight_text, insight_type, category, scheduled_date, is_practiced, practice_note")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) setSavedItems(data);
      setIsLoading(false);
    };

    fetchLibrary();
  }, [user]);

  const handleMarkPracticed = (item: SavedItem) => {
    setSelectedInsight(item);
    setShowPracticeModal(true);
  };

  const handleCompletePractice = async (practiceNote: string) => {
    if (!selectedInsight) return;

    await supabase
      .from("saved_insights")
      .update({
        is_practiced: true,
        practice_note: practiceNote || null,
        practiced_at: new Date().toISOString(),
      })
      .eq("id", selectedInsight.id);

    setSavedItems(savedItems.map(item =>
      item.id === selectedInsight.id
        ? { ...item, is_practiced: true, practice_note: practiceNote }
        : item
    ));

    setShowPracticeModal(false);
    setSelectedInsight(null);
  };

  const filteredItems = savedItems.filter((item) => {
    if (activeFilter === "ALL") return true;
    return item.insight_type.toUpperCase() === activeFilter;
  });

  const scheduledItems = filteredItems.filter(item => item.scheduled_date);
  const unscheduledItems = filteredItems.filter(item => !item.scheduled_date);

  const isEmpty = filteredItems.length === 0;

  return (
    <AppLayout>
      <InsightPracticeModal
        isOpen={showPracticeModal}
        onClose={() => {
          setShowPracticeModal(false);
          setSelectedInsight(null);
        }}
        insightText={selectedInsight?.insight_text || ""}
        category={selectedInsight?.category || ""}
        onComplete={handleCompletePractice}
      />

      {/* Header */}
      <div className="mt-2 mb-6">
        <h1 className="font-serif italic text-3xl text-foreground mb-1">
          Your Library
        </h1>
        <p className="text-muted-foreground text-italic-serif">
          A personal collection of your growth insights.
        </p>
      </div>

      {/* View toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all",
                activeFilter === filter
                  ? "bg-foreground text-background"
                  : "bg-card border border-border text-muted-foreground hover:border-primary/50"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="flex gap-1 border border-border rounded-full p-1">
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "p-2 rounded-full transition-colors",
              viewMode === "list" ? "bg-foreground text-background" : "text-muted-foreground"
            )}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={cn(
              "p-2 rounded-full transition-colors",
              viewMode === "calendar" ? "bg-foreground text-background" : "text-muted-foreground"
            )}
          >
            <CalendarDays className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground/40 mb-4" />
          <p className="text-label text-muted-foreground">
            YOUR LIBRARY AWAITS ITS FIRST ENTRY
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Save insights from the Explore tab
          </p>
        </div>
      ) : viewMode === "calendar" ? (
        <div className="space-y-6 pb-8">
          {/* Scheduled insights */}
          {scheduledItems.length > 0 && (
            <div>
              <h3 className="text-label mb-3">SCHEDULED</h3>
              <div className="space-y-3">
                {scheduledItems.map((item) => {
                  const date = new Date(item.scheduled_date!);
                  const isOverdue = isPast(date) && !isToday(date) && !item.is_practiced;

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "card-embrace animate-fade-in",
                        item.is_practiced && "opacity-60"
                      )}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <CalendarDays className={cn(
                            "w-4 h-4",
                            isOverdue ? "text-destructive" : "text-primary"
                          )} />
                          <span className={cn(
                            "text-xs font-semibold",
                            isOverdue ? "text-destructive" : "text-primary"
                          )}>
                            {format(date, "MMM d, yyyy")}
                          </span>
                          {isToday(date) && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                              TODAY
                            </span>
                          )}
                        </div>
                        {item.is_practiced ? (
                          <span className="flex items-center gap-1 text-xs text-success-foreground">
                            <Check className="w-3 h-3" /> Practiced
                          </span>
                        ) : (
                          <button
                            onClick={() => handleMarkPracticed(item)}
                            className="text-xs px-3 py-1 rounded-full bg-success text-success-foreground hover:bg-success/80"
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                      <p className="font-serif italic text-foreground leading-relaxed">
                        "{item.insight_text}"
                      </p>
                      {item.practice_note && (
                        <p className="mt-3 text-sm text-muted-foreground border-t border-border pt-3">
                          <strong>Reflection:</strong> {item.practice_note}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Unscheduled insights */}
          {unscheduledItems.length > 0 && (
            <div>
              <h3 className="text-label mb-3">UNSCHEDULED</h3>
              <div className="space-y-3">
                {unscheduledItems.map((item) => (
                  <div key={item.id} className="card-embrace animate-fade-in">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-semibold tracking-wider uppercase text-primary">
                        {item.insight_type}
                      </span>
                      {item.category && (
                        <>
                          <span className="text-muted-foreground/40">•</span>
                          <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                            {item.category}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="font-serif italic text-lg text-foreground leading-relaxed">
                      "{item.insight_text}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 pb-8">
          {filteredItems.map((item) => (
            <div key={item.id} className="card-embrace animate-fade-in">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-semibold tracking-wider uppercase text-primary">
                  {item.insight_type}
                </span>
                {item.category && (
                  <>
                    <span className="text-muted-foreground/40">•</span>
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                      {item.category}
                    </span>
                  </>
                )}
                {item.is_practiced && (
                  <span className="ml-auto flex items-center gap-1 text-[10px] text-success-foreground">
                    <Check className="w-3 h-3" /> PRACTICED
                  </span>
                )}
              </div>
              <p className="font-serif italic text-lg text-foreground leading-relaxed">
                "{item.insight_text}"
              </p>
              {item.practice_note && (
                <p className="mt-3 text-sm text-muted-foreground border-t border-border pt-3">
                  <strong>Reflection:</strong> {item.practice_note}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
};

export default Library;
