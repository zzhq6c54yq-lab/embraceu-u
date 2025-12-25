-- Create user_patterns table for patterns to release
CREATE TABLE public.user_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pattern_name TEXT NOT NULL,
  is_released BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  released_at TIMESTAMP WITH TIME ZONE
);

-- Create user_qualities table for qualities to cultivate
CREATE TABLE public.user_qualities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quality_name TEXT NOT NULL,
  is_cultivated BOOLEAN DEFAULT false,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_visions table for deconstructed visions
CREATE TABLE public.user_visions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  vision_text TEXT NOT NULL,
  deconstructed_steps JSONB,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily_quotes table for curated quotes
CREATE TABLE public.daily_quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_text TEXT NOT NULL,
  author TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_qualities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_visions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_quotes ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_patterns
CREATE POLICY "Users can view their own patterns" ON public.user_patterns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own patterns" ON public.user_patterns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own patterns" ON public.user_patterns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own patterns" ON public.user_patterns FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for user_qualities
CREATE POLICY "Users can view their own qualities" ON public.user_qualities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own qualities" ON public.user_qualities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own qualities" ON public.user_qualities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own qualities" ON public.user_qualities FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for user_visions
CREATE POLICY "Users can view their own visions" ON public.user_visions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own visions" ON public.user_visions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own visions" ON public.user_visions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own visions" ON public.user_visions FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for daily_quotes (publicly readable)
CREATE POLICY "Anyone can view daily quotes" ON public.daily_quotes FOR SELECT USING (true);

-- Insert curated daily quotes
INSERT INTO public.daily_quotes (quote_text, author, category) VALUES
('I am no longer waiting for the right moment; I am the moment, arriving fully in this breath.', NULL, 'presence'),
('My presence is my power. I choose to be here, fully, without apology.', NULL, 'presence'),
('I release the weight of what was, and embrace the lightness of what is.', NULL, 'release'),
('Today, I cultivate patience with myself and curiosity about my growth.', NULL, 'growth'),
('I am not my thoughts. I am the awareness that observes them.', NULL, 'awareness'),
('Every ending is a beginning dressed in unfamiliar clothes.', NULL, 'transformation'),
('I trust the timing of my life, even when I cannot see the path ahead.', NULL, 'trust'),
('Stillness is not the absence of movement, but the presence of peace.', NULL, 'peace'),
('I honor my needs without guilt and my boundaries without shame.', NULL, 'self-care'),
('Growth is not linear. Every setback is setting up a comeback.', NULL, 'resilience'),
('I am learning to hold space for both joy and sorrow within me.', NULL, 'balance'),
('My worth is not measured by my productivity but by my presence.', NULL, 'worth'),
('I choose progress over perfection, compassion over criticism.', NULL, 'growth'),
('In this moment, I have everything I need to begin again.', NULL, 'renewal'),
('I am the author of my story, and today I write a new chapter.', NULL, 'empowerment');