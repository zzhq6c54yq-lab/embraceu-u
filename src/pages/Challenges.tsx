import { useState, useEffect } from "react";
import { Trophy, Calendar, Flame } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { ChallengeCard } from "@/components/ChallengeCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Challenge {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  goal_type: string;
  goal_target: number;
}

const Challenges = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChallenges = async () => {
      const { data } = await supabase
        .from("challenges")
        .select("*")
        .eq("is_active", true)
        .order("start_date", { ascending: true });

      if (data) setChallenges(data);
      setIsLoading(false);
    };

    fetchChallenges();
  }, []);

  const now = new Date();
  const activeChallenges = challenges.filter((c) => {
    const start = new Date(c.start_date);
    const end = new Date(c.end_date);
    return now >= start && now <= end;
  });

  const upcomingChallenges = challenges.filter((c) => {
    const start = new Date(c.start_date);
    return now < start;
  });

  const pastChallenges = challenges.filter((c) => {
    const end = new Date(c.end_date);
    return now > end;
  });

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
      <div className="mt-2 mb-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <Trophy className="w-8 h-8 text-primary" />
        </div>
        <h1 className="font-serif italic text-3xl text-foreground mb-2">
          Community Challenges
        </h1>
        <p className="text-muted-foreground">
          Join others on your wellness journey
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-center">
          <Flame className="w-6 h-6 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold text-foreground">
            {activeChallenges.length}
          </p>
          <p className="text-xs text-muted-foreground">Active Challenges</p>
        </div>
        <div className="p-4 rounded-xl bg-muted/30 border border-border text-center">
          <Calendar className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
          <p className="text-2xl font-bold text-foreground">
            {upcomingChallenges.length}
          </p>
          <p className="text-xs text-muted-foreground">Coming Soon</p>
        </div>
      </div>

      {/* Challenge Tabs */}
      <Tabs defaultValue="active" className="pb-20">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="active" className="flex-1">
            Active
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex-1">
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="past" className="flex-1">
            Past
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeChallenges.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No active challenges right now</p>
              <p className="text-sm mt-1">Check back soon!</p>
            </div>
          ) : (
            activeChallenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingChallenges.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No upcoming challenges</p>
            </div>
          ) : (
            upcomingChallenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastChallenges.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No completed challenges yet</p>
            </div>
          ) : (
            pastChallenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Challenges;
