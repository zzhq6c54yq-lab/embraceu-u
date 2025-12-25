import { useState, useEffect } from "react";
import { BookOpen } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const filters = ["ALL", "INSIGHT", "GUIDANCE"];

interface SavedItem {
  id: string;
  insight_text: string;
  insight_type: string;
  category: string | null;
}

const Library = () => {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchLibrary = async () => {
      const { data, error } = await supabase
        .from("saved_insights")
        .select("id, insight_text, insight_type, category")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        setSavedItems(data);
      }
      setIsLoading(false);
    };

    fetchLibrary();
  }, [user]);

  const filteredItems = savedItems.filter((item) => {
    if (activeFilter === "ALL") return true;
    return item.insight_type.toUpperCase() === activeFilter;
  });

  const isEmpty = filteredItems.length === 0;

  return (
    <AppLayout>
      {/* Header */}
      <div className="mt-2 mb-6">
        <h1 className="font-serif italic text-3xl text-foreground mb-1">
          Your Library
        </h1>
        <p className="text-muted-foreground text-italic-serif">
          A personal collection of your growth insights.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-8">
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
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="card-embrace animate-fade-in"
            >
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
      )}
    </AppLayout>
  );
};

export default Library;
