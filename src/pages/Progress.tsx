import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Flame, 
  Target, 
  Heart, 
  BookOpen, 
  Wind,
  Award,
  Calendar
} from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { usePremium } from "@/hooks/usePremium";
import PremiumThemes from "@/components/PremiumThemes";
import ExclusiveContent from "@/components/ExclusiveContent";
import UpgradeModal from "@/components/UpgradeModal";

interface ProfileStats {
  nickname: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  total_rituals_completed: number;
  total_patterns_released: number;
  total_moods_logged: number;
  total_insights_saved: number;
  created_at: string;
}

interface ActivitySummary {
  moodsThisWeek: number;
  ritualsThisWeek: number;
  patternsActive: number;
  qualitiesActive: number;
  insightsSaved: number;
  visionsCreated: number;
}

const Progress = () => {
  const { user } = useAuth();
  const { isPremium } = usePremium();
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [activity, setActivity] = useState<ActivitySummary>({
    moodsThisWeek: 0,
    ritualsThisWeek: 0,
    patternsActive: 0,
    qualitiesActive: 0,
    insightsSaved: 0,
    visionsCreated: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      // Get profile stats
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile) {
        setStats(profile as ProfileStats);
      }

      // Get weekly activity
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split("T")[0];

      const [moodsRes, ritualsRes, patternsRes, qualitiesRes, insightsRes, visionsRes] = await Promise.all([
        supabase
          .from("mood_entries")
          .select("id")
          .eq("user_id", user.id)
          .gte("recorded_at", weekAgoStr),
        supabase
          .from("rituals_completed")
          .select("id")
          .eq("user_id", user.id)
          .gte("completed_at", weekAgoStr),
        supabase
          .from("user_patterns")
          .select("id")
          .eq("user_id", user.id)
          .eq("is_released", false),
        supabase
          .from("user_qualities")
          .select("id")
          .eq("user_id", user.id),
        supabase
          .from("saved_insights")
          .select("id")
          .eq("user_id", user.id),
        supabase
          .from("user_visions")
          .select("id")
          .eq("user_id", user.id),
      ]);

      setActivity({
        moodsThisWeek: moodsRes.data?.length || 0,
        ritualsThisWeek: ritualsRes.data?.length || 0,
        patternsActive: patternsRes.data?.length || 0,
        qualitiesActive: qualitiesRes.data?.length || 0,
        insightsSaved: insightsRes.data?.length || 0,
        visionsCreated: visionsRes.data?.length || 0,
      });

      // Update streak
      await updateStreak();

      setIsLoading(false);
    };

    const updateStreak = async () => {
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      // Check if user was active today
      const { data: todayActivity } = await supabase
        .from("mood_entries")
        .select("id")
        .eq("user_id", user.id)
        .eq("recorded_at", today)
        .limit(1);

      const { data: todayRituals } = await supabase
        .from("rituals_completed")
        .select("id")
        .eq("user_id", user.id)
        .eq("completed_at", today)
        .limit(1);

      const wasActiveToday = (todayActivity?.length || 0) > 0 || (todayRituals?.length || 0) > 0;

      if (wasActiveToday && stats) {
        const lastActive = stats.last_active_date;
        let newStreak = stats.current_streak;

        if (!lastActive || lastActive === yesterdayStr) {
          newStreak = stats.current_streak + 1;
        } else if (lastActive !== today) {
          newStreak = 1;
        }

        const longestStreak = Math.max(newStreak, stats.longest_streak);

        await supabase
          .from("profiles")
          .update({
            current_streak: newStreak,
            longest_streak: longestStreak,
            last_active_date: today,
          })
          .eq("user_id", user.id);

        setStats((prev) => prev ? { ...prev, current_streak: newStreak, longest_streak: longestStreak } : null);
      }
    };

    fetchData();
  }, [user]);

  const memberSince = stats?.created_at
    ? new Date(stats.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "";

  const statCards = [
    { 
      icon: Flame, 
      label: "Current Streak", 
      value: stats?.current_streak || 0, 
      suffix: "days",
      color: "text-orange-500"
    },
    { 
      icon: Award, 
      label: "Longest Streak", 
      value: stats?.longest_streak || 0, 
      suffix: "days",
      color: "text-yellow-500"
    },
    { 
      icon: Wind, 
      label: "Rituals Completed", 
      value: activity.ritualsThisWeek, 
      suffix: "this week",
      color: "text-blue-500"
    },
    { 
      icon: Heart, 
      label: "Moods Logged", 
      value: activity.moodsThisWeek, 
      suffix: "this week",
      color: "text-pink-500"
    },
  ];

  const activityItems = [
    { icon: Target, label: "Patterns in Progress", value: activity.patternsActive },
    { icon: TrendingUp, label: "Qualities Cultivating", value: activity.qualitiesActive },
    { icon: BookOpen, label: "Insights Saved", value: activity.insightsSaved },
    { icon: Calendar, label: "Visions Created", value: activity.visionsCreated },
  ];

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="mt-2 mb-8 text-center">
        <h1 className="font-serif italic text-3xl text-foreground mb-2">
          Your Progress
        </h1>
        <p className="text-muted-foreground">
          {stats?.nickname ? `Welcome back, ${stats.nickname}` : "Track your growth journey"}
        </p>
        {memberSince && (
          <p className="text-xs text-muted-foreground mt-2">
            Member since {memberSince}
          </p>
        )}
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="card-embrace text-center py-6"
          >
            <stat.icon className={cn("w-8 h-8 mx-auto mb-3", stat.color)} />
            <p className="text-3xl font-semibold text-foreground mb-1">
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {stat.suffix}
            </p>
            <p className="text-label mt-2">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Activity Summary */}
      <section className="mb-8">
        <h2 className="text-label mb-4">ACTIVITY SUMMARY</h2>
        <div className="space-y-3">
          {activityItems.map((item) => (
            <div
              key={item.label}
              className="card-embrace flex items-center justify-between py-4"
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-primary" />
                <span className="font-serif italic text-foreground">
                  {item.label}
                </span>
              </div>
              <span className="text-xl font-semibold text-foreground">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Weekly Progress Bar */}
      <section className="mb-8">
        <h2 className="text-label mb-4">WEEKLY ENGAGEMENT</h2>
        <div className="card-embrace">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>This Week's Activity</span>
            <span>{activity.moodsThisWeek + activity.ritualsThisWeek} actions</span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{
                width: `${Math.min((activity.moodsThisWeek + activity.ritualsThisWeek) * 10, 100)}%`,
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {activity.moodsThisWeek + activity.ritualsThisWeek >= 7
              ? "Amazing consistency!"
              : activity.moodsThisWeek + activity.ritualsThisWeek >= 3
              ? "Great progress, keep going!"
              : "Every action counts. Start today."}
          </p>
        </div>
      </section>

      {/* Motivational Quote */}
      <section className="pb-8">
        <div className="insight-card-accent text-center">
          <p className="font-serif italic text-lg text-success-foreground">
            "Small daily improvements lead to staggering long-term results."
          </p>
        </div>
      </section>

      {/* Premium Features Section */}
      <section className="pb-8">
        <div className="card-embrace">
          <PremiumThemes />
        </div>
      </section>

      <section className="pb-20">
        <div className="card-embrace">
          <ExclusiveContent onUpgradeClick={() => setShowUpgradeModal(true)} />
        </div>
      </section>

      <UpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
    </AppLayout>
  );
};

export default Progress;
