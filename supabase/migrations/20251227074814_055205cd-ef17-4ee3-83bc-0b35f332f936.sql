-- Fix security definer view by recreating without security definer
-- Drop and recreate with SECURITY INVOKER (default)
DROP VIEW IF EXISTS public.user_impact_summary;

CREATE VIEW public.user_impact_summary 
WITH (security_invoker = true) AS
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