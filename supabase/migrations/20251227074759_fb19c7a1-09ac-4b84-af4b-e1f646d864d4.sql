-- Add referral and theme columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE DEFAULT lower(substring(md5(random()::text) from 1 for 8)),
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(user_id),
ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'gold';

-- Generate referral codes for existing users who don't have one
UPDATE public.profiles 
SET referral_code = lower(substring(md5(random()::text || id::text) from 1 for 8))
WHERE referral_code IS NULL;

-- Create shared_streaks table for Duo Mode
CREATE TABLE IF NOT EXISTS public.shared_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_1 UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  partner_2 UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  streak_count INT DEFAULT 0,
  last_sync DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_duo UNIQUE (partner_1, partner_2)
);

-- Enable RLS on shared_streaks
ALTER TABLE public.shared_streaks ENABLE ROW LEVEL SECURITY;

-- RLS: Partners can view their shared streaks
CREATE POLICY "Partners can view their shared streak" 
ON public.shared_streaks FOR SELECT 
USING (auth.uid() = partner_1 OR auth.uid() = partner_2);

-- RLS: Users can create shared streaks
CREATE POLICY "Users can create shared streaks" 
ON public.shared_streaks FOR INSERT 
WITH CHECK (auth.uid() = partner_1);

-- RLS: Partners can update their shared streak
CREATE POLICY "Partners can update their shared streak" 
ON public.shared_streaks FOR UPDATE 
USING (auth.uid() = partner_1 OR auth.uid() = partner_2);

-- RLS: Partners can delete their shared streak
CREATE POLICY "Partners can delete their shared streak" 
ON public.shared_streaks FOR DELETE 
USING (auth.uid() = partner_1 OR auth.uid() = partner_2);

-- Create user_impact_summary view for Impact Wrap
CREATE OR REPLACE VIEW public.user_impact_summary AS
SELECT 
  p.user_id,
  p.nickname,
  p.current_streak,
  p.longest_streak,
  COALESCE(p.total_rituals_completed, 0) as total_rituals_completed,
  COALESCE(p.total_patterns_released, 0) as total_patterns_released,
  COALESCE(p.total_moods_logged, 0) as total_moods_logged,
  COALESCE(p.total_insights_saved, 0) as total_insights_saved,
  (COALESCE(p.total_rituals_completed, 0) + COALESCE(p.total_patterns_released, 0) + COALESCE(p.total_moods_logged, 0) + COALESCE(p.total_insights_saved, 0)) as total_activities,
  CASE 
    WHEN (COALESCE(p.total_rituals_completed, 0) + COALESCE(p.total_patterns_released, 0) + COALESCE(p.total_moods_logged, 0) + COALESCE(p.total_insights_saved, 0)) >= 100 THEN 'Champion'
    WHEN (COALESCE(p.total_rituals_completed, 0) + COALESCE(p.total_patterns_released, 0) + COALESCE(p.total_moods_logged, 0) + COALESCE(p.total_insights_saved, 0)) >= 50 THEN 'Warrior'
    WHEN (COALESCE(p.total_rituals_completed, 0) + COALESCE(p.total_patterns_released, 0) + COALESCE(p.total_moods_logged, 0) + COALESCE(p.total_insights_saved, 0)) >= 25 THEN 'Explorer'
    ELSE 'Beginner'
  END as growth_rank
FROM public.profiles p;

-- Update handle_new_user function to include referral_code
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nickname, referral_code)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'nickname', 'Friend'),
    lower(substring(md5(random()::text || NEW.id::text) from 1 for 8))
  );
  RETURN NEW;
END;
$$;