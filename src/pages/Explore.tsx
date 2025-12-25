import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Bookmark, BookmarkCheck } from "lucide-react";

const categories = [
  "PRESENCE",
  "ACTION",
  "FOCUS",
  "SELF-KINDNESS",
  "RESILIENCE",
  "GRATITUDE",
  "MINDFULNESS",
  "GROWTH",
];

const insightsData: Record<string, Array<{ text: string }>> = {
  PRESENCE: [
    { text: "Utilize 'contextual anchoring' by associating a specific physical sensation with a state of total focus to trigger presence instantly." },
    { text: "Practice 'the gaze of receptivity' by maintaining soft eye contact to signal psychological safety and deep listening." },
    { text: "Create micro-moments of awareness by pausing between tasks to take three conscious breaths." },
    { text: "Notice five things you can see, four you can hear, three you can touch, two you can smell, one you can taste." },
    { text: "Your attention is your most precious resource. Where you place it determines your experience of life." },
  ],
  ACTION: [
    { text: "Begin with the smallest possible action. Momentum creates motivation, not the reverse." },
    { text: "Schedule your intentions. What gets calendared gets completed." },
    { text: "Practice the two-minute rule: if it takes less than two minutes, do it now." },
    { text: "Action precedes clarity. You don't need to see the whole staircase, just take the first step." },
    { text: "Commitment is a daily choice, not a one-time decision. Recommit each morning." },
  ],
  FOCUS: [
    { text: "Single-task with intention. Multitasking dilutes presence and diminishes quality." },
    { text: "Create environmental triggers that signal focus time to your brain." },
    { text: "Use the Pomodoro technique: 25 minutes of deep work, followed by 5 minutes of rest." },
    { text: "Protect your peak hours. Know when you're most creative and guard that time fiercely." },
    { text: "Eliminate decision fatigue by batching similar tasks together." },
  ],
  "SELF-KINDNESS": [
    { text: "Speak to yourself as you would to a dear friend facing the same challenge." },
    { text: "Recognize that imperfection is part of the shared human experience." },
    { text: "Replace self-criticism with curious inquiry: 'What can I learn from this?'" },
    { text: "Your worthiness is not earned through achievement. It is your birthright." },
    { text: "Treat yourself with the same compassion you extend to those you love." },
  ],
  RESILIENCE: [
    { text: "Setbacks are setups for comebacks. Every obstacle contains a hidden opportunity." },
    { text: "Flexibility is strength. The bamboo survives the storm by bending, not breaking." },
    { text: "Rest is not defeat. Strategic withdrawal allows for powerful return." },
    { text: "Your capacity to recover is stronger than you know. Trust your resilience." },
    { text: "Challenges are the curriculum of life. Each one teaches what you need to learn." },
  ],
  GRATITUDE: [
    { text: "Gratitude turns what we have into enough. It is the antidote to scarcity thinking." },
    { text: "Notice three good things each day. This simple practice rewires your brain for positivity." },
    { text: "Appreciate the ordinary. The mundane is a miracle we've forgotten to see." },
    { text: "Thank your past self for the choices that brought you to this moment." },
    { text: "Gratitude is not about having more, but about recognizing what you already possess." },
  ],
  MINDFULNESS: [
    { text: "Mindfulness is not about emptying the mind, but about observing thoughts without attachment." },
    { text: "Return to the breath. It is your anchor to the present moment." },
    { text: "Notice the space between stimulus and response. In that space lies your freedom." },
    { text: "Practice beginner's mind. See everything as if for the first time." },
    { text: "The present moment is the only place where life actually happens." },
  ],
  GROWTH: [
    { text: "Growth happens at the edge of your comfort zone, not in its center." },
    { text: "Embrace the identity of a learner, not an expert. Stay curious, stay humble." },
    { text: "Progress is rarely linear. Honor the plateaus as much as the peaks." },
    { text: "Compare yourself only to who you were yesterday, not to who someone else is today." },
    { text: "Every master was once a disaster. Mastery is the result of consistent imperfect practice." },
  ],
};

const Explore = () => {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("PRESENCE");
  const [savedInsights, setSavedInsights] = useState<string[]>([]);

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
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4 scrollbar-hide">
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
      <div className="space-y-4 pb-8">
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
                  "mt-4 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase transition-colors",
                  isSaved
                    ? "text-primary"
                    : isAccent
                    ? "text-success-foreground/70 hover:text-success-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck className="w-4 h-4" />
                    SAVED
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    SAVE INSIGHT
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
};

export default Explore;
