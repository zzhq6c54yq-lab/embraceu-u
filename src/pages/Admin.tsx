import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useAdminStats } from "@/hooks/useAdminStats";
import { useAdminRealtime } from "@/hooks/useAdminRealtime";
import { Button } from "@/components/ui/button";
import { Loader2, Crown, Sparkles, CreditCard, Calendar } from "lucide-react";
import AdminAccessModal from "@/components/AdminAccessModal";
import { toast } from "sonner";
import { 
  Users, Activity, Heart, Wind, Target, BookOpen, TrendingUp 
} from "lucide-react";

import {
  AdminHeader,
  AdminStatCard,
  AdminCharts,
  AdminUserCard,
  AdminUserSearch,
  AdminActivityItem,
  AdminProSubscriberCard,
  AdminNotificationForm,
  AdminExportButton
} from "@/components/admin";

import type { StatCardConfig, UserInfo, ProSubscriber } from "@/types/admin";

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

  const {
    stats,
    users,
    proSubscribers,
    chartData,
    activityFeed,
    isLoading: isLoadingData,
    lastUpdated,
    fetchData,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    filteredUsers,
    updateStats,
    updateRecentActivity
  } = useAdminStats();

  // Set up realtime subscriptions
  useAdminRealtime({
    isAdmin,
    onNewSignup: fetchData,
    updateStats,
    updateRecentActivity
  });

  // Show timeout warning toast
  useEffect(() => {
    if (showTimeoutWarning) {
      toast.warning("Session expiring soon!", {
        description: "Your admin session will expire in 5 minutes due to inactivity.",
        duration: 10000,
      });
    }
  }, [showTimeoutWarning]);

  // Show access modal if not admin
  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      setShowAccessModal(true);
    }
  }, [isAdmin, adminLoading]);

  // Fetch data when admin
  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin, fetchData]);

  const handleAccessSuccess = () => {
    checkAdminStatus();
  };

  const handleLogout = async () => {
    await clearAdminStatus();
    navigate("/");
  };

  // Loading state
  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not admin - show access modal
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

  const statCards: StatCardConfig[] = [
    { icon: Users, label: "Total Users", value: stats?.totalUsers || 0, color: "text-blue-500" },
    { icon: TrendingUp, label: "New Today", value: stats?.newSignupsToday || 0, color: "text-emerald-500" },
    { icon: Crown, label: "Pro Subscribers", value: stats?.proSubscribers || 0, color: "text-amber-500" },
    { icon: Activity, label: "Active Today", value: stats?.activeToday || 0, color: "text-green-500" },
    { icon: Heart, label: "Moods Logged", value: stats?.totalMoods || 0, color: "text-pink-500" },
    { icon: Wind, label: "Rituals Done", value: stats?.totalRituals || 0, color: "text-cyan-500" },
    { icon: Target, label: "Patterns", value: stats?.totalPatterns || 0, color: "text-orange-500" },
    { icon: BookOpen, label: "Insights", value: stats?.totalInsights || 0, color: "text-purple-500" },
  ];

  // Prepare export data
  const usersExportData = users.map(u => ({
    nickname: u.nickname,
    streak: u.current_streak,
    longest_streak: u.longest_streak,
    joined: u.created_at,
    referrals: u.referral_count,
    pwa_installed: u.pwa_installed ? 'Yes' : 'No',
    total_time_minutes: Math.round(u.total_time_spent_seconds / 60)
  }));

  const proExportData = proSubscribers.map(s => ({
    name: s.name,
    email: s.email,
    plan: s.plan,
    status: s.status,
    renewal_date: s.currentPeriodEnd
  }));

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader
        lastUpdated={lastUpdated}
        sessionTimeRemaining={sessionTimeRemaining}
        showTimeoutWarning={showTimeoutWarning}
        isLoadingData={isLoadingData}
        onRefresh={fetchData}
        onLogout={handleLogout}
      />

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
                  <AdminStatCard
                    key={stat.label}
                    icon={stat.icon}
                    label={stat.label}
                    value={stat.value}
                    color={stat.color}
                    isLoading={isLoadingData && !stats}
                  />
                ))}
              </div>
            </section>

            {/* Engagement Charts */}
            {chartData && <AdminCharts chartData={chartData} />}

            {/* Three Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pro Subscribers */}
              <section className="lg:col-span-1" ref={proSubscribersRef}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-label flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-500" />
                    PRO SUBSCRIBERS ({proSubscribers.length})
                  </h2>
                  <AdminExportButton<Record<string, unknown>>
                    data={proExportData as unknown as Record<string, unknown>[]}
                    filename="pro_subscribers"
                    label="Export"
                  />
                </div>
                <div className="card-embrace max-h-[400px] overflow-y-auto">
                  {proSubscribers.length === 0 ? (
                    <p className="text-muted-foreground text-center py-6">No Pro subscribers yet</p>
                  ) : (
                    <div className="divide-y divide-border">
                      {proSubscribers.map((sub) => (
                        <AdminProSubscriberCard key={sub.id} subscriber={sub} />
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
                        <AdminActivityItem key={item.id} item={item} />
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Users List */}
              <section className="lg:col-span-1">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-label">USERS ({users.length})</h2>
                  <AdminExportButton<Record<string, unknown>>
                    data={usersExportData as unknown as Record<string, unknown>[]}
                    filename="users"
                    label="Export"
                  />
                </div>
                <div className="card-embrace max-h-[400px] overflow-y-auto">
                  <div className="p-3 border-b border-border">
                    <AdminUserSearch
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                      activeFilter={activeFilter}
                      onFilterChange={setActiveFilter}
                      totalCount={users.length}
                      filteredCount={filteredUsers.length}
                    />
                  </div>
                  {filteredUsers.length === 0 ? (
                    <p className="text-muted-foreground text-center py-6">
                      {users.length === 0 ? "No users yet" : "No matching users"}
                    </p>
                  ) : (
                    <div className="divide-y divide-border">
                      {filteredUsers.slice(0, 50).map((user) => (
                        <AdminUserCard key={user.user_id} user={user} />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Send Announcement */}
            <AdminNotificationForm />

            {/* Quick Actions */}
            <section className="mt-8">
              <h2 className="text-label mb-4">QUICK ACTIONS</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="justify-start h-auto py-4"
                  onClick={() => {
                    proSubscribersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
