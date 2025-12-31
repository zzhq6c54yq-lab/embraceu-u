import { useState, useEffect } from "react";
import { Eye, EyeOff, Heart, Frown, Meh, Smile, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PartnerMoodCardProps {
  partnerId: string;
  partnerName: string;
}

interface MoodEntry {
  mood: string;
  created_at: string;
  note?: string;
}

const moodConfig: Record<string, { icon: typeof Smile; color: string; label: string }> = {
  great: { icon: Sparkles, color: "text-green-500", label: "Feeling Great" },
  good: { icon: Smile, color: "text-emerald-500", label: "Feeling Good" },
  okay: { icon: Meh, color: "text-yellow-500", label: "Feeling Okay" },
  low: { icon: Frown, color: "text-orange-500", label: "Feeling Low" },
  struggling: { icon: Frown, color: "text-red-500", label: "Struggling" },
};

export const PartnerMoodCard = ({ partnerId, partnerName }: PartnerMoodCardProps) => {
  const [partnerMood, setPartnerMood] = useState<MoodEntry | null>(null);
  const [partnerSharing, setPartnerSharing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPartnerMood = async () => {
      // Check if partner is sharing their mood
      const { data: profile } = await supabase
        .from("profiles")
        .select("share_mood_with_partner")
        .eq("user_id", partnerId)
        .single();

      if (!profile?.share_mood_with_partner) {
        setPartnerSharing(false);
        setIsLoading(false);
        return;
      }

      setPartnerSharing(true);

      // Get partner's latest mood
      const { data: moods } = await supabase
        .from("mood_entries")
        .select("mood, created_at, note")
        .eq("user_id", partnerId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (moods && moods.length > 0) {
        setPartnerMood(moods[0]);
      }
      setIsLoading(false);
    };

    fetchPartnerMood();

    // Subscribe to real-time mood updates
    const channel = supabase
      .channel(`partner-mood-${partnerId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mood_entries",
          filter: `user_id=eq.${partnerId}`,
        },
        (payload) => {
          const newMood = payload.new as MoodEntry;
          setPartnerMood(newMood);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [partnerId]);

  if (isLoading) {
    return (
      <div className="p-4 rounded-xl bg-muted/50 animate-pulse h-24" />
    );
  }

  if (!partnerSharing) {
    return (
      <div className="p-4 rounded-xl bg-muted/30 border border-border/50 text-center">
        <EyeOff className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {partnerName} hasn't enabled mood sharing
        </p>
      </div>
    );
  }

  if (!partnerMood) {
    return (
      <div className="p-4 rounded-xl bg-muted/30 border border-border/50 text-center">
        <Meh className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          No mood logged yet today
        </p>
      </div>
    );
  }

  const config = moodConfig[partnerMood.mood] || moodConfig.okay;
  const Icon = config.icon;
  const isLowMood = ["low", "struggling"].includes(partnerMood.mood);

  return (
    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          {partnerName}'s Mood
        </p>
        <Eye className="w-4 h-4 text-muted-foreground" />
      </div>

      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            "bg-background shadow-sm"
          )}
        >
          <Icon className={cn("w-6 h-6", config.color)} />
        </div>
        <div className="flex-1">
          <p className="font-medium text-foreground">{config.label}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(partnerMood.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      {isLowMood && (
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-3 gap-2"
          onClick={() => {
            // Could implement sending an encouragement message
            // For now, just show feedback
          }}
        >
          <Heart className="w-4 h-4 text-red-500" />
          Send Encouragement
        </Button>
      )}
    </div>
  );
};
