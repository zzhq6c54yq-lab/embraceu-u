-- Create table for 30-day challenge progress
CREATE TABLE public.challenge_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 30),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reflection TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, day_number)
);

-- Enable RLS
ALTER TABLE public.challenge_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own challenge progress"
ON public.challenge_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own challenge progress"
ON public.challenge_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenge progress"
ON public.challenge_progress FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own challenge progress"
ON public.challenge_progress FOR DELETE
USING (auth.uid() = user_id);