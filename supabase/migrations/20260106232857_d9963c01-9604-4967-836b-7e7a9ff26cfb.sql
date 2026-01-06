-- notification_preferences table
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  morning_reminder BOOLEAN DEFAULT true,
  morning_reminder_time TIME DEFAULT '08:00:00',
  streak_warning BOOLEAN DEFAULT true,
  weekly_summary BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own preferences" ON notification_preferences
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own preferences" ON notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- streak_milestones table
CREATE TABLE streak_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  milestone_days INTEGER NOT NULL,
  celebrated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, milestone_days)
);
ALTER TABLE streak_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own milestones" ON streak_milestones
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own milestones" ON streak_milestones
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- New badges for streak milestones
INSERT INTO badges (name, description, icon_name, requirement_type, requirement_value) VALUES
('Two Week Wonder', 'Achieve a 14-day streak', 'calendar', 'streak', 14),
('60 Day Devotee', 'Maintain a 60-day streak', 'trophy', 'streak', 60),
('Century Soul', 'Achieve a 100-day streak', 'star', 'streak', 100),
('Year of Growth', 'Complete a 365-day streak', 'sun', 'streak', 365);