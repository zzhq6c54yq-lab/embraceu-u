import { useState, useEffect } from "react";
import { Users, Trophy, Calendar, ArrowRight, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Challenge {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  goal_type: string;
  goal_target: number;
}

interface ChallengeCardProps {
  challenge: Challenge;
  onJoin?: () => void;
}

export const ChallengeCard = ({ challenge, onJoin }: ChallengeCardProps) => {
  const { user } = useAuth();
  const [participation, setParticipation] = useState<{
    progress: number;
    joined: boolean;
    completed: boolean;
  } | null>(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [isJoining, setIsJoining] = useState(false);

  const startDate = new Date(challenge.start_date);
  const endDate = new Date(challenge.end_date);
  const now = new Date();
  const isActive = now >= startDate && now <= endDate;
  const isUpcoming = now < startDate;
  const isEnded = now > endDate;
  const daysLeft = Math.ceil(
    (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  useEffect(() => {
    const fetchData = async () => {
      // Get participant count
      const { count } = await supabase
        .from("challenge_participants")
        .select("*", { count: "exact", head: true })
        .eq("challenge_id", challenge.id);

      setParticipantCount(count || 0);

      // Check if user is participating
      if (user) {
        const { data } = await supabase
          .from("challenge_participants")
          .select("progress, completed_at")
          .eq("challenge_id", challenge.id)
          .eq("user_id", user.id)
          .maybeSingle();

        if (data) {
          setParticipation({
            progress: data.progress,
            joined: true,
            completed: !!data.completed_at,
          });
        }
      }
    };

    fetchData();
  }, [challenge.id, user]);

  const handleJoin = async () => {
    if (!user) {
      toast.error("Please sign in to join challenges");
      return;
    }

    setIsJoining(true);
    try {
      const { error } = await supabase.from("challenge_participants").insert({
        user_id: user.id,
        challenge_id: challenge.id,
        progress: 0,
      });

      if (error) throw error;

      setParticipation({ progress: 0, joined: true, completed: false });
      setParticipantCount((prev) => prev + 1);
      toast.success("You joined the challenge!");
      onJoin?.();
    } catch (error) {
      console.error("Error joining challenge:", error);
      toast.error("Couldn't join challenge");
    } finally {
      setIsJoining(false);
    }
  };

  const progressPercentage = participation
    ? Math.min((participation.progress / challenge.goal_target) * 100, 100)
    : 0;

  return (
    <div
      className={cn(
        "p-4 rounded-xl border transition-all",
        participation?.completed
          ? "bg-primary/10 border-primary/30"
          : isActive
          ? "bg-card border-border"
          : "bg-muted/30 border-border/50"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-medium text-foreground flex items-center gap-2">
            {challenge.name}
            {participation?.completed && (
              <Check className="w-4 h-4 text-primary" />
            )}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {challenge.description}
          </p>
        </div>
        <Trophy
          className={cn(
            "w-5 h-5",
            participation?.completed ? "text-primary" : "text-muted-foreground"
          )}
        />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{participantCount} joined</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>
            {isUpcoming
              ? `Starts ${startDate.toLocaleDateString()}`
              : isEnded
              ? "Ended"
              : `${daysLeft} days left`}
          </span>
        </div>
      </div>

      {/* Progress or Join */}
      {participation?.joined ? (
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">
              {participation.progress} / {challenge.goal_target}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      ) : isActive || isUpcoming ? (
        <Button
          onClick={handleJoin}
          disabled={isJoining}
          className="w-full gap-2"
          variant={isUpcoming ? "outline" : "default"}
        >
          {isUpcoming ? "Join Early" : "Join Challenge"}
          <ArrowRight className="w-4 h-4" />
        </Button>
      ) : null}
    </div>
  );
};
