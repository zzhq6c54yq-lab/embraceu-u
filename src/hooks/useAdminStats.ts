import { useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { 
  AdminStats, UserInfo, ProSubscriber, RecentActivity, ChartData, 
  ActivityFeedItem, UserFilterOption 
} from "@/types/admin";

interface UseAdminStatsReturn {
  stats: AdminStats | null;
  users: UserInfo[];
  proSubscribers: ProSubscriber[];
  recentActivity: RecentActivity;
  chartData: ChartData | null;
  activityFeed: ActivityFeedItem[];
  isLoading: boolean;
  lastUpdated: Date | null;
  fetchData: () => Promise<void>;
  // User filtering
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeFilter: UserFilterOption;
  setActiveFilter: (filter: UserFilterOption) => void;
  filteredUsers: UserInfo[];
  // Optimistic updates
  updateStats: (updater: (prev: AdminStats | null) => AdminStats | null) => void;
  updateRecentActivity: (updater: (prev: RecentActivity) => RecentActivity) => void;
}

export const useAdminStats = (): UseAdminStatsReturn => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [proSubscribers, setProSubscribers] = useState<ProSubscriber[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity>({ moods: [], rituals: [] });
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // User filtering state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<UserFilterOption>('all');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-admin-stats');

      if (error) {
        console.error("Error fetching admin stats:", error);
        return;
      }

      setStats(data.stats);
      setUsers(data.users || []);
      setProSubscribers(data.proSubscribers || []);
      setRecentActivity(data.recentActivity || { moods: [], rituals: [] });
      setChartData(data.chartData || null);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Build activity feed from moods and rituals
  const activityFeed = useMemo<ActivityFeedItem[]>(() => {
    const moodItems: ActivityFeedItem[] = recentActivity.moods.map(m => ({
      id: m.id,
      type: 'mood',
      created_at: m.created_at,
      user_id: m.user_id,
      mood: m.mood
    }));

    const ritualItems: ActivityFeedItem[] = recentActivity.rituals.map(r => ({
      id: r.id,
      type: 'ritual',
      created_at: r.created_at,
      user_id: r.user_id,
      ritual_type: r.ritual_type
    }));

    return [...moodItems, ...ritualItems]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 15);
  }, [recentActivity]);

  // Filter users based on search and filter options
  const filteredUsers = useMemo(() => {
    let result = users;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(user =>
        user.nickname?.toLowerCase().includes(query) ||
        user.user_id.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (activeFilter === 'pwa') {
      result = result.filter(user => user.pwa_installed);
    } else if (activeFilter === 'web') {
      result = result.filter(user => !user.pwa_installed);
    }

    return result;
  }, [users, searchQuery, activeFilter]);

  return {
    stats,
    users,
    proSubscribers,
    recentActivity,
    chartData,
    activityFeed,
    isLoading,
    lastUpdated,
    fetchData,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    filteredUsers,
    updateStats: setStats,
    updateRecentActivity: setRecentActivity
  };
};
