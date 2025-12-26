import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Heart, Check, Sparkles, Trophy, Calendar } from "lucide-react";
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

const kindnessActs = [
  { day: 1, title: "Compliment a Stranger", description: "Give a genuine compliment to someone you don't know. Notice how it brightens both your days." },
  { day: 2, title: "Write a Thank You Note", description: "Write a heartfelt thank you note to someone who has impacted your life positively." },
  { day: 3, title: "Pay It Forward", description: "Pay for the coffee or meal of the person behind you in line." },
  { day: 4, title: "Donate Items", description: "Gather clothes, books, or items you no longer need and donate them to charity." },
  { day: 5, title: "Help Someone Carry Groceries", description: "Offer to help someone carry their bags, especially elderly or parents with children." },
  { day: 6, title: "Send an Encouraging Text", description: "Send an uplifting message to a friend who might be going through a tough time." },
  { day: 7, title: "Plant Something", description: "Plant a flower, tree, or herb. Nurture life and beautify your environment." },
  { day: 8, title: "Volunteer Your Time", description: "Spend an hour volunteering at a local shelter, food bank, or community center." },
  { day: 9, title: "Let Someone Go First", description: "In traffic or in line, let someone go ahead of you with a smile." },
  { day: 10, title: "Call a Family Member", description: "Call a relative you haven't spoken to in a while. Just to say hello and that you care." },
  { day: 11, title: "Leave a Generous Tip", description: "Leave a larger than usual tip for your server with a kind note." },
  { day: 12, title: "Share Your Skills", description: "Teach someone something you're good at, whether it's cooking, a language, or a craft." },
  { day: 13, title: "Pick Up Litter", description: "Spend 15 minutes picking up trash in your neighborhood or a local park." },
  { day: 14, title: "Listen Deeply", description: "Give someone your full, undivided attention today. Really listen without planning your response." },
  { day: 15, title: "Bake for Neighbors", description: "Bake cookies or treats and share them with your neighbors." },
  { day: 16, title: "Write a Positive Review", description: "Write a thoughtful positive review for a local business you appreciate." },
  { day: 17, title: "Hold the Door Open", description: "Make it a point to hold doors open for everyone you can today." },
  { day: 18, title: "Forgive Someone", description: "Let go of a grudge you've been holding. Free yourself and the other person." },
  { day: 19, title: "Offer a Ride", description: "Offer to give someone a ride who might need it, or help with their transportation." },
  { day: 20, title: "Share a Meal", description: "Share a meal with someone who is lonely or invite someone new to lunch." },
  { day: 21, title: "Leave Kindness Notes", description: "Leave encouraging sticky notes in public places for strangers to find." },
  { day: 22, title: "Support a Small Business", description: "Shop at a local small business and spread the word about them." },
  { day: 23, title: "Offer Your Seat", description: "On public transport or in waiting areas, offer your seat to someone who needs it more." },
  { day: 24, title: "Send Flowers", description: "Send flowers or a small gift to someone just because, no occasion needed." },
  { day: 25, title: "Practice Patience", description: "When frustrated today, respond with patience and understanding instead of anger." },
  { day: 26, title: "Reconnect with an Old Friend", description: "Reach out to an old friend you've lost touch with. Rekindle the connection." },
  { day: 27, title: "Give Blood or Register", description: "Donate blood if you can, or register as an organ donor to help save lives." },
  { day: 28, title: "Mentor Someone", description: "Offer guidance or mentorship to someone who could benefit from your experience." },
  { day: 29, title: "Express Gratitude", description: "Tell three people today specifically what you appreciate about them." },
  { day: 30, title: "Reflect & Commit", description: "Reflect on your journey and commit to continuing these acts of kindness daily." },
];

interface ChallengeProgress {
  id: string;
  day_number: number;
  completed_at: string;
  reflection: string | null;
}

const Challenge = () => {
  const { user } = useAuth();
  const [completedDays, setCompletedDays] = useState<ChallengeProgress[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [reflection, setReflection] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProgress();
    }
  }, [user]);

  const fetchProgress = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("challenge_progress")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching progress:", error);
      return;
    }

    setCompletedDays(data || []);
  };

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
    if (!user || selectedDay === null) return;
    setIsLoading(true);

    const isAlreadyCompleted = completedDays.some(d => d.day_number === selectedDay);

    if (isAlreadyCompleted) {
      const { error } = await supabase
        .from("challenge_progress")
        .update({ reflection })
        .eq("user_id", user.id)
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
          day_number: selectedDay,
          reflection: reflection || null,
        });

      if (error) {
        toast.error("Failed to mark as complete");
      } else {
        toast.success("Day completed! Keep spreading kindness 💖");
        fetchProgress();
      }
    }

    setIsLoading(false);
    setShowModal(false);
  };

  const progressPercentage = (completedDays.length / 30) * 100;
  const currentAct = selectedDay ? kindnessActs.find(a => a.day === selectedDay) : null;

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 p-6 pb-24">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mb-2">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              30 Days of Kindness
            </h1>
            <p className="text-muted-foreground">
              Transform yourself through daily acts of kindness
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
              <h2 className="text-lg font-semibold text-foreground">Daily Challenges</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {kindnessActs.map((act) => {
                const isCompleted = completedDays.some(d => d.day_number === act.day);
                const completedData = completedDays.find(d => d.day_number === act.day);
                return (
                  <button
                    key={act.day}
                    onClick={() => handleDayClick(act.day)}
                    className={`
                      relative p-4 rounded-xl flex items-start gap-4 text-left
                      transition-all duration-300 hover:scale-[1.02] hover:shadow-lg
                      ${isCompleted 
                        ? "bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/30 shadow-md" 
                        : "bg-card/50 border border-border/50 hover:border-primary/50"
                      }
                    `}
                  >
                    {/* Day number badge */}
                    <div className={`
                      flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                      ${isCompleted 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-muted-foreground"
                      }
                    `}>
                      {isCompleted ? <Check className="w-5 h-5" /> : act.day}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-muted-foreground">Day {act.day}</span>
                        {isCompleted && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                            Completed
                          </span>
                        )}
                      </div>
                      <h3 className={`font-semibold text-sm ${isCompleted ? "text-primary" : "text-foreground"}`}>
                        {act.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {act.description}
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
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                Day {selectedDay}: {currentAct?.title}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground pt-2">
                {currentAct?.description}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Your Reflection (optional)
                </label>
                <Textarea
                  placeholder="How did this act of kindness make you feel? What did you learn?"
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

export default Challenge;
