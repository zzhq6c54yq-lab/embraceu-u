import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Eye, TrendingUp, Clock, Users } from "lucide-react";

interface VisitorStats {
  totalVisits: number;
  todayVisits: number;
  uniqueVisitors: number;
  thisWeekVisits: number;
}

const AdminVisitorCounter = () => {
  const [stats, setStats] = useState<VisitorStats>({
    totalVisits: 0,
    todayVisits: 0,
    uniqueVisitors: 0,
    thisWeekVisits: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const startOfWeek = new Date(now.setDate(now.getDate() - 7)).toISOString();

      // Fetch all counts in parallel
      const [totalResult, todayResult, weekResult, uniqueResult] = await Promise.all([
        supabase.from('site_visits').select('id', { count: 'exact', head: true }),
        supabase.from('site_visits').select('id', { count: 'exact', head: true }).gte('created_at', startOfDay),
        supabase.from('site_visits').select('id', { count: 'exact', head: true }).gte('created_at', startOfWeek),
        supabase.from('site_visits').select('visitor_id').limit(10000) // Get unique visitors
      ]);

      // Calculate unique visitors
      const uniqueVisitorIds = new Set(uniqueResult.data?.map(v => v.visitor_id) || []);

      setStats({
        totalVisits: totalResult.count || 0,
        todayVisits: todayResult.count || 0,
        thisWeekVisits: weekResult.count || 0,
        uniqueVisitors: uniqueVisitorIds.size
      });
    } catch (error) {
      console.error('Error fetching visitor stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('admin-site-visits')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'site_visits' },
        () => {
          // Increment counters optimistically
          setStats(prev => ({
            ...prev,
            totalVisits: prev.totalVisits + 1,
            todayVisits: prev.todayVisits + 1,
            thisWeekVisits: prev.thisWeekVisits + 1
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (isLoading) {
    return (
      <div className="card-embrace p-4 animate-pulse">
        <div className="h-16 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="card-embrace p-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
        <Eye className="w-4 h-4" />
        SITE TRAFFIC
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-foreground tabular-nums">
            {formatNumber(stats.totalVisits)}
          </p>
          <p className="text-xs text-muted-foreground">Total Visits</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-foreground tabular-nums">
            {formatNumber(stats.todayVisits)}
          </p>
          <p className="text-xs text-muted-foreground">Today</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-foreground tabular-nums">
            {formatNumber(stats.thisWeekVisits)}
          </p>
          <p className="text-xs text-muted-foreground">This Week</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-foreground tabular-nums">
            {formatNumber(stats.uniqueVisitors)}
          </p>
          <p className="text-xs text-muted-foreground">Unique Visitors</p>
        </div>
      </div>
    </div>
  );
};

export default AdminVisitorCounter;
