-- Create duo_activities table to track interactive partner activities
CREATE TABLE public.duo_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shared_streak_id UUID REFERENCES public.shared_streaks(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_date DATE DEFAULT CURRENT_DATE,
  partner_1_completed BOOLEAN DEFAULT FALSE,
  partner_1_response TEXT,
  partner_2_completed BOOLEAN DEFAULT FALSE,
  partner_2_response TEXT,
  both_revealed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.duo_activities ENABLE ROW LEVEL SECURITY;

-- Partners can view their activities
CREATE POLICY "Partners can view their duo activities" 
ON public.duo_activities 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.shared_streaks ss 
    WHERE ss.id = duo_activities.shared_streak_id 
    AND (ss.partner_1 = auth.uid() OR ss.partner_2 = auth.uid())
  )
);

-- Partners can create activities
CREATE POLICY "Partners can create duo activities" 
ON public.duo_activities 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.shared_streaks ss 
    WHERE ss.id = duo_activities.shared_streak_id 
    AND (ss.partner_1 = auth.uid() OR ss.partner_2 = auth.uid())
  )
);

-- Partners can update activities
CREATE POLICY "Partners can update duo activities" 
ON public.duo_activities 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.shared_streaks ss 
    WHERE ss.id = duo_activities.shared_streak_id 
    AND (ss.partner_1 = auth.uid() OR ss.partner_2 = auth.uid())
  )
);

-- Enable realtime for duo activities
ALTER PUBLICATION supabase_realtime ADD TABLE public.duo_activities;