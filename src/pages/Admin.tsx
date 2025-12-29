import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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
  LogOut
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalMoods: number;
  totalRituals: number;
  totalPatterns: number;
  totalInsights: number;
  activeToday: number;
}

interface UserInfo {
  id: string;
  email: string;
  created_at: string;
  nickname: string;
  current_streak: number;
}

const Admin = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading: adminLoading, checkAdminStatus, clearAdminStatus } = useAdminAuth();
  const [showAccessModal, setShowAccessModal] = useState(false);
  
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      setShowAccessModal(true);
    }
  }, [isAdmin, adminLoading]);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  const handleAccessSuccess = () => {
    checkAdminStatus();
  };

  const handleLogout = () => {
    clearAdminStatus();
    navigate("/");
  };

  const fetchAdminData = async () => {
    setIsLoadingData(true);
    try {
      const today = new Date().toISOString().split("T")[0];

      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, nickname, current_streak, created_at");

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
      }

      // Get counts
      const [moodsRes, ritualsRes, patternsRes, insightsRes, activeTodayRes] = await Promise.all([
        supabase.from("mood_entries").select("id", { count: "exact", head: true }),
        supabase.from("rituals_completed").select("id", { count: "exact", head: true }),
        supabase.from("user_patterns").select("id", { count: "exact", head: true }),
        supabase.from("saved_insights").select("id", { count: "exact", head: true }),
        supabase.from("mood_entries").select("user_id", { count: "exact", head: true }).eq("recorded_at", today),
      ]);

      setStats({
        totalUsers: profiles?.length || 0,
        totalMoods: moodsRes.count || 0,
        totalRituals: ritualsRes.count || 0,
        totalPatterns: patternsRes.count || 0,
        totalInsights: insightsRes.count || 0,
        activeToday: activeTodayRes.count || 0,
      });

      // Map profiles to user info (we don't have direct access to auth.users)
      if (profiles) {
        setUsers(profiles.map(p => ({
          id: p.user_id,
          email: "—", // Can't access auth.users email directly
          created_at: p.created_at,
          nickname: p.nickname,
          current_streak: p.current_streak || 0,
        })));
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setIsLoadingData(false);
    }
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
    { icon: Activity, label: "Active Today", value: stats?.activeToday || 0, color: "text-green-500" },
    { icon: Heart, label: "Moods Logged", value: stats?.totalMoods || 0, color: "text-pink-500" },
    { icon: Wind, label: "Rituals Done", value: stats?.totalRituals || 0, color: "text-cyan-500" },
    { icon: Target, label: "Patterns Created", value: stats?.totalPatterns || 0, color: "text-orange-500" },
    { icon: BookOpen, label: "Insights Saved", value: stats?.totalInsights || 0, color: "text-purple-500" },
  ];

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
              <p className="text-sm text-muted-foreground">
                Manage your EmbraceU community
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
        {isLoadingData ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <section className="mb-8">
              <h2 className="text-label mb-4">OVERVIEW</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {statCards.map((stat) => (
                  <div key={stat.label} className="card-embrace text-center py-6">
                    <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                    <p className="text-3xl font-semibold text-foreground mb-1">
                      {stat.value.toLocaleString()}
                    </p>
                    <p className="text-label">{stat.label}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Users List */}
            <section className="mb-8">
              <h2 className="text-label mb-4">USERS ({users.length})</h2>
              <div className="card-embrace overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-label font-medium">Nickname</th>
                        <th className="text-left py-3 px-4 text-label font-medium">Streak</th>
                        <th className="text-left py-3 px-4 text-label font-medium">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b border-border/50 last:border-0">
                          <td className="py-3 px-4 text-foreground">{u.nickname || "—"}</td>
                          <td className="py-3 px-4">
                            <span className="flex items-center gap-1 text-orange-500">
                              🔥 {u.current_streak}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground text-sm">
                            {new Date(u.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Quick Actions */}
            <section>
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
