-- Add referral_count column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_count integer DEFAULT 0;

-- Create referral_rewards table
CREATE TABLE public.referral_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reward_type text NOT NULL,
  reward_title text NOT NULL,
  reward_description text,
  earned_at timestamp with time zone DEFAULT now(),
  claimed boolean DEFAULT false,
  claimed_at timestamp with time zone,
  referral_count_at_earn integer NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

-- Users can view their own rewards
CREATE POLICY "Users can view own rewards" ON public.referral_rewards
  FOR SELECT USING (auth.uid() = user_id);

-- Users can claim their own rewards
CREATE POLICY "Users can update own rewards" ON public.referral_rewards
  FOR UPDATE USING (auth.uid() = user_id);

-- System can insert rewards (via trigger)
CREATE POLICY "Users can insert own rewards" ON public.referral_rewards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to check and award referral milestones
CREATE OR REPLACE FUNCTION public.check_referral_milestones()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  referrer_id uuid;
  new_count integer;
BEGIN
  -- When referred_by is set on a new profile
  IF NEW.referred_by IS NOT NULL THEN
    referrer_id := NEW.referred_by;
    
    -- Increment referrer's count
    UPDATE profiles 
    SET referral_count = COALESCE(referral_count, 0) + 1 
    WHERE user_id = referrer_id
    RETURNING referral_count INTO new_count;
    
    -- Award milestone rewards
    IF new_count = 1 THEN
      INSERT INTO referral_rewards (user_id, reward_type, reward_title, reward_description, referral_count_at_earn)
      VALUES (referrer_id, 'streak_bonus', '+3 Day Streak Boost', 'Add 3 days to your streak', 1);
    ELSIF new_count = 3 THEN
      INSERT INTO referral_rewards (user_id, reward_type, reward_title, reward_description, referral_count_at_earn)
      VALUES (referrer_id, 'exclusive_theme', 'Exclusive Theme', 'Unlock the Aurora theme', 3);
    ELSIF new_count = 5 THEN
      INSERT INTO referral_rewards (user_id, reward_type, reward_title, reward_description, referral_count_at_earn)
      VALUES (referrer_id, 'pro_trial', '7-Day Pro Trial', 'Experience all Pro features free', 5);
    ELSIF new_count = 10 THEN
      INSERT INTO referral_rewards (user_id, reward_type, reward_title, reward_description, referral_count_at_earn)
      VALUES (referrer_id, 'advocate_badge', 'Advocate Badge', 'Special profile recognition', 10);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on profiles
CREATE TRIGGER on_referral_check_milestones
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_referral_milestones();