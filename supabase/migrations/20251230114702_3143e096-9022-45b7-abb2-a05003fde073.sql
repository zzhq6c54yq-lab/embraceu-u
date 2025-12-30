-- Allow admins to view all mood entries
CREATE POLICY "Admins can view all mood entries"
ON public.mood_entries
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all completed rituals
CREATE POLICY "Admins can view all rituals"
ON public.rituals_completed
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));