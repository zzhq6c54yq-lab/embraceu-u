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
      challenge_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          day_number: number
          id: string
          reflection: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          day_number: number
          id?: string
          reflection?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          day_number?: number
          id?: string
          reflection?: string | null
          user_id?: string
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
      profiles: {
        Row: {
          created_at: string
          current_streak: number | null
          id: string
          last_active_date: string | null
          longest_streak: number | null
          nickname: string
          referral_code: string | null
          referred_by: string | null
          theme_preference: string | null
          total_insights_saved: number | null
          total_moods_logged: number | null
          total_patterns_released: number | null
          total_rituals_completed: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number | null
          id?: string
          last_active_date?: string | null
          longest_streak?: number | null
          nickname: string
          referral_code?: string | null
          referred_by?: string | null
          theme_preference?: string | null
          total_insights_saved?: number | null
          total_moods_logged?: number | null
          total_patterns_released?: number | null
          total_rituals_completed?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number | null
          id?: string
          last_active_date?: string | null
          longest_streak?: number | null
          nickname?: string
          referral_code?: string | null
          referred_by?: string | null
          theme_preference?: string | null
          total_insights_saved?: number | null
          total_moods_logged?: number | null
          total_patterns_released?: number | null
          total_rituals_completed?: number | null
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
