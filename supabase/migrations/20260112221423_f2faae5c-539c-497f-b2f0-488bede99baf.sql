-- Add referral-based Pro access columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS referral_pro_type TEXT,
ADD COLUMN IF NOT EXISTS referral_pro_granted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS referral_pro_expires_at TIMESTAMPTZ;

-- Update check_referral_milestones function with new milestones (3, 5, 10, 20, 50)
CREATE OR REPLACE FUNCTION public.check_referral_milestones()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    
    -- Award milestone rewards based on new thresholds
    IF new_count = 3 THEN
      INSERT INTO referral_rewards (user_id, reward_type, reward_title, reward_description, referral_count_at_earn)
      VALUES (referrer_id, 'streak_bonus', '+3 Day Streak Boost', 'Add 3 days to your streak', 3);
    ELSIF new_count = 5 THEN
      INSERT INTO referral_rewards (user_id, reward_type, reward_title, reward_description, referral_count_at_earn)
      VALUES (referrer_id, 'exclusive_theme', 'Aurora Theme', 'Unlock the exclusive Aurora cosmic theme', 5);
    ELSIF new_count = 10 THEN
      INSERT INTO referral_rewards (user_id, reward_type, reward_title, reward_description, referral_count_at_earn)
      VALUES (referrer_id, 'pro_trial', '7-Day Pro Trial', 'Experience all Pro features free', 10);
    ELSIF new_count = 20 THEN
      -- Grant 1 month Pro access
      INSERT INTO referral_rewards (user_id, reward_type, reward_title, reward_description, referral_count_at_earn)
      VALUES (referrer_id, 'pro_month', '1 Month Pro', 'Full Pro access for 30 days', 20);
      -- Also update profile with Pro access
      UPDATE profiles
      SET 
        referral_pro_type = 'month',
        referral_pro_granted_at = NOW(),
        referral_pro_expires_at = NOW() + INTERVAL '30 days'
      WHERE user_id = referrer_id;
    ELSIF new_count = 50 THEN
      -- Grant 1 year Pro access
      INSERT INTO referral_rewards (user_id, reward_type, reward_title, reward_description, referral_count_at_earn)
      VALUES (referrer_id, 'pro_year', '1 Year Pro', 'Full Pro access for 365 days', 50);
      -- Also update profile with Pro access (extend if they already have referral pro)
      UPDATE profiles
      SET 
        referral_pro_type = 'year',
        referral_pro_granted_at = NOW(),
        referral_pro_expires_at = GREATEST(COALESCE(referral_pro_expires_at, NOW()), NOW()) + INTERVAL '365 days'
      WHERE user_id = referrer_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;