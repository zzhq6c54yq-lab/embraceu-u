-- Create beta promo codes table
CREATE TABLE public.beta_promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  max_uses INTEGER NOT NULL DEFAULT 25,
  current_uses INTEGER NOT NULL DEFAULT 0,
  trial_days INTEGER NOT NULL DEFAULT 14,
  is_active BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create redemption tracking table
CREATE TABLE public.beta_code_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id UUID REFERENCES public.beta_promo_codes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  redeemed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  UNIQUE(code_id, user_id)
);

-- Enable RLS
ALTER TABLE public.beta_promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beta_code_redemptions ENABLE ROW LEVEL SECURITY;

-- Admin can read codes (via edge function with service role)
-- Users can see their own redemptions
CREATE POLICY "Users can view own redemptions"
ON public.beta_code_redemptions
FOR SELECT
USING (auth.uid() = user_id);

-- Insert the 4 beta codes
INSERT INTO public.beta_promo_codes (code, max_uses, trial_days, description) VALUES
('EMBRACE14A', 25, 14, 'Beta Tester - Channel A'),
('EMBRACE14B', 25, 14, 'Beta Tester - Channel B'),
('BETAJOIN', 25, 14, 'Beta Tester - Direct Invite'),
('STEPHINSPIRESMT', 25, 14, 'Beta Tester - Steph Inspires');

-- Create index for faster lookups
CREATE INDEX idx_beta_codes_code ON public.beta_promo_codes(code);
CREATE INDEX idx_beta_redemptions_user ON public.beta_code_redemptions(user_id);