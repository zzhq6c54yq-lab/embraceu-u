import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface ReferralReward {
  id: string;
  user_id: string;
  reward_type: string;
  reward_title: string;
  reward_description: string | null;
  earned_at: string;
  claimed: boolean;
  claimed_at: string | null;
  referral_count_at_earn: number;
}

export interface RewardMilestone {
  count: number;
  type: string;
  title: string;
  description: string;
  icon: string;
}

export const REWARD_MILESTONES: RewardMilestone[] = [
  { count: 3, type: 'streak_bonus', title: '+3 Day Streak Boost', description: 'Add 3 days to your streak', icon: '🔥' },
  { count: 5, type: 'exclusive_theme', title: 'Aurora Theme', description: 'Unlock the exclusive Aurora cosmic theme', icon: '🎨' },
  { count: 10, type: 'pro_trial', title: '7-Day Pro Trial', description: 'Experience all Pro features free', icon: '👑' },
  { count: 20, type: 'pro_month', title: '1 Month Pro', description: 'Full Pro access for 30 days', icon: '💎' },
  { count: 50, type: 'pro_year', title: '1 Year Pro', description: 'Full Pro access for 365 days', icon: '🏆' },
];

export const useReferralRewards = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referralCount, setReferralCount] = useState(0);
  const [rewards, setRewards] = useState<ReferralReward[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReferralData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      // Fetch referral count from profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('referral_count')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;
      setReferralCount(profile?.referral_count || 0);

      // Fetch earned rewards
      const { data: rewardsData, error: rewardsError } = await supabase
        .from('referral_rewards')
        .select('*')
        .eq('user_id', user.id)
        .order('referral_count_at_earn', { ascending: true });

      if (rewardsError) throw rewardsError;
      setRewards(rewardsData as ReferralReward[] || []);
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchReferralData();
  }, [fetchReferralData]);

  const claimReward = async (rewardId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('referral_rewards')
        .update({ claimed: true, claimed_at: new Date().toISOString() })
        .eq('id', rewardId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setRewards(prev => 
        prev.map(r => r.id === rewardId ? { ...r, claimed: true, claimed_at: new Date().toISOString() } : r)
      );

      toast({
        title: "Reward claimed!",
        description: "Your reward has been applied to your account.",
      });

      return true;
    } catch (error) {
      console.error('Error claiming reward:', error);
      toast({
        title: "Error",
        description: "Failed to claim reward. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const getNextMilestone = () => {
    return REWARD_MILESTONES.find(m => m.count > referralCount) || null;
  };

  const getProgressToNext = () => {
    const next = getNextMilestone();
    if (!next) return 100;
    const prev = REWARD_MILESTONES.filter(m => m.count <= referralCount).pop();
    const prevCount = prev?.count || 0;
    return ((referralCount - prevCount) / (next.count - prevCount)) * 100;
  };

  return {
    referralCount,
    rewards,
    isLoading,
    claimReward,
    getNextMilestone,
    getProgressToNext,
    refetch: fetchReferralData,
  };
};
