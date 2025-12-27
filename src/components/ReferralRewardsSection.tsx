import { Gift, Check, Lock, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useReferralRewards, REWARD_MILESTONES } from '@/hooks/useReferralRewards';
import { cn } from '@/lib/utils';

const ReferralRewardsSection = () => {
  const { 
    referralCount, 
    rewards, 
    isLoading, 
    claimReward, 
    getNextMilestone, 
    getProgressToNext 
  } = useReferralRewards();

  const nextMilestone = getNextMilestone();
  const progress = getProgressToNext();

  if (isLoading) {
    return (
      <div className="bg-card/50 rounded-2xl p-6 border border-border/40">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-20 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const isRewardEarned = (milestone: typeof REWARD_MILESTONES[0]) => {
    return rewards.some(r => r.reward_type === milestone.type);
  };

  const isRewardClaimed = (milestone: typeof REWARD_MILESTONES[0]) => {
    return rewards.some(r => r.reward_type === milestone.type && r.claimed);
  };

  const getRewardById = (type: string) => {
    return rewards.find(r => r.reward_type === type);
  };

  return (
    <div className="bg-card/50 rounded-2xl p-6 border border-border/40">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
          <Gift className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="font-serif italic text-lg text-foreground">Referral Rewards</h3>
          <p className="text-muted-foreground text-sm">Invite friends, earn rewards</p>
        </div>
      </div>

      {/* Progress Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Your Referrals</span>
          <span className="text-sm font-medium text-foreground">
            {referralCount} {nextMilestone ? `/ ${nextMilestone.count}` : '🎉'}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        {nextMilestone && (
          <p className="text-xs text-muted-foreground mt-2">
            {nextMilestone.count - referralCount} more to unlock: {nextMilestone.title}
          </p>
        )}
      </div>

      {/* Rewards List */}
      <div className="space-y-3">
        {REWARD_MILESTONES.map((milestone) => {
          const earned = isRewardEarned(milestone);
          const claimed = isRewardClaimed(milestone);
          const reward = getRewardById(milestone.type);
          const isNext = nextMilestone?.type === milestone.type;

          return (
            <div
              key={milestone.type}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border transition-all",
                earned 
                  ? "bg-accent/10 border-accent/30" 
                  : isNext 
                    ? "bg-muted/50 border-border/60" 
                    : "bg-muted/20 border-border/20 opacity-60"
              )}
            >
              {/* Icon */}
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-lg",
                earned ? "bg-accent/20" : "bg-muted"
              )}>
                {claimed ? (
                  <Check className="w-5 h-5 text-accent" />
                ) : earned ? (
                  <Sparkles className="w-5 h-5 text-accent" />
                ) : (
                  <span className="opacity-50">{milestone.icon}</span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "font-medium text-sm",
                    earned ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {milestone.title}
                  </span>
                  {!earned && (
                    <span className="text-xs text-muted-foreground">
                      ({milestone.count} referrals)
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {milestone.description}
                </p>
              </div>

              {/* Action */}
              <div className="flex-shrink-0">
                {claimed ? (
                  <span className="text-xs text-accent font-medium">Claimed</span>
                ) : earned && reward ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => claimReward(reward.id)}
                    className="text-xs h-8"
                  >
                    Claim
                  </Button>
                ) : (
                  <Lock className="w-4 h-4 text-muted-foreground/50" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Completed all milestones message */}
      {!nextMilestone && referralCount >= 10 && (
        <div className="mt-4 p-4 rounded-xl bg-accent/10 border border-accent/30 text-center">
          <p className="text-sm text-accent font-medium">
            🎉 You've unlocked all referral rewards!
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Thank you for spreading the word about ThriveMT
          </p>
        </div>
      )}
    </div>
  );
};

export default ReferralRewardsSection;
