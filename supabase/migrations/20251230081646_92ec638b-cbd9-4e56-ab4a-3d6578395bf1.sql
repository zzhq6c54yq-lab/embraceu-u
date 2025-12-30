-- Create user_rituals table for custom ritual sequences
CREATE TABLE public.user_rituals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  steps JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_rituals ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_rituals
CREATE POLICY "Users can view their own rituals"
  ON public.user_rituals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own rituals"
  ON public.user_rituals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rituals"
  ON public.user_rituals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rituals"
  ON public.user_rituals FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_rituals_updated_at
  BEFORE UPDATE ON public.user_rituals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();