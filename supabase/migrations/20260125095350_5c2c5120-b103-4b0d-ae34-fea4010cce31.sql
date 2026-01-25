-- Add proper RLS policy for beta_promo_codes (read-only via service role, no direct access)
-- This table should only be accessed via edge functions with service role key

-- Add policy for beta_code_redemptions insert (users can redeem codes for themselves)
CREATE POLICY "Users can insert own redemptions"
ON public.beta_code_redemptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);