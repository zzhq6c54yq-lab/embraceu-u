import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminAccessModal from "@/components/AdminAccessModal";
import { 
  Users, 
  CreditCard, 
  Activity, 
  ArrowLeft,
  Crown,
  Calendar,
  Heart,
  Wind,
  Target,
  BookOpen,
  Loader2,
  RefreshCw,
  LogOut,
  Zap,
  TrendingUp,
  Clock,
  Sparkles
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalMoods: number;
  totalRituals: number;
  totalPatterns: number;
  totalInsights: number;
  totalGratitude: number;
  activeToday: number;
  newSignupsToday: number;
  proSubscribers: number;
}

interface UserInfo {
  user_id: string;
  nickname: string;
  current_streak: number;
  longest_streak: number;
  created_at: string;
  theme_preference: string;
  referral_count: number;
}

interface ProSubscriber {
  id: string;
  email: string;
  name: string;
  status: string;
  currentPeriodEnd: string;
  created: string;
  plan: string;
}

interface RecentActivity {
  moods: Array<{ id: string; mood: string; created_at: string; user_id: string }>;
  rituals: Array<{ id: string; ritual_type: string; created_at: string; user_id: string }>;
}

const Admin = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading: adminLoading, checkAdminStatus, clearAdminStatus } = useAdminAuth();
  const [showAccessModal, setShowAccessModal] = useState(false);
  
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [proSubscribers, setProSubscribers] = useState<ProSubscriber[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity>({ moods: [], rituals: [] });
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      setShowAccessModal(true);
    }
  }, [isAdmin, adminLoading]);

  const fetchAdminData = useCallback(async () => {
    if (!isAdmin) return;
    
    setIsLoadingData(true);
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
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setIsLoadingData(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin, fetchAdminData]);

  // Set up realtime subscriptions for live updates
  useEffect(() => {
    if (!isAdmin) return;

    // Subscribe to new signups (profiles table)
    const profilesChannel = supabase
      .channel('admin-profiles')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'profiles' },
        (payload) => {
          console.log('New signup:', payload);
          // Refresh data when new user signs up
          fetchAdminData();
        }
      )
      .subscribe();

    // Subscribe to mood entries
    const moodsChannel = supabase
      .channel('admin-moods')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mood_entries' },
        (payload) => {
          console.log('New mood entry:', payload);
          setRecentActivity(prev => ({
            ...prev,
            moods: [payload.new as any, ...prev.moods.slice(0, 19)]
          }));
          setStats(prev => prev ? { 
            ...prev, 
            totalMoods: prev.totalMoods + 1,
            activeToday: prev.activeToday + 1 
          } : prev);
        }
      )
      .subscribe();

    // Subscribe to rituals completed
    const ritualsChannel = supabase
      .channel('admin-rituals')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'rituals_completed' },
        (payload) => {
          console.log('New ritual completed:', payload);
          setRecentActivity(prev => ({
            ...prev,
            rituals: [payload.new as any, ...prev.rituals.slice(0, 19)]
          }));
          setStats(prev => prev ? { ...prev, totalRituals: prev.totalRituals + 1 } : prev);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(moodsChannel);
      supabase.removeChannel(ritualsChannel);
    };
  }, [isAdmin, fetchAdminData]);

  const handleAccessSuccess = () => {
    checkAdminStatus();
  };

  const handleLogout = async () => {
    await clearAdminStatus();
    navigate("/");
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <AdminAccessModal 
          open={showAccessModal} 
          onOpenChange={(open) => {
            setShowAccessModal(open);
            if (!open) navigate("/");
          }}
          onSuccess={handleAccessSuccess}
        />
      </div>
    );
  }

  const statCards = [
    { icon: Users, label: "Total Users", value: stats?.totalUsers || 0, color: "text-blue-500" },
    { icon: TrendingUp, label: "New Today", value: stats?.newSignupsToday || 0, color: "text-emerald-500" },
    { icon: Crown, label: "Pro Subscribers", value: stats?.proSubscribers || 0, color: "text-amber-500" },
    { icon: Activity, label: "Active Today", value: stats?.activeToday || 0, color: "text-green-500" },
    { icon: Heart, label: "Moods Logged", value: stats?.totalMoods || 0, color: "text-pink-500" },
    { icon: Wind, label: "Rituals Done", value: stats?.totalRituals || 0, color: "text-cyan-500" },
    { icon: Target, label: "Patterns", value: stats?.totalPatterns || 0, color: "text-orange-500" },
    { icon: BookOpen, label: "Insights", value: stats?.totalInsights || 0, color: "text-purple-500" },
  ];

  // Combine recent activity for feed
  const activityFeed = [
    ...recentActivity.moods.map(m => ({ type: 'mood' as const, ...m })),
    ...recentActivity.rituals.map(r => ({ type: 'ritual' as const, ...r })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 15);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-serif italic text-xl text-foreground flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                Admin Dashboard
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Zap className="w-3 h-3 text-green-500" />
                Live updates enabled
                {lastUpdated && (
                  <span className="text-xs">• Last sync: {formatTimeAgo(lastUpdated.toISOString())}</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAdminData}
              disabled={isLoadingData}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingData ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Exit
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoadingData && !stats ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <section className="mb-8">
              <h2 className="text-label mb-4">OVERVIEW</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statCards.map((stat) => (
                  <div key={stat.label} className="card-embrace text-center py-5">
                    <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                    <p className="text-2xl font-semibold text-foreground mb-1">
                      {stat.value.toLocaleString()}
                    </p>
                    <p className="text-label text-xs">{stat.label}</p>
                  </div>
                ))}
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pro Subscribers */}
              <section className="lg:col-span-1">
                <h2 className="text-label mb-4 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-500" />
                  PRO SUBSCRIBERS ({proSubscribers.length})
                </h2>
                <div className="card-embrace max-h-[400px] overflow-y-auto">
                  {proSubscribers.length === 0 ? (
                    <p className="text-muted-foreground text-center py-6">No Pro subscribers yet</p>
                  ) : (
                    <div className="divide-y divide-border">
                      {proSubscribers.map((sub) => (
                        <div key={sub.id} className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-foreground text-sm">{sub.name}</p>
                              <p className="text-xs text-muted-foreground">{sub.email}</p>
                            </div>
                            <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-600">
                              {sub.plan}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Renews: {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Recent Activity Feed */}
              <section className="lg:col-span-1">
                <h2 className="text-label mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  LIVE ACTIVITY FEED
                </h2>
                <div className="card-embrace max-h-[400px] overflow-y-auto">
                  {activityFeed.length === 0 ? (
                    <p className="text-muted-foreground text-center py-6">No recent activity</p>
                  ) : (
                    <div className="divide-y divide-border">
                      {activityFeed.map((item) => (
                        <div key={item.id} className="p-3 flex items-center gap-3">
                          {item.type === 'mood' ? (
                            <Heart className="w-4 h-4 text-pink-500 flex-shrink-0" />
                          ) : (
                            <Wind className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground truncate">
                              {item.type === 'mood' 
                                ? `Mood: ${(item as any).mood}`
                                : `Ritual: ${(item as any).ritual_type}`
                              }
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimeAgo(item.created_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Users List */}
              <section className="lg:col-span-1">
                <h2 className="text-label mb-4">USERS ({users.length})</h2>
                <div className="card-embrace max-h-[400px] overflow-y-auto">
                  {users.length === 0 ? (
                    <p className="text-muted-foreground text-center py-6">No users yet</p>
                  ) : (
                    <div className="divide-y divide-border">
                      {users.slice(0, 50).map((u) => (
                        <div key={u.user_id} className="p-3">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-foreground text-sm">{u.nickname || "—"}</p>
                            <span className="flex items-center gap-1 text-orange-500 text-sm">
                              🔥 {u.current_streak}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Joined {new Date(u.created_at).toLocaleDateString()}
                            {u.referral_count > 0 && ` • ${u.referral_count} referrals`}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Quick Actions */}
            <section className="mt-8">
              <h2 className="text-label mb-4">QUICK ACTIONS</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="justify-start h-auto py-4"
                  onClick={() => navigate("/progress")}
                >
                  <CreditCard className="w-5 h-5 mr-3 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">View Subscriptions</p>
                    <p className="text-sm text-muted-foreground">Manage premium users</p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start h-auto py-4"
                  onClick={() => navigate("/daily")}
                >
                  <Calendar className="w-5 h-5 mr-3 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">Daily Dashboard</p>
                    <p className="text-sm text-muted-foreground">View as user</p>
                  </div>
                </Button>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Admin;
