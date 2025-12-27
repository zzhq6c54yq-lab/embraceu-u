import { useState, useEffect } from 'react';
import { Copy, Check, Users, Flame, UserPlus, Unlink, Lock, Crown } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { usePremium } from '@/hooks/usePremium';
import UpgradeModal from '@/components/UpgradeModal';
import ReferralRewardsSection from '@/components/ReferralRewardsSection';
interface SharedStreak {
  id: string;
  partner_1: string;
  partner_2: string;
  streak_count: number;
  last_sync: string;
  is_active: boolean;
}

interface PartnerProfile {
  nickname: string;
  referral_code: string;
}

const Duo = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isPremium } = usePremium();
  const [referralCode, setReferralCode] = useState('');
  const [friendCode, setFriendCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [sharedStreak, setSharedStreak] = useState<SharedStreak | null>(null);
  const [partnerName, setPartnerName] = useState<string>('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      // Get user's referral code
      const { data: profile } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile?.referral_code) {
        setReferralCode(profile.referral_code);
      }

      // Get shared streak if exists
      const { data: streaks } = await supabase
        .from('shared_streaks')
        .select('*')
        .or(`partner_1.eq.${user.id},partner_2.eq.${user.id}`)
        .eq('is_active', true)
        .maybeSingle();

      if (streaks) {
        setSharedStreak(streaks);
        
        // Get partner's name
        const partnerId = streaks.partner_1 === user.id ? streaks.partner_2 : streaks.partner_1;
        const { data: partnerProfile } = await supabase
          .from('profiles')
          .select('nickname')
          .eq('user_id', partnerId)
          .maybeSingle();
        
        if (partnerProfile) {
          setPartnerName(partnerProfile.nickname);
        }
      }

      setIsLoading(false);
    };

    fetchData();
  }, [user]);

  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      toast({ title: 'Copied!', description: 'Referral code copied to clipboard' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Error', description: 'Failed to copy code', variant: 'destructive' });
    }
  };

  const joinFriend = async () => {
    if (!user || !friendCode.trim()) return;
    if (friendCode.trim().toLowerCase() === referralCode.toLowerCase()) {
      toast({ title: 'Error', description: "You can't use your own code!", variant: 'destructive' });
      return;
    }

    setIsJoining(true);

    try {
      // Find partner by referral code
      const { data: partner, error: partnerError } = await supabase
        .from('profiles')
        .select('user_id, nickname')
        .eq('referral_code', friendCode.trim().toLowerCase())
        .maybeSingle();

      if (partnerError || !partner) {
        toast({ title: 'Not Found', description: 'No user found with that code', variant: 'destructive' });
        setIsJoining(false);
        return;
      }

      // Check if duo already exists
      const { data: existingDuo } = await supabase
        .from('shared_streaks')
        .select('id')
        .or(`and(partner_1.eq.${user.id},partner_2.eq.${partner.user_id}),and(partner_1.eq.${partner.user_id},partner_2.eq.${user.id})`)
        .maybeSingle();

      if (existingDuo) {
        toast({ title: 'Already Connected', description: 'You already have a duo with this person', variant: 'destructive' });
        setIsJoining(false);
        return;
      }

      // Create shared streak
      const { error: insertError } = await supabase
        .from('shared_streaks')
        .insert({
          partner_1: user.id,
          partner_2: partner.user_id,
          streak_count: 1,
        });

      if (insertError) {
        toast({ title: 'Error', description: 'Failed to create duo', variant: 'destructive' });
        setIsJoining(false);
        return;
      }

      // Update referred_by if not already set
      await supabase
        .from('profiles')
        .update({ referred_by: partner.user_id })
        .eq('user_id', user.id)
        .is('referred_by', null);

      toast({ title: 'Success!', description: `You're now connected with ${partner.nickname}!` });
      setPartnerName(partner.nickname);
      
      // Refetch data
      const { data: newStreak } = await supabase
        .from('shared_streaks')
        .select('*')
        .or(`partner_1.eq.${user.id},partner_2.eq.${user.id}`)
        .eq('is_active', true)
        .maybeSingle();
      
      setSharedStreak(newStreak);
      setFriendCode('');
    } catch (error) {
      console.error('Error joining friend:', error);
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' });
    }

    setIsJoining(false);
  };

  const leaveDuo = async () => {
    if (!sharedStreak) return;

    try {
      await supabase
        .from('shared_streaks')
        .update({ is_active: false })
        .eq('id', sharedStreak.id);

      setSharedStreak(null);
      setPartnerName('');
      toast({ title: 'Duo Ended', description: 'You have left the duo' });
    } catch {
      toast({ title: 'Error', description: 'Failed to leave duo', variant: 'destructive' });
    }
  };

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
      {/* Premium Lock Overlay */}
      {!isPremium && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
          <div className="text-center p-8 max-w-sm animate-fade-in">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 rounded-full bg-accent/30 blur-2xl animate-glow-pulse" />
              <div className="relative w-20 h-20 rounded-full bg-card border-2 border-accent/40 flex items-center justify-center">
                <Lock className="w-10 h-10 text-accent" />
              </div>
            </div>
            <h2 className="font-serif italic text-2xl text-foreground mb-3">
              Pro Feature
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Growth Chain is a premium feature that helps you stay accountable with a friend. Unlock it with Pro.
            </p>
            <Button 
              variant="premium" 
              onClick={() => setShowUpgradeModal(true)}
              className="w-full"
            >
              <Crown className="w-4 h-4 mr-2" />
              Unlock with Pro
            </Button>
          </div>
        </div>
      )}

      <UpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />

      {/* Header */}
      <div className="mt-2 mb-8 text-center">
        <h1 className="font-serif italic text-3xl text-foreground mb-2">
          Growth Chain
        </h1>
        <p className="text-muted-foreground">
          Partner with a friend for accountability
        </p>
      </div>

      {/* Shared Streak Display */}
      {sharedStreak ? (
        <section className="mb-8">
          <div className="relative card-embrace-premium text-center py-10">
            {/* Glowing aura effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent/20 via-accent/40 to-accent/20 blur-2xl animate-pulse opacity-60" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-4 mb-6">
                <Users className="w-8 h-8 text-accent" />
                <span className="text-xl font-serif italic text-foreground">
                  You & {partnerName}
                </span>
              </div>
              
              {/* Large streak counter */}
              <div className="relative inline-block">
                <div className="absolute inset-0 rounded-full bg-accent/30 blur-3xl animate-pro-glow" />
                <div className="relative flex items-center justify-center w-40 h-40 rounded-full border-4 border-accent/60 bg-gradient-to-br from-accent/20 to-accent/5">
                  <div className="text-center">
                    <Flame className="w-10 h-10 mx-auto text-accent mb-1" />
                    <span className="text-5xl font-bold text-foreground">
                      {sharedStreak.streak_count}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      days together
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mt-6">
                Last sync: {new Date(sharedStreak.last_sync).toLocaleDateString()}
              </p>

              <Button
                variant="ghost"
                size="sm"
                className="mt-4 text-destructive hover:text-destructive"
                onClick={leaveDuo}
              >
                <Unlink className="w-4 h-4 mr-2" />
                End Duo
              </Button>
            </div>
          </div>
        </section>
      ) : (
        /* Empty State - Start First Duo */
        <section className="mb-8">
          <div className="card-embrace text-center py-12">
            <Users className="w-16 h-16 mx-auto text-muted-foreground/40 mb-4" />
            <h2 className="font-serif italic text-xl text-foreground mb-2">
              No Duo Partner Yet
            </h2>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Connect with a friend to start building a shared streak and keep each other accountable.
            </p>
          </div>
        </section>
      )}

      {/* Referral Code Section */}
      <section className="mb-8">
        <h2 className="text-label mb-4">YOUR REFERRAL CODE</h2>
        <div className="card-embrace">
          <p className="text-sm text-muted-foreground mb-3">
            Share this code with a friend to start a Growth Chain
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-secondary/50 rounded-xl px-4 py-3 font-mono text-lg text-center tracking-widest uppercase">
              {referralCode}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={copyReferralCode}
              className="shrink-0"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* Join Friend Section */}
      {!sharedStreak && (
        <section className="pb-20">
          <h2 className="text-label mb-4">JOIN A FRIEND</h2>
          <div className="card-embrace">
            <p className="text-sm text-muted-foreground mb-3">
              Enter your friend's referral code to connect
            </p>
            <div className="flex items-center gap-3">
              <Input
                value={friendCode}
                onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
                placeholder="Enter code..."
                className="flex-1 font-mono tracking-widest uppercase"
                maxLength={8}
              />
              <Button
                onClick={joinFriend}
                disabled={!friendCode.trim() || isJoining}
                className="shrink-0"
              >
                {isJoining ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Join
                  </>
                )}
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Referral Rewards Section */}
      <section className="mb-8">
        <ReferralRewardsSection />
      </section>

      {/* Info Section */}
      <section className="pb-20">
        <div className="insight-card-accent">
          <p className="font-serif italic text-center text-success-foreground">
            "Alone we can do so little; together we can do so much."
          </p>
          <p className="text-xs text-center text-success-foreground/60 mt-2">
            — Helen Keller
          </p>
        </div>
      </section>
    </AppLayout>
  );
};

export default Duo;
