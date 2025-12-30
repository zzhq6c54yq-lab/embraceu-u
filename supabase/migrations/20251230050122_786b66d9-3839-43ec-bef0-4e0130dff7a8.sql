-- Add tracking columns to profiles table for PWA installation and time spent
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS pwa_installed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS pwa_installed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS total_time_spent_seconds integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_session_duration_seconds integer DEFAULT 0;