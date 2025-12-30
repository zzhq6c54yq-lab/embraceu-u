// Admin Dashboard Types

export interface AdminStats {
  totalUsers: number;
  totalMoods: number;
  totalRituals: number;
  totalPatterns: number;
  totalInsights: number;
  totalGratitude: number;
  activeToday: number;
  newSignupsToday: number;
  proSubscribers: number;
}

export interface UserInfo {
  user_id: string;
  nickname: string;
  current_streak: number;
  longest_streak: number;
  created_at: string;
  theme_preference: string;
  referral_count: number;
  pwa_installed: boolean;
  pwa_installed_at: string | null;
  total_time_spent_seconds: number;
  last_session_duration_seconds: number;
}

export interface ProSubscriber {
  id: string;
  email: string;
  name: string;
  status: string;
  currentPeriodEnd: string;
  created: string;
  plan: string;
}

export interface MoodEntry {
  id: string;
  mood: string;
  created_at: string;
  user_id: string;
}

export interface RitualEntry {
  id: string;
  ritual_type: string;
  created_at: string;
  user_id: string;
}

export interface RecentActivity {
  moods: MoodEntry[];
  rituals: RitualEntry[];
}

export interface ChartDataPoint {
  date: string;
  label: string;
  count?: number;
  moods?: number;
  rituals?: number;
}

export interface ChartData {
  signupsByDay: ChartDataPoint[];
  activityByDay: ChartDataPoint[];
}

export interface AdminDataResponse {
  stats: AdminStats;
  users: UserInfo[];
  proSubscribers: ProSubscriber[];
  recentActivity: RecentActivity;
  chartData: ChartData;
}

export interface ActivityFeedItem {
  id: string;
  type: 'mood' | 'ritual';
  created_at: string;
  user_id: string;
  mood?: string;
  ritual_type?: string;
}

export interface StatCardConfig {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
  trend?: number;
}

export type NotificationTarget = 'all' | 'pro';

export type UserSortOption = 'recent' | 'streak' | 'time_spent' | 'referrals';
export type UserFilterOption = 'all' | 'pwa' | 'web' | 'active_today';
