import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminAccessModal from "@/components/AdminAccessModal";
import { toast } from "sonner";
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
  Sparkles,
  Smartphone,
  Timer,
  AlertTriangle,
  BarChart3
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

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
  pwa_installed: boolean;
  pwa_installed_at: string | null;
  total_time_spent_seconds: number;
  last_session_duration_seconds: number;
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

interface ChartData {
  signupsByDay: Array<{ date: string; label: string; count: number }>;
  activityByDay: Array<{ date: string; label: string; moods: number; rituals: number }>;
}

const formatDuration = (seconds: number): string => {
  if (!seconds || seconds < 60) return "< 1m";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

const formatSessionTime = (ms: number | null): string => {
  if (!ms) return "--:--";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const Admin = () => {
  const navigate = useNavigate();
  const proSubscribersRef = useRef<HTMLElement>(null);
  const { 
    isAdmin, 
    isLoading: adminLoading, 
    checkAdminStatus, 
    clearAdminStatus,
    sessionTimeRemaining,
    showTimeoutWarning 
  } = useAdminAuth();
  const [showAccessModal, setShowAccessModal] = useState(false);
  
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [proSubscribers, setProSubscribers] = useState<ProSubscriber[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity>({ moods: [], rituals: [] });
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Show timeout warning toast
  useEffect(() => {
    if (showTimeoutWarning) {
      toast.warning("Session expiring soon!", {
        description: "Your admin session will expire in 5 minutes due to inactivity.",
        duration: 10000,
      });
    }
  }, [showTimeoutWarning]);

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
      setChartData(data.chartData || null);
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

    const profilesChannel = supabase
      .channel('admin-profiles')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'profiles' },
        (payload) => {
          console.log('New signup:', payload);
          toast.success("New user signed up!", {
            description: `${(payload.new as any).nickname || 'New user'} just joined!`,
          });
          fetchAdminData();
        }
      )
      .subscribe();

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
            {/* Session Timer */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
              showTimeoutWarning 
                ? 'bg-amber-500/20 text-amber-600' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {showTimeoutWarning && <AlertTriangle className="w-3 h-3" />}
              <Timer className="w-3 h-3" />
              <span>{formatSessionTime(sessionTimeRemaining)}</span>
            </div>
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

            {/* Engagement Charts */}
            {chartData && (
              <section className="mb-8">
                <h2 className="text-label mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  ENGAGEMENT TRENDS (Last 14 Days)
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Signups Chart */}
                  <div className="card-embrace p-4">
                    <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      New Signups
                    </h3>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData.signupsByDay}>
                          <defs>
                            <linearGradient id="signupGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis 
                            dataKey="label" 
                            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis 
                            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                              fontSize: '12px'
                            }}
                            labelStyle={{ color: 'hsl(var(--foreground))' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="count" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2}
                            fill="url(#signupGradient)" 
                            name="Signups"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Activity Chart */}
                  <div className="card-embrace p-4">
                    <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-pink-500" />
                      Daily Activity
                    </h3>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData.activityByDay}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis 
                            dataKey="label" 
                            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis 
                            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                              fontSize: '12px'
                            }}
                            labelStyle={{ color: 'hsl(var(--foreground))' }}
                          />
                          <Bar dataKey="moods" fill="#ec4899" name="Moods" radius={[2, 2, 0, 0]} />
                          <Bar dataKey="rituals" fill="#06b6d4" name="Rituals" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm bg-pink-500" /> Moods
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm bg-cyan-500" /> Rituals
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pro Subscribers */}
              <section className="lg:col-span-1" ref={proSubscribersRef}>
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
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-foreground text-sm">{u.nickname || "—"}</p>
                            <span className="flex items-center gap-1 text-orange-500 text-sm">
                              🔥 {u.current_streak}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Joined {new Date(u.created_at).toLocaleDateString()}
                            {u.referral_count > 0 && ` • ${u.referral_count} referrals`}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5">
                            {/* PWA Status */}
                            <span className={`flex items-center gap-1 text-xs ${
                              u.pwa_installed ? 'text-green-600' : 'text-muted-foreground'
                            }`}>
                              <Smartphone className="w-3 h-3" />
                              {u.pwa_installed ? 'PWA' : 'Web'}
                            </span>
                            {/* Time Spent */}
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {formatDuration(u.total_time_spent_seconds)}
                            </span>
                          </div>
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
                  onClick={() => {
                    proSubscribersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Highlight effect
                    proSubscribersRef.current?.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
                    setTimeout(() => {
                      proSubscribersRef.current?.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
                    }, 2000);
                  }}
                >
                  <CreditCard className="w-5 h-5 mr-3 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">View Subscriptions</p>
                    <p className="text-sm text-muted-foreground">Jump to Pro subscribers</p>
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