import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Sun, Moon, Wind, Heart, BookOpen, Sparkles, 
  TrendingUp, Calendar, Target, Flame, Clock,
  Play, ChevronRight, Star
} from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { usePremium } from "@/hooks/usePremium";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import SEOHead from "@/components/SEOHead";
import ReferralShareCard from "@/components/ReferralShareCard";

interface Profile {
  nickname: string;
  current_streak: number;
  longest_streak: number;
  total_rituals_completed: number;
  total_moods_logged: number;
  total_insights_saved: number;
}

interface TodayTask {
  id: string;
  label: string;
  icon: React.ElementType;
  time: string;
  path: string;
  completed: boolean;
  category: "morning" | "midday" | "evening";
}

const quickActions = [
  { icon: Wind, label: "Breathe", path: "/breath", color: "bg-blue-500/10 text-blue-600" },
  { icon: Heart, label: "Gratitude", path: "/gratitude", color: "bg-pink-500/10 text-pink-600" },
  { icon: Sparkles, label: "Coach", path: "/coach", color: "bg-purple-500/10 text-purple-600" },
  { icon: BookOpen, label: "Library", path: "/library", color: "bg-amber-500/10 text-amber-600" },
  { icon: Target, label: "Reframe", path: "/reframe", color: "bg-green-500/10 text-green-600" },
  { icon: TrendingUp, label: "Progress", path: "/progress", color: "bg-indigo-500/10 text-indigo-600" },
  { icon: Moon, label: "Rituals", path: "/rituals", color: "bg-violet-500/10 text-violet-600" },
  { icon: Calendar, label: "Challenges", path: "/challenges", color: "bg-rose-500/10 text-rose-600" },
  { icon: Sun, label: "Daily", path: "/daily", color: "bg-orange-500/10 text-orange-600" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium } = usePremium();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [greeting, setGreeting] = useState("");
  const [todayTasks, setTodayTasks] = useState<TodayTask[]>([]);
  const [completedToday, setCompletedToday] = useState(0);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("nickname, current_streak, longest_streak, total_rituals_completed, total_moods_logged, total_insights_saved")
        .eq("user_id", user.id)
        .single();

      if (data && !error) {
        setProfile(data);
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    const checkTodayProgress = async () => {
      if (!user) return;

      const today = new Date().toISOString().split("T")[0];
      
      // Check mood entries
      const { data: moods } = await supabase
        .from("mood_entries")
        .select("id")
        .eq("user_id", user.id)
        .eq("recorded_at", today);

      // Check rituals completed
      const { data: rituals } = await supabase
        .from("rituals_completed")
        .select("ritual_type")
        .eq("user_id", user.id)
        .eq("completed_at", today);

      // Check gratitude entries
      const { data: gratitudes } = await supabase
        .from("gratitude_entries")
        .select("id")
        .eq("user_id", user.id)
        .gte("created_at", today);

      const hasMood = (moods?.length || 0) > 0;
      const hasBreathwork = rituals?.some(r => r.ritual_type.toLowerCase().includes("breath"));
      const hasGratitude = (gratitudes?.length || 0) > 0;

      const tasks: TodayTask[] = [
        {
          id: "intention",
          label: "Morning Intention",
          icon: Sun,
          time: "2 min",
          path: "/daily",
          completed: hasMood,
          category: "morning",
        },
        {
          id: "breathwork",
          label: "Breathwork",
          icon: Wind,
          time: "5 min",
          path: "/breath",
          completed: !!hasBreathwork,
          category: "morning",
        },
        {
          id: "mood",
          label: "Mood Check-in",
          icon: Heart,
          time: "1 min",
          path: "/daily",
          completed: hasMood,
          category: "midday",
        },
        {
          id: "gratitude",
          label: "Evening Gratitude",
          icon: Moon,
          time: "3 min",
          path: "/gratitude",
          completed: hasGratitude,
          category: "evening",
        },
      ];

      setTodayTasks(tasks);
      setCompletedToday(tasks.filter(t => t.completed).length);
    };

    checkTodayProgress();
  }, [user]);

  const progressPercent = todayTasks.length > 0 ? (completedToday / todayTasks.length) * 100 : 0;

  return (
    <AppLayout showHeader={false}>
      <SEOHead 
        title="Dashboard | EmbraceU"
        description="Your personal wellness dashboard"
        path="/dashboard"
      />
      
      <div className="py-6 space-y-6">
        {/* Hero Greeting */}
        <div className="text-center pt-4">
          <p className="text-muted-foreground text-sm mb-1">{greeting}</p>
          <h1 className="font-serif text-3xl text-foreground">
            {profile?.nickname || "Friend"}
          </h1>
          
          {/* Streak display */}
          {(profile?.current_streak || 0) > 0 && (
            <div className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
              <Flame className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-foreground">
                {profile?.current_streak} day streak
              </span>
              {isPremium && <Star className="w-3 h-3 text-accent fill-accent" />}
            </div>
          )}
        </div>

        {/* Today's Progress Card */}
        <Card className="p-5 bg-card/50 backdrop-blur-sm border-border/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-foreground">Today's Journey</h2>
            </div>
            <span className="text-sm text-muted-foreground">{completedToday}/{todayTasks.length} complete</span>
          </div>
          
          <Progress value={progressPercent} className="h-2 mb-4" />
          
          <div className="space-y-2">
            {todayTasks.map((task) => (
              <button
                key={task.id}
                onClick={() => navigate(task.path)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-xl transition-all",
                  task.completed 
                    ? "bg-success/50 text-success-foreground" 
                    : "bg-secondary/50 hover:bg-secondary"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    task.completed ? "bg-success" : "bg-primary/10"
                  )}>
                    <task.icon className={cn(
                      "w-4 h-4",
                      task.completed ? "text-success-foreground" : "text-primary"
                    )} />
                  </div>
                  <span className={cn(
                    "font-medium",
                    task.completed && "line-through opacity-70"
                  )}>{task.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {task.time}
                  </span>
                  {!task.completed && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Quick Actions Grid */}
        <div>
          <h2 className="text-label mb-3">QUICK ACTIONS</h2>
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center p-4 rounded-2xl bg-card/50 border border-border/50 hover:border-accent/30 transition-all hover:scale-[1.02]"
              >
                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-2", action.color)}>
                  <action.icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-foreground">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-pink-500" />
              <span className="text-xs text-muted-foreground">Moods Logged</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{profile?.total_moods_logged || 0}</p>
          </Card>
          <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-muted-foreground">Insights Saved</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{profile?.total_insights_saved || 0}</p>
          </Card>
          <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Rituals Done</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{profile?.total_rituals_completed || 0}</p>
          </Card>
          <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-muted-foreground">Best Streak</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{profile?.longest_streak || 0} days</p>
          </Card>
        </div>

        {/* Referral Share Card */}
        <ReferralShareCard />

        {/* Explore More */}
        <Card className="p-5 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg text-foreground mb-1">Explore Features</h3>
              <p className="text-sm text-muted-foreground">Discover meditations, challenges, and more</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/explore")}
              className="rounded-full bg-primary/10 hover:bg-primary/20"
            >
              <Play className="w-5 h-5 text-primary" />
            </Button>
          </div>
        </Card>

        {/* Pro upgrade prompt for non-premium */}
        {!isPremium && (
          <Card className="p-5 bg-gradient-to-br from-accent/5 to-accent/15 border-accent/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <Star className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Unlock Pro</h3>
                  <p className="text-xs text-muted-foreground">Exclusive meditations & more</p>
                </div>
              </div>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => navigate("/pro")}
                className="border-accent/30 text-accent hover:bg-accent/10"
              >
                Upgrade
              </Button>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
