import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Heart, Sparkles, Brain, HeartHandshake, Users, TrendingUp, Check, Trophy, Calendar, Share2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ChallengeTemplate {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon_name: string;
  color: string;
}

interface ChallengeDay {
  id: string;
  day_number: number;
  title: string;
  description: string;
}

interface ChallengeProgress {
  id: string;
  day_number: number;
  completed_at: string;
  reflection: string | null;
}

const iconMap: Record<string, React.ElementType> = {
  Heart,
  Sparkles,
  Brain,
  HeartHandshake,
  Users,
  TrendingUp,
};

const iconColorMap: Record<string, string> = {
  rose: "text-rose-500",
  amber: "text-amber-500",
  cyan: "text-cyan-500",
  pink: "text-pink-500",
  violet: "text-violet-500",
  emerald: "text-emerald-500",
};

const bgColorMap: Record<string, string> = {
  rose: "from-rose-500/20 to-rose-600/10",
  amber: "from-amber-500/20 to-amber-600/10",
  cyan: "from-cyan-500/20 to-cyan-600/10",
  pink: "from-pink-500/20 to-pink-600/10",
  violet: "from-violet-500/20 to-violet-600/10",
  emerald: "from-emerald-500/20 to-emerald-600/10",
};

const ChallengeDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [template, setTemplate] = useState<ChallengeTemplate | null>(null);
  const [days, setDays] = useState<ChallengeDay[]>([]);
  const [completedDays, setCompletedDays] = useState<ChallengeProgress[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [reflection, setReflection] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;

      // Fetch template
      const { data: templateData, error: templateError } = await supabase
        .from("challenge_templates")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (templateError || !templateData) {
        toast.error("Challenge not found");
        navigate("/challenges");
        return;
      }

      setTemplate(templateData);

      // Fetch days
      const { data: daysData } = await supabase
        .from("challenge_template_days")
        .select("*")
        .eq("template_id", templateData.id)
        .order("day_number", { ascending: true });

      if (daysData) setDays(daysData);

      // Fetch user progress
      if (user) {
        const { data: progressData } = await supabase
          .from("challenge_progress")
          .select("*")
          .eq("user_id", user.id)
          .eq("template_id", templateData.id);

        if (progressData) setCompletedDays(progressData);
      }

      setPageLoading(false);
    };

    fetchData();
  }, [slug, user, navigate]);

  const handleDayClick = (dayNumber: number) => {
    const isCompleted = completedDays.some(d => d.day_number === dayNumber);
    if (isCompleted) {
      const completed = completedDays.find(d => d.day_number === dayNumber);
      setReflection(completed?.reflection || "");
    } else {
      setReflection("");
    }
    setSelectedDay(dayNumber);
    setShowModal(true);
  };

  const handleComplete = async () => {
    if (!user || selectedDay === null || !template) return;
    setIsLoading(true);

    const isAlreadyCompleted = completedDays.some(d => d.day_number === selectedDay);

    if (isAlreadyCompleted) {
      const { error } = await supabase
        .from("challenge_progress")
        .update({ reflection })
        .eq("user_id", user.id)
        .eq("template_id", template.id)
        .eq("day_number", selectedDay);

      if (error) {
        toast.error("Failed to update reflection");
      } else {
        toast.success("Reflection updated!");
        fetchProgress();
      }
    } else {
      const { error } = await supabase
        .from("challenge_progress")
        .insert({
          user_id: user.id,
          template_id: template.id,
          day_number: selectedDay,
          reflection: reflection || null,
        });

      if (error) {
        toast.error("Failed to mark as complete");
      } else {
        toast.success("Day completed! Keep going! 💖");
        fetchProgress();
      }
    }

    setIsLoading(false);
    setShowModal(false);
  };

  const fetchProgress = async () => {
    if (!user || !template) return;
    
    const { data } = await supabase
      .from("challenge_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("template_id", template.id);

    if (data) setCompletedDays(data);
  };

  if (pageLoading || !template) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const Icon = iconMap[template.icon_name] || Heart;
  const iconColor = iconColorMap[template.color] || iconColorMap.rose;
  const bgGradient = bgColorMap[template.color] || bgColorMap.rose;
  const progressPercentage = (completedDays.length / 30) * 100;
  const currentDay = days.find(d => d.day_number === selectedDay);

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 p-6 pb-24">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/challenges")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            All Challenges
          </Button>

          {/* Header */}
          <div className="text-center space-y-4">
            <div className={cn(
              "inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br mb-2",
              bgGradient
            )}>
              <Icon className={cn("w-8 h-8", iconColor)} />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              {template.name}
            </h1>
            <p className="text-muted-foreground">
              {template.description}
            </p>
          </div>

          {/* Progress Card */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground">Your Progress</span>
                </div>
                <span className="text-2xl font-bold text-primary">
                  {completedDays.length}/30
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <p className="text-sm text-muted-foreground text-center">
                {completedDays.length === 30 
                  ? "🎉 Congratulations! You've completed the challenge!" 
                  : `${30 - completedDays.length} days remaining`}
              </p>
            </CardContent>
          </Card>

          {/* Calendar Grid */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">Daily Activities</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {days.map((day) => {
                const isCompleted = completedDays.some(d => d.day_number === day.day_number);
                const completedData = completedDays.find(d => d.day_number === day.day_number);
                return (
                  <button
                    key={day.id}
                    onClick={() => handleDayClick(day.day_number)}
                    className={cn(
                      "relative p-4 rounded-xl flex items-start gap-4 text-left",
                      "transition-all duration-300 hover:scale-[1.02] hover:shadow-lg",
                      isCompleted 
                        ? "bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/30 shadow-md" 
                        : "bg-card/50 border border-border/50 hover:border-primary/50"
                    )}
                  >
                    {/* Day number badge */}
                    <div className={cn(
                      "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                      isCompleted 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-muted-foreground"
                    )}>
                      {isCompleted ? <Check className="w-5 h-5" /> : day.day_number}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-muted-foreground">Day {day.day_number}</span>
                          {isCompleted && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                              Completed
                            </span>
                          )}
                        </div>
                      </div>
                      <h3 className={cn("font-semibold text-sm", isCompleted ? "text-primary" : "text-foreground")}>
                        {day.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {day.description}
                      </p>
                      {completedData?.reflection && (
                        <p className="text-xs text-primary/80 mt-2 italic line-clamp-1">
                          "{completedData.reflection}"
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-primary to-primary/80" />
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-card border border-border/50" />
              <span>Pending</span>
            </div>
          </div>
        </div>

        {/* Day Detail Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="bg-card border-border max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-foreground">
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br", bgGradient)}>
                  <Icon className={cn("w-5 h-5", iconColor)} />
                </div>
                Day {selectedDay}: {currentDay?.title}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground pt-2">
                {currentDay?.description}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Your Reflection (optional)
                </label>
                <Textarea
                  placeholder="How did this activity make you feel? What did you learn?"
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  className="min-h-[100px] bg-background/50 border-border/50"
                />
              </div>
              
              <Button
                onClick={handleComplete}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:opacity-90"
              >
                {isLoading ? "Saving..." : 
                  completedDays.some(d => d.day_number === selectedDay) 
                    ? "Update Reflection" 
                    : "Mark as Complete"
                }
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default ChallengeDetail;
