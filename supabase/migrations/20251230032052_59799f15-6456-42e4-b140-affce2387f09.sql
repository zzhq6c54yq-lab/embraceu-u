-- Enable realtime for profiles table to track new signups live
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Enable realtime for mood_entries to track daily activity
ALTER PUBLICATION supabase_realtime ADD TABLE public.mood_entries;

-- Enable realtime for rituals_completed to track engagement
ALTER PUBLICATION supabase_realtime ADD TABLE public.rituals_completed;