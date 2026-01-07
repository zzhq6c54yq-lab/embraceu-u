import { useState, useEffect } from "react";
import { Bell, Clock, AlertTriangle, Calendar } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const NotificationSettings = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    morningReminder: true,
    morningReminderTime: "08:00",
    streakWarning: true,
    weeklySummary: true,
  });

  useEffect(() => {
    if (!user) return;

    const fetchPreferences = async () => {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setPreferences({
          morningReminder: data.morning_reminder ?? true,
          morningReminderTime: data.morning_reminder_time ?? "08:00",
          streakWarning: data.streak_warning ?? true,
          weeklySummary: data.weekly_summary ?? true,
        });
      }
      setIsLoading(false);
    };

    fetchPreferences();
  }, [user]);

  const updatePreference = async (key: string, value: boolean | string) => {
    if (!user) return;

    const dbKey = key === "morningReminder" ? "morning_reminder" :
                  key === "morningReminderTime" ? "morning_reminder_time" :
                  key === "streakWarning" ? "streak_warning" : "weekly_summary";

    setPreferences(prev => ({ ...prev, [key]: value }));

    const { error } = await supabase
      .from("notification_preferences")
      .upsert({
        user_id: user.id,
        [dbKey]: value,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    if (error) {
      toast.error("Could not save preference");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Morning Reminder */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center">
            <Bell className="w-4 h-4 text-accent" />
          </div>
          <div>
            <Label className="text-sm font-medium">Morning Reminder</Label>
            <p className="text-xs text-muted-foreground">Daily motivation to start your day</p>
          </div>
        </div>
        <Switch
          checked={preferences.morningReminder}
          onCheckedChange={(checked) => updatePreference("morningReminder", checked)}
        />
      </div>

      {/* Morning Time */}
      {preferences.morningReminder && (
        <div className="flex items-center justify-between pl-12">
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <Label className="text-sm">Reminder Time</Label>
          </div>
          <input
            type="time"
            value={preferences.morningReminderTime}
            onChange={(e) => updatePreference("morningReminderTime", e.target.value)}
            className="bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm"
          />
        </div>
      )}

      {/* Streak Warning */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-warning/20 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-warning" />
          </div>
          <div>
            <Label className="text-sm font-medium">Streak Warning</Label>
            <p className="text-xs text-muted-foreground">Alert when your streak is at risk</p>
          </div>
        </div>
        <Switch
          checked={preferences.streakWarning}
          onCheckedChange={(checked) => updatePreference("streakWarning", checked)}
        />
      </div>

      {/* Weekly Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-success/20 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-success" />
          </div>
          <div>
            <Label className="text-sm font-medium">Weekly Summary</Label>
            <p className="text-xs text-muted-foreground">Recap of your weekly progress</p>
          </div>
        </div>
        <Switch
          checked={preferences.weeklySummary}
          onCheckedChange={(checked) => updatePreference("weeklySummary", checked)}
        />
      </div>
    </div>
  );
};

export default NotificationSettings;
