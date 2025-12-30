import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { AdminStats, RecentActivity, MoodEntry, RitualEntry } from "@/types/admin";

interface UseAdminRealtimeProps {
  isAdmin: boolean;
  onNewSignup: () => void;
  updateStats: (updater: (prev: AdminStats | null) => AdminStats | null) => void;
  updateRecentActivity: (updater: (prev: RecentActivity) => RecentActivity) => void;
}

export const useAdminRealtime = ({
  isAdmin,
  onNewSignup,
  updateStats,
  updateRecentActivity
}: UseAdminRealtimeProps) => {
  const handleNewMood = useCallback((payload: { new: MoodEntry }) => {
    const newMood = payload.new;
    
    updateRecentActivity(prev => ({
      ...prev,
      moods: [newMood, ...prev.moods.slice(0, 19)]
    }));

    updateStats(prev => prev ? {
      ...prev,
      totalMoods: prev.totalMoods + 1,
      activeToday: prev.activeToday + 1
    } : prev);
  }, [updateStats, updateRecentActivity]);

  const handleNewRitual = useCallback((payload: { new: RitualEntry }) => {
    const newRitual = payload.new;

    updateRecentActivity(prev => ({
      ...prev,
      rituals: [newRitual, ...prev.rituals.slice(0, 19)]
    }));

    updateStats(prev => prev ? {
      ...prev,
      totalRituals: prev.totalRituals + 1
    } : prev);
  }, [updateStats, updateRecentActivity]);

  const handleNewSignup = useCallback((payload: { new: { nickname?: string } }) => {
    toast.success("New user signed up!", {
      description: `${payload.new?.nickname || 'New user'} just joined!`,
    });
    onNewSignup();
  }, [onNewSignup]);

  useEffect(() => {
    if (!isAdmin) return;

    console.log('[AdminRealtime] Setting up realtime subscriptions...');

    const profilesChannel = supabase
      .channel('admin-profiles')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'profiles' },
        (payload) => {
          console.log('[AdminRealtime] New profile detected:', payload);
          handleNewSignup(payload as any);
        }
      )
      .subscribe((status) => {
        console.log('[AdminRealtime] Profiles channel status:', status);
      });

    const moodsChannel = supabase
      .channel('admin-moods')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mood_entries' },
        (payload) => {
          console.log('[AdminRealtime] New mood detected:', payload);
          handleNewMood(payload as any);
        }
      )
      .subscribe((status) => {
        console.log('[AdminRealtime] Moods channel status:', status);
      });

    const ritualsChannel = supabase
      .channel('admin-rituals')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'rituals_completed' },
        (payload) => {
          console.log('[AdminRealtime] New ritual detected:', payload);
          handleNewRitual(payload as any);
        }
      )
      .subscribe((status) => {
        console.log('[AdminRealtime] Rituals channel status:', status);
      });

    return () => {
      console.log('[AdminRealtime] Cleaning up subscriptions');
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(moodsChannel);
      supabase.removeChannel(ritualsChannel);
    };
  }, [isAdmin, handleNewSignup, handleNewMood, handleNewRitual]);
};
