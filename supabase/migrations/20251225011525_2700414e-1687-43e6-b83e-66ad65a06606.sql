-- Add stats columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_active_date DATE,
ADD COLUMN IF NOT EXISTS total_rituals_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_patterns_released INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_moods_logged INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_insights_saved INTEGER DEFAULT 0;