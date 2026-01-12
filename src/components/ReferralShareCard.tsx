import { useState } from "react";
import { Gift, Copy, Share2, ChevronRight, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useReferralRewards, REWARD_MILESTONES } from "@/hooks/useReferralRewards";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const ReferralShareCard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { referralCount, getNextMilestone, getProgressToNext, isLoading } = useReferralRewards();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch referral code on mount
  useState(() => {
    const fetchCode = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('user_id', user.id)
        .single();
      if (data?.referral_code) {
        setReferralCode(data.referral_code);
      }
    };
    fetchCode();
  });

  const nextMilestone = getNextMilestone();
  const progress = getProgressToNext();

  const handleCopy = async () => {
    if (!referralCode) return;
    const shareUrl = `${window.location.origin}/auth?ref=${referralCode}`;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({ title: "Copied!", description: "Referral link copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!referralCode) return;
    const shareUrl = `${window.location.origin}/auth?ref=${referralCode}`;
    const shareText = "Join me on EmbraceU - your daily companion for self-love and personal growth! 🌟";
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join EmbraceU',
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed, fallback to copy
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  if (isLoading || !referralCode) {
    return (
      <Card className="p-4 bg-gradient-to-br from-accent/5 to-accent/15 border-accent/20">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-muted rounded w-1/2" />
          <div className="h-3 bg-muted rounded w-full" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 bg-gradient-to-br from-accent/5 via-accent/10 to-accent/15 border-accent/30 overflow-hidden relative">
      {/* Decorative gradient */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
            <Gift className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">Share & Earn Pro</h3>
            <p className="text-xs text-muted-foreground">Invite friends, unlock rewards</p>
          </div>
        </div>

        {/* Code & Actions */}
        <div className="flex items-center gap-2 mb-4 bg-background/50 rounded-xl p-3 border border-border/50">
          <span className="text-sm font-mono font-semibold text-foreground flex-1 truncate">
            {referralCode.toUpperCase()}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="h-8 w-8 shrink-0"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4 text-muted-foreground" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="h-8 w-8 shrink-0"
          >
            <Share2 className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>

        {/* Progress */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {referralCount} referral{referralCount !== 1 ? 's' : ''}
            </span>
            {nextMilestone && (
              <span className="text-muted-foreground">
                {nextMilestone.count - referralCount} more for {nextMilestone.title}
              </span>
            )}
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* View All Link */}
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors"
        >
          View All Rewards
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </Card>
  );
};

export default ReferralShareCard;
