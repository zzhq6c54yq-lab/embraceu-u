import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { usePremium } from "@/hooks/usePremium";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Heart, Plus, Sparkles, Calendar, Crown, Lock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { format, isToday, startOfDay, differenceInCalendarDays } from "date-fns";
import UpgradeModal from "@/components/UpgradeModal";

interface GratitudeEntry {
  id: string;
  gratitude_text: string;
  created_at: string;
}

const FREE_DAILY_LIMIT = 3;

const Gratitude = () => {
  const { user } = useAuth();
  const { isPremium } = usePremium();
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [newGratitude, setNewGratitude] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user]);

  useEffect(() => {
    calculateStreak();
  }, [entries]);

  const fetchEntries = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("gratitude_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching entries:", error);
      return;
    }

    setEntries(data || []);
  };

  const calculateStreak = () => {
    if (entries.length === 0) {
      setStreak(0);
      return;
    }

    const uniqueDays = new Set(
      entries.map((e) => format(new Date(e.created_at), "yyyy-MM-dd"))
    );
    const sortedDays = Array.from(uniqueDays).sort().reverse();

    let currentStreak = 0;
    const today = startOfDay(new Date());

    for (let i = 0; i < sortedDays.length; i++) {
      const entryDate = startOfDay(new Date(sortedDays[i]));
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);

      if (differenceInCalendarDays(expectedDate, entryDate) === 0) {
        currentStreak++;
      } else {
        break;
      }
    }

    setStreak(currentStreak);
  };

  const getTodayEntries = () => {
    return entries.filter((e) => isToday(new Date(e.created_at)));
  };

  const canAddMore = () => {
    if (isPremium) return true;
    return getTodayEntries().length < FREE_DAILY_LIMIT;
  };

  const handleAddGratitude = async () => {
    if (!user) {
      toast.error("Please sign in to save your gratitude");
      return;
    }

    if (!newGratitude.trim()) {
      toast.error("Please enter what you're grateful for");
      return;
    }

    if (!canAddMore()) {
      setShowUpgradeModal(true);
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.from("gratitude_entries").insert({
      user_id: user.id,
      gratitude_text: newGratitude.trim(),
    });

    if (error) {
      toast.error("Failed to save gratitude");
      console.error(error);
    } else {
      toast.success("Gratitude saved! 🙏");
      setNewGratitude("");
      fetchEntries();
    }

    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("gratitude_entries")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete");
    } else {
      fetchEntries();
    }
  };

  const todayEntries = getTodayEntries();
  const remainingToday = FREE_DAILY_LIMIT - todayEntries.length;

  // Group entries by date for history
  const groupedEntries = entries.reduce((acc, entry) => {
    const date = format(new Date(entry.created_at), "yyyy-MM-dd");
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, GratitudeEntry[]>);

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 p-6 pb-24">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mb-2">
              <Heart className="w-8 h-8 text-primary" fill="currentColor" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Gratitude Journal
            </h1>
            <p className="text-muted-foreground">
              Take a moment to appreciate the good in your life
            </p>
          </div>

          {/* Streak Card - Pro Feature */}
          {isPremium && streak > 0 && (
            <Card className="bg-gradient-to-r from-accent/20 to-primary/20 border-accent/30">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-accent" />
                  <span className="font-medium text-foreground">
                    {streak} day streak!
                  </span>
                </div>
                <Crown className="w-5 h-5 text-accent" />
              </CardContent>
            </Card>
          )}

          {/* Input Section */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  {format(new Date(), "EEEE, MMMM d")}
                </span>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  What are you grateful for today?
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="I'm grateful for..."
                    value={newGratitude}
                    onChange={(e) => setNewGratitude(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddGratitude()}
                    className="bg-background/50 border-border/50"
                  />
                  <Button
                    onClick={handleAddGratitude}
                    disabled={isLoading || !newGratitude.trim()}
                    size="icon"
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {!isPremium && (
                  <p className="text-xs text-muted-foreground">
                    {remainingToday > 0 ? (
                      <>
                        {remainingToday} free entries remaining today
                      </>
                    ) : (
                      <span className="text-primary flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Daily limit reached. Upgrade for unlimited entries!
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* Today's Entries */}
              {todayEntries.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-border/30">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Today's gratitude
                  </h3>
                  {todayEntries.map((entry, index) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 group"
                    >
                      <span className="text-primary font-bold">{index + 1}.</span>
                      <span className="flex-1 text-foreground">
                        {entry.gratitude_text}
                      </span>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* History Section - Pro Feature */}
          {isPremium ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-accent" />
                <h2 className="text-lg font-semibold text-foreground">
                  Your Gratitude History
                </h2>
              </div>

              {Object.entries(groupedEntries)
                .filter(([date]) => !isToday(new Date(date)))
                .slice(0, 7)
                .map(([date, dateEntries]) => (
                  <Card
                    key={date}
                    className="bg-card/30 backdrop-blur-sm border-border/30"
                  >
                    <CardContent className="p-4 space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(date), "EEEE, MMMM d")}
                      </p>
                      {dateEntries.map((entry) => (
                        <p
                          key={entry.id}
                          className="text-foreground pl-3 border-l-2 border-primary/30"
                        >
                          {entry.gratitude_text}
                        </p>
                      ))}
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <Card className="bg-card/30 backdrop-blur-sm border-border/30">
              <CardContent className="p-6 text-center space-y-4">
                <Lock className="w-8 h-8 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="font-semibold text-foreground">
                    Unlock Full History & Streaks
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upgrade to Pro to view your gratitude history, track streaks,
                    and log unlimited entries daily
                  </p>
                </div>
                <Button
                  onClick={() => setShowUpgradeModal(true)}
                  className="bg-gradient-to-r from-accent to-primary"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Pro
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <UpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
    </AppLayout>
  );
};

export default Gratitude;