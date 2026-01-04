-- Create challenge_templates table for the 6 themed challenges
CREATE TABLE public.challenge_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT NOT NULL DEFAULT 'heart',
  color TEXT NOT NULL DEFAULT 'primary',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create challenge_template_days table for daily activities
CREATE TABLE public.challenge_template_days (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.challenge_templates(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 30),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(template_id, day_number)
);

-- Add template_id to challenge_progress to track which challenge type
ALTER TABLE public.challenge_progress 
ADD COLUMN template_id UUID REFERENCES public.challenge_templates(id) ON DELETE CASCADE;

-- Enable RLS on new tables
ALTER TABLE public.challenge_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_template_days ENABLE ROW LEVEL SECURITY;

-- RLS policies for challenge_templates (public read)
CREATE POLICY "Anyone can view active challenge templates"
ON public.challenge_templates
FOR SELECT
USING (is_active = true);

-- RLS policies for challenge_template_days (public read)
CREATE POLICY "Anyone can view challenge template days"
ON public.challenge_template_days
FOR SELECT
USING (true);