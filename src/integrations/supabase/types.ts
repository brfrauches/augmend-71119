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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      body_measurements: {
        Row: {
          attachment_url: string | null
          basal_metabolic_rate: number | null
          created_at: string
          fat_percent: number | null
          fat_weight_kg: number | null
          height_m: number | null
          id: string
          imc: number | null
          lean_mass_kg: number | null
          measured_at: string
          notes: string | null
          updated_at: string
          user_id: string
          water_percent: number | null
          weight_kg: number
        }
        Insert: {
          attachment_url?: string | null
          basal_metabolic_rate?: number | null
          created_at?: string
          fat_percent?: number | null
          fat_weight_kg?: number | null
          height_m?: number | null
          id?: string
          imc?: number | null
          lean_mass_kg?: number | null
          measured_at?: string
          notes?: string | null
          updated_at?: string
          user_id: string
          water_percent?: number | null
          weight_kg: number
        }
        Update: {
          attachment_url?: string | null
          basal_metabolic_rate?: number | null
          created_at?: string
          fat_percent?: number | null
          fat_weight_kg?: number | null
          height_m?: number | null
          id?: string
          imc?: number | null
          lean_mass_kg?: number | null
          measured_at?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
          water_percent?: number | null
          weight_kg?: number
        }
        Relationships: []
      }
      body_segments: {
        Row: {
          created_at: string
          fat_mass_kg: number | null
          id: string
          lean_mass_kg: number | null
          measurement_id: string
          region: string
        }
        Insert: {
          created_at?: string
          fat_mass_kg?: number | null
          id?: string
          lean_mass_kg?: number | null
          measurement_id: string
          region: string
        }
        Update: {
          created_at?: string
          fat_mass_kg?: number | null
          id?: string
          lean_mass_kg?: number | null
          measurement_id?: string
          region?: string
        }
        Relationships: [
          {
            foreignKeyName: "body_segments_measurement_id_fkey"
            columns: ["measurement_id"]
            isOneToOne: false
            referencedRelation: "body_measurements"
            referencedColumns: ["id"]
          },
        ]
      }
      client_trainers: {
        Row: {
          client_id: string
          created_at: string | null
          id: string
          trainer_id: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          id?: string
          trainer_id: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          id?: string
          trainer_id?: string
        }
        Relationships: []
      }
      health_marker_values: {
        Row: {
          created_at: string
          id: string
          marker_id: string
          measured_at: string
          notes: string | null
          supplement_intervention_id: string | null
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          marker_id: string
          measured_at?: string
          notes?: string | null
          supplement_intervention_id?: string | null
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          marker_id?: string
          measured_at?: string
          notes?: string | null
          supplement_intervention_id?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "health_marker_values_marker_id_fkey"
            columns: ["marker_id"]
            isOneToOne: false
            referencedRelation: "health_markers"
            referencedColumns: ["id"]
          },
        ]
      }
      health_markers: {
        Row: {
          created_at: string
          id: string
          max_reference: number | null
          min_reference: number | null
          name: string
          personal_goal: number | null
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          max_reference?: number | null
          min_reference?: number | null
          name: string
          personal_goal?: number | null
          unit: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          max_reference?: number | null
          min_reference?: number | null
          name?: string
          personal_goal?: number | null
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      nutrition_ai_logs: {
        Row: {
          created_at: string
          id: string
          suggestion_text: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          suggestion_text: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          suggestion_text?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      nutrition_items: {
        Row: {
          calories: number | null
          carbs_g: number | null
          created_at: string
          fat_g: number | null
          id: string
          meal_id: string
          name: string
          protein_g: number | null
          quantity: string | null
        }
        Insert: {
          calories?: number | null
          carbs_g?: number | null
          created_at?: string
          fat_g?: number | null
          id?: string
          meal_id: string
          name: string
          protein_g?: number | null
          quantity?: string | null
        }
        Update: {
          calories?: number | null
          carbs_g?: number | null
          created_at?: string
          fat_g?: number | null
          id?: string
          meal_id?: string
          name?: string
          protein_g?: number | null
          quantity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_items_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "nutrition_meals"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_meals: {
        Row: {
          carbs_g: number | null
          category: string
          created_at: string
          fat_g: number | null
          id: string
          image_url: string | null
          is_ai_generated: boolean | null
          name: string
          notes: string | null
          protein_g: number | null
          total_calories: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          carbs_g?: number | null
          category: string
          created_at?: string
          fat_g?: number | null
          id?: string
          image_url?: string | null
          is_ai_generated?: boolean | null
          name: string
          notes?: string | null
          protein_g?: number | null
          total_calories?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          carbs_g?: number | null
          category?: string
          created_at?: string
          fat_g?: number | null
          id?: string
          image_url?: string | null
          is_ai_generated?: boolean | null
          name?: string
          notes?: string | null
          protein_g?: number | null
          total_calories?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      supplement_logs: {
        Row: {
          created_at: string | null
          dose: string | null
          id: string
          notes: string | null
          supplement_id: string
          taken_at: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dose?: string | null
          id?: string
          notes?: string | null
          supplement_id: string
          taken_at: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          dose?: string | null
          id?: string
          notes?: string | null
          supplement_id?: string
          taken_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplement_logs_supplement_id_fkey"
            columns: ["supplement_id"]
            isOneToOne: false
            referencedRelation: "supplements"
            referencedColumns: ["id"]
          },
        ]
      }
      supplements: {
        Row: {
          created_at: string | null
          dosage: string | null
          end_date: string | null
          form: string | null
          frequency: string | null
          id: string
          is_active: boolean | null
          linked_marker_id: string | null
          name: string
          notes: string | null
          start_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dosage?: string | null
          end_date?: string | null
          form?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          linked_marker_id?: string | null
          name: string
          notes?: string | null
          start_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dosage?: string | null
          end_date?: string | null
          form?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          linked_marker_id?: string | null
          name?: string
          notes?: string | null
          start_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplements_linked_marker_id_fkey"
            columns: ["linked_marker_id"]
            isOneToOne: false
            referencedRelation: "health_markers"
            referencedColumns: ["id"]
          },
        ]
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
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      water_logs: {
        Row: {
          amount_ml: number
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          amount_ml: number
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          amount_ml?: number
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      workout_checkins: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          notes: string | null
          user_id: string
          workout_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          user_id: string
          workout_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          user_id?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_checkins_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_exercises: {
        Row: {
          created_at: string | null
          id: string
          load: number | null
          name: string
          notes: string | null
          order_index: number | null
          reps: number
          sets: number
          workout_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          load?: number | null
          name: string
          notes?: string | null
          order_index?: number | null
          reps: number
          sets: number
          workout_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          load?: number | null
          name?: string
          notes?: string | null
          order_index?: number | null
          reps?: number
          sets?: number
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          difficulty_level: string | null
          estimated_duration: number | null
          id: string
          is_template: boolean | null
          name: string
          updated_at: string | null
          user_id: string
          week_days: string[] | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          estimated_duration?: number | null
          id?: string
          is_template?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
          week_days?: string[] | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          estimated_duration?: number | null
          id?: string
          is_template?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
          week_days?: string[] | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
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
      app_role: "individual" | "professional" | "admin"
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
      app_role: ["individual", "professional", "admin"],
    },
  },
} as const
