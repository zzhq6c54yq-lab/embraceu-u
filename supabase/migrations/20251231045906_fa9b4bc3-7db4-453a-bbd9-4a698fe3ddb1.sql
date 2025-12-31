-- Newsletter subscribers table
CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow insert from anyone (public signup)
CREATE POLICY "Anyone can subscribe to newsletter" 
ON public.newsletter_subscribers 
FOR INSERT 
WITH CHECK (true);

-- Challenges table
CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  goal_type TEXT NOT NULL,
  goal_target INTEGER NOT NULL DEFAULT 7,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

-- Anyone can view active challenges
CREATE POLICY "Anyone can view challenges" 
ON public.challenges 
FOR SELECT 
USING (true);

-- Challenge participants table
CREATE TABLE public.challenge_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, challenge_id)
);

-- Enable RLS
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all participants" 
ON public.challenge_participants 
FOR SELECT 
USING (true);

CREATE POLICY "Users can join challenges" 
ON public.challenge_participants 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
ON public.challenge_participants 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Journal prompts table
CREATE TABLE public.journal_prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_text TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'gratitude',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.journal_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active prompts" 
ON public.journal_prompts 
FOR SELECT 
USING (is_active = true);

-- Badges table
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badges" 
ON public.badges 
FOR SELECT 
USING (true);

-- User badges table
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own badges" 
ON public.user_badges 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can earn badges" 
ON public.user_badges 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add share_mood_with_partner to profiles
ALTER TABLE public.profiles 
ADD COLUMN share_mood_with_partner BOOLEAN DEFAULT false;

-- Seed initial badges
INSERT INTO public.badges (name, description, icon_name, requirement_type, requirement_value) VALUES
('First Step', 'Complete your first activity', 'footprints', 'total_activities', 1),
('Week Warrior', 'Achieve a 7-day streak', 'flame', 'streak', 7),
('Month Master', 'Achieve a 30-day streak', 'crown', 'streak', 30),
('Mood Master', 'Log 30 mood entries', 'smile', 'moods_logged', 30),
('Gratitude Guru', 'Write 50 gratitude entries', 'heart', 'gratitude_entries', 50),
('Ritual Regular', 'Complete 20 rituals', 'sparkles', 'rituals_completed', 20),
('Pattern Breaker', 'Release 5 patterns', 'shield', 'patterns_released', 5),
('Insight Seeker', 'Save 10 insights', 'lightbulb', 'insights_saved', 10),
('Duo Champion', 'Maintain a 14-day duo streak', 'users', 'duo_streak', 14);

-- Seed initial journal prompts
INSERT INTO public.journal_prompts (prompt_text, category) VALUES
('What small moment brought you joy today?', 'gratitude'),
('Who made a positive impact on your life recently?', 'gratitude'),
('What is something you accomplished this week that you''re proud of?', 'gratitude'),
('What part of your daily routine are you most thankful for?', 'gratitude'),
('What challenge helped you grow recently?', 'reflection'),
('What limiting belief are you ready to let go of?', 'reflection'),
('How have you shown kindness to yourself today?', 'reflection'),
('What would you tell your younger self about where you are now?', 'reflection'),
('What quality do you want to embody more fully?', 'growth'),
('What new habit would most transform your life?', 'growth'),
('What fear is holding you back, and how can you take one small step past it?', 'growth'),
('What does your ideal day look like, and what can you do to move toward it?', 'growth'),
('What made you smile today, even if just for a moment?', 'gratitude'),
('What is a simple pleasure you often take for granted?', 'gratitude'),
('Who in your life consistently shows up for you?', 'gratitude'),
('What aspect of your health are you grateful for?', 'gratitude'),
('What lesson did today teach you?', 'reflection'),
('How did you handle stress today, and what could you do differently?', 'reflection'),
('What emotions did you experience today and why?', 'reflection'),
('What boundaries do you need to set or reinforce?', 'reflection'),
('What skill would you like to develop or improve?', 'growth'),
('How can you step outside your comfort zone this week?', 'growth'),
('What relationship would you like to strengthen?', 'growth'),
('What self-care practice do you want to prioritize?', 'growth'),
('What are you looking forward to tomorrow?', 'gratitude'),
('What beauty did you notice in your surroundings today?', 'gratitude'),
('What opportunity are you grateful to have?', 'gratitude'),
('How did someone make your day better today?', 'gratitude'),
('What patterns do you notice in your thoughts lately?', 'reflection'),
('What is your body telling you that you might be ignoring?', 'reflection');

-- Seed sample challenges
INSERT INTO public.challenges (name, description, start_date, end_date, goal_type, goal_target) VALUES
('7-Day Gratitude Sprint', 'Write at least one gratitude entry every day for 7 days', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', 'gratitude', 7),
('Breathwork Week', 'Complete a breathing exercise every day this week', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', 'breathwork', 7),
('Mood Awareness Month', 'Log your mood every day for 30 days', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'mood', 30);