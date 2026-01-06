import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

const MILESTONES = [7, 14, 30, 60, 100, 365];

interface StreakMilestoneData {
  currentStreak: number;
  pendingMilestone: number | null;
  celebrateMilestone: () => void;
  checkMilestones: () => Promise<void>;
}

export const useStreakMilestones = (): StreakMilestoneData => {
  const { user } = useAuth();
  const [currentStreak, setCurrentStreak] = useState(0);
  const [pendingMilestone, setPendingMilestone] = useState<number | null>(null);

  const checkMilestones = useCallback(async () => {
    if (!user) return;

    try {
      // Get current streak
      const { data: profile } = await supabase
        .from("profiles")
        .select("current_streak")
        .eq("user_id", user.id)
        .single();

      if (!profile) return;

      const streak = profile.current_streak || 0;
      setCurrentStreak(streak);

      // Check for uncelebrated milestones
      const { data: celebratedMilestones } = await supabase
        .from("streak_milestones")
        .select("milestone_days")
        .eq("user_id", user.id);

      const celebratedDays = new Set(
        celebratedMilestones?.map((m) => m.milestone_days) || []
      );

      // Find the highest milestone the user has reached but not celebrated
      const uncelebrated = MILESTONES.filter(
        (m) => streak >= m && !celebratedDays.has(m)
      ).sort((a, b) => b - a);

      if (uncelebrated.length > 0) {
        setPendingMilestone(uncelebrated[0]);
      }
    } catch (error) {
      console.error("Error checking milestones:", error);
    }
  }, [user]);

  const celebrateMilestone = useCallback(async () => {
    if (!user || !pendingMilestone) return;

    try {
      // Record the milestone as celebrated
      await supabase.from("streak_milestones").insert({
        user_id: user.id,
        milestone_days: pendingMilestone,
      });

      // Check for the next uncelebrated milestone
      const { data: celebratedMilestones } = await supabase
        .from("streak_milestones")
        .select("milestone_days")
        .eq("user_id", user.id);

      const celebratedDays = new Set(
        celebratedMilestones?.map((m) => m.milestone_days) || []
      );

      const nextUncelebrated = MILESTONES.filter(
        (m) => currentStreak >= m && !celebratedDays.has(m)
      ).sort((a, b) => b - a);

      setPendingMilestone(nextUncelebrated[0] || null);
    } catch (error) {
      console.error("Error celebrating milestone:", error);
    }
  }, [user, pendingMilestone, currentStreak]);

  useEffect(() => {
    checkMilestones();
  }, [checkMilestones]);

  return {
    currentStreak,
    pendingMilestone,
    celebrateMilestone,
    checkMilestones,
  };
};
