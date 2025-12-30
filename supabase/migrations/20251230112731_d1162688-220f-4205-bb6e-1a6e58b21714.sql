-- Allow admins to view all profiles for the admin dashboard and realtime subscriptions
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));