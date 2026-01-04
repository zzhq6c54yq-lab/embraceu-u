import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePremium } from "@/hooks/usePremium";
import { Bookmark, BookmarkCheck, CalendarDays, Sparkles, MessageCircle, ArrowRight, Crown } from "lucide-react";
import InsightScheduleModal from "@/components/InsightScheduleModal";
import UpgradeModal from "@/components/UpgradeModal";
import TextToSpeech from "@/components/TextToSpeech";
import InsightSearch from "@/components/InsightSearch";
import { format, isToday } from "date-fns";
import { Button } from "@/components/ui/button";

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

interface SavedInsight {
  id: string;
  insight_text: string;
  scheduled_date: string | null;
  is_practiced: boolean;
}

const Explore = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium } = usePremium();
  const [activeCategory, setActiveCategory] = useState("PRESENCE");
  const [savedInsights, setSavedInsights] = useState<SavedInsight[]>([]);
  const [todaysFocus, setTodaysFocus] = useState<SavedInsight[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Schedule modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [pendingInsight, setPendingInsight] = useState<{ text: string; category: string } | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchSaved = async () => {
      const { data } = await supabase
        .from("saved_insights")
        .select("id, insight_text, scheduled_date, is_practiced")
        .eq("user_id", user.id);

      if (data) {
        setSavedInsights(data);
        // Find today's focus insights
        const today = data.filter(d =>
          d.scheduled_date && isToday(new Date(d.scheduled_date)) && !d.is_practiced
        );
        setTodaysFocus(today);
      }
    };

    fetchSaved();
  }, [user]);

  const isInsightSaved = (text: string) => {
    return savedInsights.some(s => s.insight_text === text);
  };

  const handleSaveClick = (text: string, category: string) => {
    if (!user) {
      toast.error("Sign in to save insights");
      return;
    }

    const isSaved = isInsightSaved(text);

    if (isSaved) {
      // Remove from saved
      handleRemove(text);
    } else {
      // Open schedule modal
      setPendingInsight({ text, category });
      setShowScheduleModal(true);
    }
  };

  const handleRemove = async (text: string) => {
    const { error } = await supabase
      .from("saved_insights")
      .delete()
      .eq("user_id", user!.id)
      .eq("insight_text", text);

    if (error) {
      toast.error("Could not remove insight");
      return;
    }

    setSavedInsights(savedInsights.filter((s) => s.insight_text !== text));
    setTodaysFocus(todaysFocus.filter((s) => s.insight_text !== text));
    toast.info("Removed from library");
  };

  const handleSaveInsight = async (scheduledDate: Date | null) => {
    if (!pendingInsight || !user) return;

    const { data, error } = await supabase
      .from("saved_insights")
      .insert({
        user_id: user.id,
        insight_text: pendingInsight.text,
        insight_type: "insight",
        category: pendingInsight.category,
        scheduled_date: scheduledDate ? format(scheduledDate, "yyyy-MM-dd") : null,
      })
      .select("id, insight_text, scheduled_date, is_practiced")
      .single();

    if (error) {
      toast.error("Could not save insight");
      return;
    }

    setSavedInsights([...savedInsights, data]);

    if (scheduledDate && isToday(scheduledDate)) {
      setTodaysFocus([...todaysFocus, data]);
    }

    if (scheduledDate) {
      toast.success(`Scheduled for ${format(scheduledDate, "MMM d")}`);
    } else {
      toast.success("Saved to library");
    }

    setPendingInsight(null);
    setShowScheduleModal(false);
  };

  return (
    <AppLayout>
      {/* Schedule Modal */}
      <InsightScheduleModal
        isOpen={showScheduleModal}
        onClose={() => {
          setShowScheduleModal(false);
          setPendingInsight(null);
        }}
        insightText={pendingInsight?.text || ""}
        category={pendingInsight?.category || ""}
        onSave={handleSaveInsight}
      />

      {/* Header */}
      <div className="mt-2 mb-6">
        <h1 className="font-serif italic text-3xl text-foreground mb-1">
          Insights
        </h1>
        <p className="text-muted-foreground text-italic-serif">
          Intentional thoughts for daily integration.
        </p>
      </div>

      {/* AI Search */}
      <InsightSearch
        onSaveInsight={(text, category) => {
          setPendingInsight({ text, category });
          setShowScheduleModal(true);
        }}
        onUpgradeClick={() => setShowUpgradeModal(true)}
      />

      {/* AI Coach CTA */}
      <button
        onClick={() => isPremium ? navigate("/coach") : setShowUpgradeModal(true)}
        className="w-full mb-6 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 flex items-center gap-4 hover:from-primary/15 hover:to-primary/10 transition-all group"
      >
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <MessageCircle className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">Chat with AI Coach</h3>
            {!isPremium && (
              <span className="text-[10px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">PRO</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">Get personalized guidance for your wellness journey</p>
        </div>
        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </button>

      {/* Instructions Card */}
      <div className="bg-secondary/50 rounded-xl p-4 mb-6 space-y-2 text-sm">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          How to Use These Insights
        </h3>
        <ul className="text-muted-foreground space-y-1.5">
          <li>• <strong>Read slowly</strong> and let the words settle</li>
          <li>• <strong>Save insights</strong> you want to practice this week</li>
          <li>• <strong>Schedule a date</strong> to focus on integrating each one</li>
          <li>• <strong>Track your practice</strong> in the Library with reflections</li>
        </ul>
      </div>

      {/* Today's Focus */}
      {todaysFocus.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="w-4 h-4 text-primary" />
            <span className="text-label">TODAY'S FOCUS</span>
          </div>
          <div className="space-y-3">
            {todaysFocus.map((insight) => (
              <div
                key={insight.id}
                className="bg-primary/10 border border-primary/20 rounded-xl p-4"
              >
                <p className="font-serif italic text-foreground text-sm">
                  "{insight.insight_text}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

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
          const isSaved = isInsightSaved(insight.text);
          const savedData = savedInsights.find(s => s.insight_text === insight.text);
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

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSaveClick(insight.text, activeCategory)}
                    className={cn(
                      "flex items-center gap-2 text-xs font-semibold tracking-wider uppercase transition-colors",
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
                  
                  <TextToSpeech 
                    text={insight.text} 
                    size="sm"
                    onUpgradeClick={() => setShowUpgradeModal(true)}
                  />
                </div>

                {savedData?.scheduled_date && !savedData.is_practiced && (
                  <span className={cn(
                    "text-xs flex items-center gap-1",
                    isAccent ? "text-success-foreground/70" : "text-muted-foreground"
                  )}>
                    <CalendarDays className="w-3 h-3" />
                    {format(new Date(savedData.scheduled_date), "MMM d")}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <UpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
    </AppLayout>
  );
};

export default Explore;
