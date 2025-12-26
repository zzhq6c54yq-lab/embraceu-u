-- Add reflection columns to user_patterns
ALTER TABLE user_patterns ADD COLUMN recognition_note text;
ALTER TABLE user_patterns ADD COLUMN impact_note text;
ALTER TABLE user_patterns ADD COLUMN release_intention text;

-- Create quality practice logs table
CREATE TABLE quality_practice_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  quality_id uuid REFERENCES user_qualities(id) ON DELETE CASCADE,
  practice_note text NOT NULL,
  gratitude_note text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on quality_practice_logs
ALTER TABLE quality_practice_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for quality_practice_logs
CREATE POLICY "Users can view their own practice logs"
ON quality_practice_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own practice logs"
ON quality_practice_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own practice logs"
ON quality_practice_logs FOR DELETE
USING (auth.uid() = user_id);

-- Add scheduling columns to saved_insights
ALTER TABLE saved_insights ADD COLUMN scheduled_date date;
ALTER TABLE saved_insights ADD COLUMN is_practiced boolean DEFAULT false;
ALTER TABLE saved_insights ADD COLUMN practice_note text;
ALTER TABLE saved_insights ADD COLUMN practiced_at timestamptz;