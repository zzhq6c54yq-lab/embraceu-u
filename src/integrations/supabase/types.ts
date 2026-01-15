export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_coach_conversations: {
        Row: {
          context: Json | null
          created_at: string
          id: string
          messages: Json
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          context?: Json | null
          created_at?: string
          id?: string
          messages?: Json
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          context?: Json | null
          created_at?: string
          id?: string
          messages?: Json
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          created_at: string
          description: string | null
          icon_name: string
          id: string
          name: string
          requirement_type: string
          requirement_value: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon_name: string
          id?: string
          name: string
          requirement_type: string
          requirement_value: number
        }
        Update: {
          created_at?: string
          description?: string | null
          icon_name?: string
          id?: string
          name?: string
          requirement_type?: string
          requirement_value?: number
        }
        Relationships: []
      }
      challenge_participants: {
        Row: {
          challenge_id: string
          completed_at: string | null
          id: string
          joined_at: string
          progress: number
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          id?: string
          joined_at?: string
          progress?: number
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          id?: string
          joined_at?: string
          progress?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          day_number: number
          id: string
          reflection: string | null
          template_id: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          day_number: number
          id?: string
          reflection?: string | null
          template_id?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          day_number?: number
          id?: string
          reflection?: string | null
          template_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_progress_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "challenge_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_template_days: {
        Row: {
          created_at: string
          day_number: number
          description: string
          id: string
          template_id: string
          title: string
        }
        Insert: {
          created_at?: string
          day_number: number
          description: string
          id?: string
          template_id: string
          title: string
        }
        Update: {
          created_at?: string
          day_number?: number
          description?: string
          id?: string
          template_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_template_days_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "challenge_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_templates: {
        Row: {
          color: string
          created_at: string
          description: string | null
          icon_name: string
          id: string
          is_active: boolean
          name: string
          slug: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          icon_name?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          icon_name?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
        }
        Relationships: []
      }
      challenges: {
        Row: {
          created_at: string
          description: string | null
          end_date: string
          goal_target: number
          goal_type: string
          id: string
          is_active: boolean
          name: string
          start_date: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date: string
          goal_target?: number
          goal_type: string
          id?: string
          is_active?: boolean
          name: string
          start_date: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string
          goal_target?: number
          goal_type?: string
          id?: string
          is_active?: boolean
          name?: string
          start_date?: string
        }
        Relationships: []
      }
      daily_quotes: {
        Row: {
          author: string | null
          category: string | null
          created_at: string
          id: string
          quote_text: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          created_at?: string
          id?: string
          quote_text: string
        }
        Update: {
          author?: string | null
          category?: string | null
          created_at?: string
          id?: string
          quote_text?: string
        }
        Relationships: []
      }
      duo_activities: {
        Row: {
          activity_date: string | null
          activity_type: string
          both_revealed: boolean | null
          created_at: string | null
          id: string
          partner_1_completed: boolean | null
          partner_1_response: string | null
          partner_2_completed: boolean | null
          partner_2_response: string | null
          shared_streak_id: string | null
        }
        Insert: {
          activity_date?: string | null
          activity_type: string
          both_revealed?: boolean | null
          created_at?: string | null
          id?: string
          partner_1_completed?: boolean | null
          partner_1_response?: string | null
          partner_2_completed?: boolean | null
          partner_2_response?: string | null
          shared_streak_id?: string | null
        }
        Update: {
          activity_date?: string | null
          activity_type?: string
          both_revealed?: boolean | null
          created_at?: string | null
          id?: string
          partner_1_completed?: boolean | null
          partner_1_response?: string | null
          partner_2_completed?: boolean | null
          partner_2_response?: string | null
          shared_streak_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "duo_activities_shared_streak_id_fkey"
            columns: ["shared_streak_id"]
            isOneToOne: false
            referencedRelation: "shared_streaks"
            referencedColumns: ["id"]
          },
        ]
      }
      gratitude_entries: {
        Row: {
          created_at: string
          gratitude_text: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          gratitude_text: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          gratitude_text?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      journal_prompts: {
        Row: {
          category: string
          created_at: string
          id: string
          is_active: boolean
          prompt_text: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          prompt_text: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          prompt_text?: string
        }
        Relationships: []
      }
      mood_entries: {
        Row: {
          created_at: string
          id: string
          mood: string
          note: string | null
          recorded_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mood: string
          note?: string | null
          recorded_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mood?: string
          note?: string | null
          recorded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          id: string
          morning_reminder: boolean | null
          morning_reminder_time: string | null
          streak_warning: boolean | null
          updated_at: string | null
          user_id: string
          weekly_summary: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          morning_reminder?: boolean | null
          morning_reminder_time?: string | null
          streak_warning?: boolean | null
          updated_at?: string | null
          user_id: string
          weekly_summary?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          morning_reminder?: boolean | null
          morning_reminder_time?: string | null
          streak_warning?: boolean | null
          updated_at?: string | null
          user_id?: string
          weekly_summary?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          current_streak: number | null
          id: string
          last_active_date: string | null
          last_session_duration_seconds: number | null
          longest_streak: number | null
          nickname: string
          pwa_installed: boolean | null
          pwa_installed_at: string | null
          referral_code: string | null
          referral_count: number | null
          referral_pro_expires_at: string | null
          referral_pro_granted_at: string | null
          referral_pro_type: string | null
          referred_by: string | null
          share_mood_with_partner: boolean | null
          theme_preference: string | null
          total_insights_saved: number | null
          total_moods_logged: number | null
          total_patterns_released: number | null
          total_rituals_completed: number | null
          total_time_spent_seconds: number | null
          trial_end_date: string | null
          trial_promo_code: string | null
          trial_start_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          current_streak?: number | null
          id?: string
          last_active_date?: string | null
          last_session_duration_seconds?: number | null
          longest_streak?: number | null
          nickname: string
          pwa_installed?: boolean | null
          pwa_installed_at?: string | null
          referral_code?: string | null
          referral_count?: number | null
          referral_pro_expires_at?: string | null
          referral_pro_granted_at?: string | null
          referral_pro_type?: string | null
          referred_by?: string | null
          share_mood_with_partner?: boolean | null
          theme_preference?: string | null
          total_insights_saved?: number | null
          total_moods_logged?: number | null
          total_patterns_released?: number | null
          total_rituals_completed?: number | null
          total_time_spent_seconds?: number | null
          trial_end_date?: string | null
          trial_promo_code?: string | null
          trial_start_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          current_streak?: number | null
          id?: string
          last_active_date?: string | null
          last_session_duration_seconds?: number | null
          longest_streak?: number | null
          nickname?: string
          pwa_installed?: boolean | null
          pwa_installed_at?: string | null
          referral_code?: string | null
          referral_count?: number | null
          referral_pro_expires_at?: string | null
          referral_pro_granted_at?: string | null
          referral_pro_type?: string | null
          referred_by?: string | null
          share_mood_with_partner?: boolean | null
          theme_preference?: string | null
          total_insights_saved?: number | null
          total_moods_logged?: number | null
          total_patterns_released?: number | null
          total_rituals_completed?: number | null
          total_time_spent_seconds?: number | null
          trial_end_date?: string | null
          trial_promo_code?: string | null
          trial_start_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "user_impact_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      push_tokens: {
        Row: {
          created_at: string | null
          id: string
          platform: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          platform: string
          token: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          platform?: string
          token?: string
          user_id?: string
        }
        Relationships: []
      }
      quality_practice_logs: {
        Row: {
          created_at: string | null
          gratitude_note: string | null
          id: string
          practice_note: string
          quality_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          gratitude_note?: string | null
          id?: string
          practice_note: string
          quality_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          gratitude_note?: string | null
          id?: string
          practice_note?: string
          quality_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quality_practice_logs_quality_id_fkey"
            columns: ["quality_id"]
            isOneToOne: false
            referencedRelation: "user_qualities"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_rewards: {
        Row: {
          claimed: boolean | null
          claimed_at: string | null
          created_at: string | null
          earned_at: string | null
          id: string
          metadata: Json | null
          referral_count_at_earn: number
          reward_description: string | null
          reward_title: string
          reward_type: string
          user_id: string
        }
        Insert: {
          claimed?: boolean | null
          claimed_at?: string | null
          created_at?: string | null
          earned_at?: string | null
          id?: string
          metadata?: Json | null
          referral_count_at_earn: number
          reward_description?: string | null
          reward_title: string
          reward_type: string
          user_id: string
        }
        Update: {
          claimed?: boolean | null
          claimed_at?: string | null
          created_at?: string | null
          earned_at?: string | null
          id?: string
          metadata?: Json | null
          referral_count_at_earn?: number
          reward_description?: string | null
          reward_title?: string
          reward_type?: string
          user_id?: string
        }
        Relationships: []
      }
      rituals_completed: {
        Row: {
          completed_at: string
          created_at: string
          duration_seconds: number | null
          id: string
          ritual_type: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          ritual_type: string
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          ritual_type?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_insights: {
        Row: {
          category: string | null
          created_at: string
          id: string
          insight_text: string
          insight_type: string
          is_practiced: boolean | null
          practice_note: string | null
          practiced_at: string | null
          scheduled_date: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          insight_text: string
          insight_type?: string
          is_practiced?: boolean | null
          practice_note?: string | null
          practiced_at?: string | null
          scheduled_date?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          insight_text?: string
          insight_type?: string
          is_practiced?: boolean | null
          practice_note?: string | null
          practiced_at?: string | null
          scheduled_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      shared_streaks: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          last_sync: string | null
          partner_1: string
          partner_2: string
          streak_count: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync?: string | null
          partner_1: string
          partner_2: string
          streak_count?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync?: string | null
          partner_1?: string
          partner_2?: string
          streak_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_streaks_partner_1_fkey"
            columns: ["partner_1"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "shared_streaks_partner_1_fkey"
            columns: ["partner_1"]
            isOneToOne: false
            referencedRelation: "user_impact_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "shared_streaks_partner_2_fkey"
            columns: ["partner_2"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "shared_streaks_partner_2_fkey"
            columns: ["partner_2"]
            isOneToOne: false
            referencedRelation: "user_impact_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      site_visits: {
        Row: {
          created_at: string
          id: string
          page_path: string
          referrer: string | null
          user_agent: string | null
          visitor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          page_path: string
          referrer?: string | null
          user_agent?: string | null
          visitor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          page_path?: string
          referrer?: string | null
          user_agent?: string | null
          visitor_id?: string
        }
        Relationships: []
      }
      streak_milestones: {
        Row: {
          celebrated_at: string | null
          id: string
          milestone_days: number
          user_id: string
        }
        Insert: {
          celebrated_at?: string | null
          id?: string
          milestone_days: number
          user_id: string
        }
        Update: {
          celebrated_at?: string | null
          id?: string
          milestone_days?: number
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_patterns: {
        Row: {
          created_at: string
          id: string
          impact_note: string | null
          is_released: boolean | null
          pattern_name: string
          recognition_note: string | null
          release_intention: string | null
          released_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          impact_note?: string | null
          is_released?: boolean | null
          pattern_name: string
          recognition_note?: string | null
          release_intention?: string | null
          released_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          impact_note?: string | null
          is_released?: boolean | null
          pattern_name?: string
          recognition_note?: string | null
          release_intention?: string | null
          released_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_qualities: {
        Row: {
          created_at: string
          id: string
          is_cultivated: boolean | null
          progress: number | null
          quality_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_cultivated?: boolean | null
          progress?: number | null
          quality_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_cultivated?: boolean | null
          progress?: number | null
          quality_name?: string
          user_id?: string
        }
        Relationships: []
      }
      user_rituals: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          steps: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          steps: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          steps?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_visions: {
        Row: {
          created_at: string
          deconstructed_steps: Json | null
          id: string
          is_completed: boolean | null
          user_id: string
          vision_text: string
        }
        Insert: {
          created_at?: string
          deconstructed_steps?: Json | null
          id?: string
          is_completed?: boolean | null
          user_id: string
          vision_text: string
        }
        Update: {
          created_at?: string
          deconstructed_steps?: Json | null
          id?: string
          is_completed?: boolean | null
          user_id?: string
          vision_text?: string
        }
        Relationships: []
      }
    }
    Views: {
      user_impact_summary: {
        Row: {
          current_streak: number | null
          growth_rank: string | null
          longest_streak: number | null
          nickname: string | null
          total_activities: number | null
          total_insights_saved: number | null
          total_moods_logged: number | null
          total_patterns_released: number | null
          total_rituals_completed: number | null
          user_id: string | null
        }
        Insert: {
          current_streak?: number | null
          growth_rank?: never
          longest_streak?: number | null
          nickname?: string | null
          total_activities?: never
          total_insights_saved?: never
          total_moods_logged?: never
          total_patterns_released?: never
          total_rituals_completed?: never
          user_id?: string | null
        }
        Update: {
          current_streak?: number | null
          growth_rank?: never
          longest_streak?: number | null
          nickname?: string | null
          total_activities?: never
          total_insights_saved?: never
          total_moods_logged?: never
          total_patterns_released?: never
          total_rituals_completed?: never
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
