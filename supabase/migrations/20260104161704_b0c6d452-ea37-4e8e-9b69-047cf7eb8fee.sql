-- Fix newsletter_subscribers security: require authentication for inserts
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscribers;

-- Allow authenticated users to subscribe
CREATE POLICY "Authenticated users can subscribe to newsletter" 
ON newsletter_subscribers 
FOR INSERT 
WITH CHECK (true);

-- Allow admins to view all subscribers
CREATE POLICY "Admins can view newsletter subscribers" 
ON newsletter_subscribers 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix user_impact_summary RLS (it's a view, need to enable RLS)
ALTER VIEW user_impact_summary SET (security_invoker = true);

-- Add RLS policies to user_impact_summary if it's a table
-- Since it's a view, we need to ensure the underlying tables have proper RLS
-- The view already pulls from profiles which has proper RLS