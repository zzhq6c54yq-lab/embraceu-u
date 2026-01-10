-- Create storage bucket for AI-generated nebula backgrounds
INSERT INTO storage.buckets (id, name, public)
VALUES ('nebula-backgrounds', 'nebula-backgrounds', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public read access for nebula backgrounds"
ON storage.objects FOR SELECT
USING (bucket_id = 'nebula-backgrounds');

-- Allow authenticated users to upload (for the edge function with service role)
CREATE POLICY "Service role upload for nebula backgrounds"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'nebula-backgrounds');