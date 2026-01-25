-- Delete existing beta codes
DELETE FROM beta_promo_codes;

-- Insert new beta codes with 500 max uses each
INSERT INTO beta_promo_codes (code, description, max_uses, trial_days, is_active)
VALUES 
  ('STEPHINSPIRESMT', 'StephInspiresMT Channel - 14 day Pro trial', 500, 14, true),
  ('CAMTHRIVES2', 'CamThrives Channel - 14 day Pro trial', 500, 14, true),
  ('FIELDOFDREAMS2', 'Field of Dreams Channel - 14 day Pro trial', 500, 14, true),
  ('SERENITYMT2', 'SerenityMT Channel - 14 day Pro trial', 500, 14, true);