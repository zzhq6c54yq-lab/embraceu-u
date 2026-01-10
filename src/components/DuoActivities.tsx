import { useState, useEffect } from 'react';
import { 
  Heart, Wind, Target, MessageCircle, Sparkles, 
  HandHeart, CheckCircle2, Clock, Users, Gift
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface DuoActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  prompt?: string;
  options?: string[];
}

interface ActiveActivity {
  id: string;
  activity_type: string;
  partner_1_completed: boolean;
  partner_2_completed: boolean;
  partner_1_response: string | null;
  partner_2_response: string | null;
  both_revealed: boolean;
}

interface DuoActivitiesProps {
  sharedStreakId: string;
  partnerId: string;
  partnerName: string;
  isPartner1: boolean;
}

const activityDefinitions: DuoActivity[] = [
  {
    id: 'gratitude_exchange',
    type: 'gratitude_exchange',
    title: 'Gratitude Exchange',
    description: 'Share something you appreciate about your partner',
    icon: <Heart className="w-5 h-5" />,
    prompt: 'What do you appreciate about your partner today?',
  },
  {
    id: 'daily_checkin',
    type: 'daily_checkin',
    title: 'Daily Check-In',
    description: "Share how you're feeling right now",
    icon: <MessageCircle className="w-5 h-5" />,
    options: ['😊 Great', '😌 Calm', '😐 Okay', '😔 Down', '😤 Stressed', '🥱 Tired'],
  },
  {
    id: 'kindness_pledge',
    type: 'kindness_pledge',
    title: 'Kindness Challenge',
    description: 'Commit to one act of kindness today',
    icon: <HandHeart className="w-5 h-5" />,
    options: [
      'Send an encouraging text',
      'Give a genuine compliment',
      'Help with a task',
      'Listen without judgment',
      'Share something inspiring',
      'Express gratitude'
    ],
  },
  {
    id: 'reflection_prompt',
    type: 'reflection_prompt',
    title: 'Reflection Prompt',
    description: 'Answer a thoughtful question together',
    icon: <Sparkles className="w-5 h-5" />,
    prompt: 'What small moment brought you joy recently?',
  },
  {
    id: 'growth_goal',
    type: 'growth_goal',
    title: 'Micro Goal',
    description: 'Set a small intention for today',
    icon: <Target className="w-5 h-5" />,
    prompt: "What's one small thing you want to accomplish today?",
  },
  {
    id: 'encouragement',
    type: 'encouragement',
    title: 'Send Encouragement',
    description: 'Write a short note to lift your partner up',
    icon: <Gift className="w-5 h-5" />,
    prompt: 'Write an encouraging message for your partner',
  },
];

