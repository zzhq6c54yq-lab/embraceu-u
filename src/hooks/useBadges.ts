import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon_name: string;
  requirement_type: string;
  requirement_value: number;
}

interface UserBadge {
  id: string;
  badge_id: string;
  earned_at: string;
}

interface UserStats {
  current_streak: number;
  total_moods_logged: number;
  total_rituals_completed: number;
  total_patterns_released: number;
  total_insights_saved: number;
}

export const useBadges = () => {
  const { user } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<UserBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newlyEarned, setNewlyEarned] = useState<Badge | null>(null);

  const fetchBadges = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Fetch all badges
      const { data: allBadges } = await supabase
        .from("badges")
        .select("*")
        .order("requirement_value", { ascending: true });

      // Fetch user's earned badges
      const { data: userBadges } = await supabase
        .from("user_badges")
        .select("*")
        .eq("user_id", user.id);

      if (allBadges) setBadges(allBadges);
      if (userBadges) setEarnedBadges(userBadges);
    } catch (error) {
      console.error("Error fetching badges:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  const checkAndAwardBadges = useCallback(
    async (stats: UserStats, duoStreak?: number) => {
      if (!user || badges.length === 0) return;

      const earnedBadgeIds = earnedBadges.map((eb) => eb.badge_id);
      const newBadges: Badge[] = [];

      for (const badge of badges) {
        if (earnedBadgeIds.includes(badge.id)) continue;

        let earned = false;

        switch (badge.requirement_type) {
          case "total_activities":
            const totalActivities =
              stats.total_moods_logged +
              stats.total_rituals_completed +
              stats.total_patterns_released;
            earned = totalActivities >= badge.requirement_value;
            break;
          case "streak":
            earned = stats.current_streak >= badge.requirement_value;
            break;
          case "moods_logged":
            earned = stats.total_moods_logged >= badge.requirement_value;
            break;
          case "gratitude_entries":
            // Check gratitude count separately
            const { count } = await supabase
              .from("gratitude_entries")
              .select("*", { count: "exact", head: true })
              .eq("user_id", user.id);
            earned = (count || 0) >= badge.requirement_value;
            break;
          case "rituals_completed":
            earned = stats.total_rituals_completed >= badge.requirement_value;
            break;
          case "patterns_released":
            earned = stats.total_patterns_released >= badge.requirement_value;
            break;
          case "insights_saved":
            earned = stats.total_insights_saved >= badge.requirement_value;
            break;
          case "duo_streak":
            earned = (duoStreak || 0) >= badge.requirement_value;
            break;
        }

        if (earned) {
          newBadges.push(badge);
        }
      }

      // Award new badges
      for (const badge of newBadges) {
        const { error } = await supabase.from("user_badges").insert({
          user_id: user.id,
          badge_id: badge.id,
        });

        if (!error) {
          setNewlyEarned(badge);
          toast.success(`🏆 Badge Earned: ${badge.name}!`);
          setEarnedBadges((prev) => [
            ...prev,
            { id: crypto.randomUUID(), badge_id: badge.id, earned_at: new Date().toISOString() },
          ]);
        }
      }
    },
    [user, badges, earnedBadges]
  );

  const clearNewlyEarned = () => setNewlyEarned(null);

  const getEarnedBadge = (badgeId: string) => {
    return earnedBadges.find((eb) => eb.badge_id === badgeId);
  };

  return {
    badges,
    earnedBadges,
    isLoading,
    newlyEarned,
    clearNewlyEarned,
    checkAndAwardBadges,
    getEarnedBadge,
    refetch: fetchBadges,
  };
};
