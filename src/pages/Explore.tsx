import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const categories = ["PRESENCE", "ACTION", "FOCUS", "SELF-KINDNESS"];

const insightsData: Record<string, Array<{ text: string }>> = {
  PRESENCE: [
    { text: "Utilize 'contextual anchoring' by associating a specific physical sensation with a state of total focus to trigger presence instantly." },
    { text: "Practice 'the gaze of receptivity' by maintaining soft eye contact to signal psychological safety and deep listening." },
    { text: "Create micro-moments of awareness by pausing between tasks to take three conscious breaths." },
  ],
  ACTION: [
    { text: "Begin with the smallest possible action. Momentum creates motivation, not the reverse." },
    { text: "Schedule your intentions. What gets calendared gets completed." },
    { text: "Practice the two-minute rule: if it takes less than two minutes, do it now." },
  ],
  FOCUS: [
    { text: "Single-task with intention. Multitasking dilutes presence and diminishes quality." },
    { text: "Create environmental triggers that signal focus time to your brain." },
    { text: "Use the Pomodoro technique: 25 minutes of deep work, followed by 5 minutes of rest." },
  ],
  "SELF-KINDNESS": [
    { text: "Speak to yourself as you would to a dear friend facing the same challenge." },
    { text: "Recognize that imperfection is part of the shared human experience." },
    { text: "Replace self-criticism with curious inquiry: 'What can I learn from this?'" },
  ],
};

const Explore = () => {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("PRESENCE");
  const [savedInsights, setSavedInsights] = useState<string[]>([]);

  // Fetch saved insights on mount
  useEffect(() => {
    if (!user) return;

    const fetchSaved = async () => {
      const { data } = await supabase
        .from("saved_insights")
        .select("insight_text")
        .eq("user_id", user.id);

      if (data) {
        setSavedInsights(data.map((d) => d.insight_text));
      }
    };

    fetchSaved();
  }, [user]);

  const handleSave = async (text: string, category: string) => {
    if (!user) {
      toast.error("Sign in to save insights");
      return;
    }

    const isSaved = savedInsights.includes(text);

    if (isSaved) {
      // Remove from saved
      const { error } = await supabase
        .from("saved_insights")
        .delete()
        .eq("user_id", user.id)
        .eq("insight_text", text);

      if (error) {
        toast.error("Could not remove insight");
        return;
      }

      setSavedInsights(savedInsights.filter((t) => t !== text));
      toast.info("Removed from library");
    } else {
      // Add to saved
      const { error } = await supabase
        .from("saved_insights")
        .insert({
          user_id: user.id,
          insight_text: text,
          insight_type: "insight",
          category: category,
        });

      if (error) {
        toast.error("Could not save insight");
        return;
      }

      setSavedInsights([...savedInsights, text]);
      toast.success("Saved to library");
    }
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="mt-2 mb-6">
        <h1 className="font-serif italic text-3xl text-foreground mb-1">
          Insights
        </h1>
        <p className="text-muted-foreground text-italic-serif">
          Intentional thoughts for daily integration.
        </p>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-semibold tracking-wider whitespace-nowrap transition-all",
              activeCategory === cat
                ? "bg-foreground text-background"
                : "bg-card border border-border text-muted-foreground hover:border-primary/50"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Insights list */}
      <div className="space-y-4">
        {insightsData[activeCategory]?.map((insight, i) => {
          const isSaved = savedInsights.includes(insight.text);
          const isAccent = i === 0;

          return (
            <div
              key={i}
              className={cn(
                "rounded-2xl p-6 animate-fade-in",
                isAccent ? "bg-success" : "card-embrace"
              )}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <p 
                className={cn(
                  "font-serif italic text-lg leading-relaxed",
                  isAccent ? "text-success-foreground" : "text-foreground"
                )}
              >
                "{insight.text}"
              </p>
              <button
                onClick={() => handleSave(insight.text, activeCategory)}
                className={cn(
                  "mt-4 text-xs font-semibold tracking-wider uppercase transition-colors",
                  isSaved 
                    ? "text-primary" 
                    : isAccent 
                      ? "text-success-foreground/70 hover:text-success-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isSaved ? "SAVED ✓" : "SAVE INSIGHT"}
              </button>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
};

export default Explore;