const DuoActivities = ({ sharedStreakId, partnerId, partnerName, isPartner1 }: DuoActivitiesProps) => {
  const { user } = useAuth();
  const [activeActivities, setActiveActivities] = useState<ActiveActivity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<DuoActivity | null>(null);
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!sharedStreakId) return;

    const fetchActivities = async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data } = await supabase
        .from('duo_activities')
        .select('*')
        .eq('shared_streak_id', sharedStreakId)
        .eq('activity_date', today);

      if (data) {
        setActiveActivities(data as ActiveActivity[]);
      }
      setIsLoading(false);
    };

    fetchActivities();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('duo-activities-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'duo_activities',
          filter: `shared_streak_id=eq.${sharedStreakId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setActiveActivities((prev) => [...prev, payload.new as ActiveActivity]);
          } else if (payload.eventType === 'UPDATE') {
            setActiveActivities((prev) =>
              prev.map((a) => (a.id === payload.new.id ? (payload.new as ActiveActivity) : a))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sharedStreakId]);

  const getActivityStatus = (activityType: string) => {
    const activity = activeActivities.find((a) => a.activity_type === activityType);
    if (!activity) return { status: 'available', activity: null };

    const myCompleted = isPartner1 ? activity.partner_1_completed : activity.partner_2_completed;
    const partnerCompleted = isPartner1 ? activity.partner_2_completed : activity.partner_1_completed;

    if (myCompleted && partnerCompleted) return { status: 'complete', activity };
    if (myCompleted && !partnerCompleted) return { status: 'waiting', activity };
    if (!myCompleted && partnerCompleted) return { status: 'partner_waiting', activity };
    return { status: 'available', activity };
  };

  const handleStartActivity = (activity: DuoActivity) => {
    setSelectedActivity(activity);
    setResponse('');
  };

  const handleSubmitActivity = async () => {
    if (!user || !selectedActivity || !response.trim()) return;
    
    setIsSubmitting(true);

    try {
      const { status, activity: existingActivity } = getActivityStatus(selectedActivity.type);
      const today = new Date().toISOString().split('T')[0];

      if (existingActivity) {
        // Update existing activity
        const updateData = isPartner1
          ? { partner_1_completed: true, partner_1_response: response.trim() }
          : { partner_2_completed: true, partner_2_response: response.trim() };

        // Check if both will be complete
        const partnerCompleted = isPartner1
          ? existingActivity.partner_2_completed
          : existingActivity.partner_1_completed;

        if (partnerCompleted) {
          Object.assign(updateData, { both_revealed: true });
        }

        await supabase
          .from('duo_activities')
          .update(updateData)
          .eq('id', existingActivity.id);
      } else {
        // Create new activity
        const insertData = {
          shared_streak_id: sharedStreakId,
          activity_type: selectedActivity.type,
          activity_date: today,
          partner_1_completed: isPartner1,
          partner_1_response: isPartner1 ? response.trim() : null,
          partner_2_completed: !isPartner1,
          partner_2_response: !isPartner1 ? response.trim() : null,
        };

        await supabase.from('duo_activities').insert(insertData);
      }

      toast.success('Activity completed!', {
        description: status === 'partner_waiting' 
          ? `See what ${partnerName} shared!` 
          : `Waiting for ${partnerName} to respond`,
      });

      setSelectedActivity(null);
      setResponse('');
    } catch (error) {
      console.error('Error submitting activity:', error);
      toast.error('Failed to submit activity');
    }

    setIsSubmitting(false);
  };

  const handleSelectOption = (option: string) => {
    setResponse(option);
  };

  const getPartnerResponse = (activity: ActiveActivity) => {
    return isPartner1 ? activity.partner_2_response : activity.partner_1_response;
  };

  if (isLoading) {
    return (
      <div className="card-embrace p-6 text-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  // Show activity input modal
  if (selectedActivity) {
    const { status } = getActivityStatus(selectedActivity.type);
    const hasOptions = selectedActivity.options && selectedActivity.options.length > 0;

    return (
      <div className="card-embrace">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            {selectedActivity.icon}
          </div>
          <div>
            <h3 className="font-serif italic text-lg text-foreground">{selectedActivity.title}</h3>
            <p className="text-xs text-muted-foreground">{selectedActivity.description}</p>
          </div>
        </div>

        {selectedActivity.prompt && (
          <p className="text-sm text-foreground mb-4 font-medium">{selectedActivity.prompt}</p>
        )}

        {hasOptions ? (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {selectedActivity.options?.map((option) => (
              <button
                key={option}
                onClick={() => handleSelectOption(option)}
                className={cn(
                  'p-3 rounded-xl text-sm text-left transition-all border',
                  response === option
                    ? 'bg-primary/20 border-primary text-foreground'
                    : 'bg-secondary/50 border-border text-muted-foreground hover:border-primary/50'
                )}
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          <Textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Write your response..."
            className="min-h-[100px] mb-4"
          />
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setSelectedActivity(null)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitActivity}
            disabled={!response.trim() || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              'Submit'
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Daily Activities Grid */}
      <div className="grid grid-cols-2 gap-3">
        {activityDefinitions.map((activity) => {
          const { status, activity: activeActivity } = getActivityStatus(activity.type);

          return (
            <button
              key={activity.id}
              onClick={() => {
                if (status === 'available' || status === 'partner_waiting') {
                  handleStartActivity(activity);
                }
              }}
              disabled={status === 'complete' || status === 'waiting'}
              className={cn(
                'relative p-4 rounded-xl text-left transition-all border',
                status === 'complete' && 'bg-success/10 border-success/30',
                status === 'waiting' && 'bg-accent/10 border-accent/30',
                status === 'partner_waiting' && 'bg-primary/10 border-primary/50 ring-2 ring-primary/30',
                status === 'available' && 'bg-card border-border hover:border-primary/50',
                (status === 'complete' || status === 'waiting') && 'opacity-75'
              )}
            >
              {/* Status badge */}
              {status !== 'available' && (
                <div className={cn(
                  'absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center',
                  status === 'complete' && 'bg-success text-success-foreground',
                  status === 'waiting' && 'bg-accent text-accent-foreground',
                  status === 'partner_waiting' && 'bg-primary text-primary-foreground animate-pulse'
                )}>
                  {status === 'complete' && <CheckCircle2 className="w-4 h-4" />}
                  {status === 'waiting' && <Clock className="w-4 h-4" />}
                  {status === 'partner_waiting' && <Users className="w-4 h-4" />}
                </div>
              )}

              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center mb-2',
                status === 'complete' && 'bg-success/20 text-success-foreground',
                status === 'waiting' && 'bg-accent/20 text-accent',
                status === 'partner_waiting' && 'bg-primary/20 text-primary',
                status === 'available' && 'bg-primary/10 text-primary'
              )}>
                {activity.icon}
              </div>
              
              <h4 className="font-medium text-sm text-foreground mb-1">{activity.title}</h4>
              <p className="text-xs text-muted-foreground line-clamp-2">{activity.description}</p>

              {status === 'waiting' && (
                <p className="text-xs text-accent mt-2">Waiting for {partnerName}...</p>
              )}
              {status === 'partner_waiting' && (
                <p className="text-xs text-primary mt-2 font-medium">{partnerName} is waiting!</p>
              )}
              {status === 'complete' && activeActivity?.both_revealed && (
                <p className="text-xs text-success-foreground mt-2">Both completed! ✨</p>
              )}
            </button>
          );
        })}
      </div>

      {/* Revealed Activities */}
      {activeActivities.filter((a) => a.both_revealed).length > 0 && (
        <div className="mt-6">
          <h3 className="text-label mb-3">TODAY'S SHARED MOMENTS</h3>
          <div className="space-y-3">
            {activeActivities
              .filter((a) => a.both_revealed)
              .map((activity) => {
                const definition = activityDefinitions.find((d) => d.type === activity.activity_type);
                const partnerResponse = getPartnerResponse(activity);
                const myResponse = isPartner1 ? activity.partner_1_response : activity.partner_2_response;

                return (
                  <div key={activity.id} className="card-embrace bg-success/5 border-success/20">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center text-success-foreground">
                        {definition?.icon}
                      </div>
                      <span className="text-sm font-medium text-foreground">{definition?.title}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-background/50">
                        <p className="text-xs text-muted-foreground mb-1">You</p>
                        <p className="text-sm text-foreground">{myResponse}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-background/50">
                        <p className="text-xs text-muted-foreground mb-1">{partnerName}</p>
                        <p className="text-sm text-foreground">{partnerResponse}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DuoActivities;
