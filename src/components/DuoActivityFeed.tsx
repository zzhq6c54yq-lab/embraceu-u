import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Heart, Wind, Sparkles, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  type: 'mood' | 'ritual' | 'gratitude';
  description: string;
  timestamp: string;
}

interface DuoActivityFeedProps {
  partnerId: string;
}

const DuoActivityFeed = ({ partnerId }: DuoActivityFeedProps) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!partnerId) return;

    const fetchActivities = async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Fetch partner's recent activities
      const [moodsRes, ritualsRes, gratitudesRes] = await Promise.all([
        supabase
          .from('mood_entries')
          .select('id, mood, created_at')
          .eq('user_id', partnerId)
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('rituals_completed')
          .select('id, ritual_type, created_at')
          .eq('user_id', partnerId)
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('gratitude_entries')
          .select('id, created_at')
          .eq('user_id', partnerId)
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      const allActivities: Activity[] = [];

      moodsRes.data?.forEach((m) => {
        allActivities.push({
          id: m.id,
          type: 'mood',
          description: `Logged mood: ${m.mood}`,
          timestamp: m.created_at,
        });
      });

      ritualsRes.data?.forEach((r) => {
        allActivities.push({
          id: r.id,
          type: 'ritual',
          description: `Completed ${r.ritual_type} ritual`,
          timestamp: r.created_at,
        });
      });

      gratitudesRes.data?.forEach((g) => {
        allActivities.push({
          id: g.id,
          type: 'gratitude',
          description: 'Added a gratitude entry',
          timestamp: g.created_at,
        });
      });

      // Sort by timestamp descending
      allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setActivities(allActivities.slice(0, 10));
      setIsLoading(false);
    };

    fetchActivities();

    // Set up realtime subscription for partner activities
    const channel = supabase
      .channel('partner-activities')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mood_entries', filter: `user_id=eq.${partnerId}` },
        (payload) => {
          const newActivity: Activity = {
            id: payload.new.id,
            type: 'mood',
            description: `Logged mood: ${payload.new.mood}`,
            timestamp: payload.new.created_at,
          };
          setActivities((prev) => [newActivity, ...prev].slice(0, 10));
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'rituals_completed', filter: `user_id=eq.${partnerId}` },
        (payload) => {
          const newActivity: Activity = {
            id: payload.new.id,
            type: 'ritual',
            description: `Completed ${payload.new.ritual_type} ritual`,
            timestamp: payload.new.created_at,
          };
          setActivities((prev) => [newActivity, ...prev].slice(0, 10));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [partnerId]);

  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'mood':
        return <Heart className="w-4 h-4" />;
      case 'ritual':
        return <Wind className="w-4 h-4" />;
      case 'gratitude':
        return <Sparkles className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="card-embrace p-6 text-center">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="card-embrace p-6 text-center">
        <Clock className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
        <p className="text-sm text-muted-foreground">No recent activity from your partner</p>
      </div>
    );
  }

  return (
    <div className="card-embrace divide-y divide-border">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center gap-3 p-4">
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center
            ${activity.type === 'mood' ? 'bg-primary/20 text-primary' : ''}
            ${activity.type === 'ritual' ? 'bg-accent/20 text-accent' : ''}
            ${activity.type === 'gratitude' ? 'bg-success/20 text-success-foreground' : ''}
          `}>
            {getIcon(activity.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">{activity.description}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DuoActivityFeed;