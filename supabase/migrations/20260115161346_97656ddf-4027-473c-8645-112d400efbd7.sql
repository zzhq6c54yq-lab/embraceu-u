-- Create site_visits table for visitor tracking
CREATE TABLE public.site_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  page_path text NOT NULL,
  user_agent text,
  referrer text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create index for efficient counting
CREATE INDEX idx_site_visits_created_at ON public.site_visits(created_at);
CREATE INDEX idx_site_visits_visitor_id ON public.site_visits(visitor_id);

-- Enable RLS
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert visits (public tracking)
CREATE POLICY "Anyone can log visits" 
ON public.site_visits 
FOR INSERT 
WITH CHECK (true);

-- Only admins can view all visits
CREATE POLICY "Admins can view all visits" 
ON public.site_visits 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Add realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_visits;