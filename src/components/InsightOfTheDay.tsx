import { useState, useEffect } from "react";
import { Lightbulb, RefreshCw, Bookmark } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface InsightOfTheDayProps {
  className?: string;
}

const insightTemplates = [
  {
    type: "mood",
    getMessage: (data: { recentMood?: string; moodCount?: number }) => {
      if (data.moodCount && data.moodCount > 5) {
        return `You've logged ${data.moodCount} moods this week. Self-awareness is the foundation of growth.`;
      }
      return "Start tracking your moods to discover patterns in your emotional landscape.";
    },
  },
  {
    type: "streak",
    getMessage: (data: { streak?: number }) => {
      if (data.streak && data.streak >= 7) {
        return `${data.streak} days of consistent practice! You're building powerful habits.`;
      }
      if (data.streak && data.streak > 0) {
        return `${data.streak}-day streak and growing. Every day you show up, you become stronger.`;
      }
      return "Begin your streak today. Small daily actions create extraordinary results.";
    },
  },
  {
    type: "quality",
    getMessage: (data: { qualityName?: string }) => {
      if (data.qualityName) {
        return `Focus on cultivating ${data.qualityName} today. How might you embody this quality in one small action?`;
      }
      return "Choose a quality to cultivate. Who you become matters more than what you achieve.";
    },
  },
  {
    type: "wisdom",
    getMessage: () => {
      const wisdoms = [
        "Your thoughts create your reality. Choose them wisely.",
        "Progress, not perfection. Every step forward counts.",
        "What you focus on expands. Focus on growth.",
        "Challenges are opportunities in disguise.",
        "Self-compassion is the soil where confidence grows.",
        "Your breath is always available as an anchor to the present moment.",
        "Small consistent actions compound into remarkable transformations.",
      ];
      return wisdoms[Math.floor(Math.random() * wisdoms.length)];
    },
  },
];

const InsightOfTheDay = ({ className }: InsightOfTheDayProps) => {
  const { user } = useAuth();
  const [insight, setInsight] = useState("");
  const [insightType, setInsightType] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const generateInsight = async () => {
    setIsLoading(true);
    
    if (!user) {
      const randomInsight = insightTemplates[3].getMessage({});
      setInsight(randomInsight);
      setInsightType("wisdom");
      setIsLoading(false);
      return;
    }

    try {
      // Fetch user data for personalized insights
      const [moodsRes, profileRes, qualitiesRes] = await Promise.all([
        supabase
          .from("mood_entries")
          .select("id, mood")
          .eq("user_id", user.id)
          .gte("recorded_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]),
        supabase
          .from("profiles")
          .select("current_streak")
          .eq("user_id", user.id)
          .single(),
        supabase
          .from("user_qualities")
          .select("quality_name")
          .eq("user_id", user.id)
          .eq("is_cultivated", false)
          .limit(1),
      ]);

      // Determine which insight type to show based on day
      const today = new Date().getDay();
      const typeIndex = today % insightTemplates.length;
      const template = insightTemplates[typeIndex];

      const data = {
        moodCount: moodsRes.data?.length || 0,
        streak: profileRes.data?.current_streak || 0,
        qualityName: qualitiesRes.data?.[0]?.quality_name,
      };

      setInsight(template.getMessage(data));
      setInsightType(template.type);
    } catch (error) {
      setInsight(insightTemplates[3].getMessage({}));
      setInsightType("wisdom");
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    generateInsight();
  }, [user]);

  const handleRefresh = () => {
    const randomIndex = Math.floor(Math.random() * insightTemplates.length);
    const template = insightTemplates[randomIndex];
    setInsight(template.getMessage({}));
    setInsightType(template.type);
    toast.info("New insight loaded");
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("Sign in to save insights");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from("saved_insights").insert({
        user_id: user.id,
        insight_text: insight,
        insight_type: "daily",
        category: insightType,
      });

      if (error) throw error;
      toast.success("Insight saved to your library");
    } catch (error) {
      toast.error("Failed to save insight");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className={cn("card-embrace", className)}>
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-secondary rounded w-3/4" />
            <div className="h-3 bg-secondary rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("card-embrace relative overflow-hidden", className)}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-label mb-2">INSIGHT OF THE DAY</p>
          <p className="font-serif italic text-foreground leading-relaxed">
            {insight}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-border">
        <button
          onClick={handleRefresh}
          className="p-2 rounded-full hover:bg-secondary transition-colors"
          title="Get new insight"
        >
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="p-2 rounded-full hover:bg-secondary transition-colors"
          title="Save to library"
        >
          <Bookmark className={cn(
            "w-4 h-4",
            isSaving ? "text-primary animate-pulse" : "text-muted-foreground"
          )} />
        </button>
      </div>

      {/* Decorative gradient */}
      <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-primary/5 blur-2xl" />
    </div>
  );
};

export default InsightOfTheDay;
