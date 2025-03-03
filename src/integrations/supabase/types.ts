export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      api_metrics: {
        Row: {
          duration_ms: number
          endpoint: string
          id: string
          method: string
          request_params: Json | null
          request_size: number | null
          response_size: number | null
          response_summary: Json | null
          status_code: number | null
          timestamp: string
          user_id: string | null
        }
        Insert: {
          duration_ms: number
          endpoint: string
          id?: string
          method: string
          request_params?: Json | null
          request_size?: number | null
          response_size?: number | null
          response_summary?: Json | null
          status_code?: number | null
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          duration_ms?: number
          endpoint?: string
          id?: string
          method?: string
          request_params?: Json | null
          request_size?: number | null
          response_size?: number | null
          response_summary?: Json | null
          status_code?: number | null
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          component: string | null
          created_at: string
          duration_ms: number | null
          id: string
          ip_address: string | null
          metadata: Json | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          success: boolean | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          component?: string | null
          created_at?: string
          duration_ms?: number | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          success?: boolean | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          component?: string | null
          created_at?: string
          duration_ms?: number | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          success?: boolean | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      cache_entries: {
        Row: {
          cache_key: string
          cache_value: Json
          created_at: string | null
          expires_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          cache_key: string
          cache_value: Json
          created_at?: string | null
          expires_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          cache_key?: string
          cache_value?: Json
          created_at?: string | null
          expires_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      calculated_columns: {
        Row: {
          category_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          formula: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          formula: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          formula?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calculated_columns_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          region_id: string | null
          school_id: string | null
          school_type_id: string | null
          sector_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          region_id?: string | null
          school_id?: string | null
          school_type_id?: string | null
          sector_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          region_id?: string | null
          school_id?: string | null
          school_type_id?: string | null
          sector_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_school_type_id_fkey"
            columns: ["school_type_id"]
            isOneToOne: false
            referencedRelation: "school_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      columns: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          options: Json | null
          required: boolean | null
          type: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          options?: Json | null
          required?: boolean | null
          type: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          options?: Json | null
          required?: boolean | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "columns_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      data: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          category_id: string | null
          created_at: string
          created_by: string | null
          data: Json
          id: string
          school_id: string | null
          status: string
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          data?: Json
          id?: string
          school_id?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          data?: Json
          id?: string
          school_id?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      data_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          data: Json
          data_id: string | null
          id: string
          status: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          data: Json
          data_id?: string | null
          id?: string
          status: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          data?: Json
          data_id?: string | null
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_history_data_id_fkey"
            columns: ["data_id"]
            isOneToOne: false
            referencedRelation: "data"
            referencedColumns: ["id"]
          },
        ]
      }
      error_logs: {
        Row: {
          browser_info: Json | null
          component: string | null
          error_context: Json | null
          error_message: string
          error_stack: string | null
          id: string
          page_path: string | null
          resolution_notes: string | null
          resolved: boolean | null
          severity: string
          timestamp: string
          user_id: string | null
        }
        Insert: {
          browser_info?: Json | null
          component?: string | null
          error_context?: Json | null
          error_message: string
          error_stack?: string | null
          id?: string
          page_path?: string | null
          resolution_notes?: string | null
          resolved?: boolean | null
          severity: string
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          browser_info?: Json | null
          component?: string | null
          error_context?: Json | null
          error_message?: string
          error_stack?: string | null
          id?: string
          page_path?: string | null
          resolution_notes?: string | null
          resolved?: boolean | null
          severity?: string
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      form_entry_versions: {
        Row: {
          created_at: string | null
          created_by: string | null
          data: Json
          form_entry_id: string
          id: string
          table_version_id: string | null
          version_number: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          data: Json
          form_entry_id: string
          id?: string
          table_version_id?: string | null
          version_number: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          data?: Json
          form_entry_id?: string
          id?: string
          table_version_id?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_form_entry_versions_table_version_id"
            columns: ["table_version_id"]
            isOneToOne: false
            referencedRelation: "table_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_entry_versions_table_version_id_fkey"
            columns: ["table_version_id"]
            isOneToOne: false
            referencedRelation: "table_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      mass_notification_recipients: {
        Row: {
          created_at: string | null
          id: string
          notification_id: string | null
          read_at: string | null
          recipient_id: string
          recipient_type: string
          sent_at: string | null
          status: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notification_id?: string | null
          read_at?: string | null
          recipient_id: string
          recipient_type: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notification_id?: string | null
          read_at?: string | null
          recipient_id?: string
          recipient_type?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "mass_notification_recipients_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "mass_notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      mass_notifications: {
        Row: {
          created_at: string | null
          created_by: string | null
          delivery_status: string
          id: string
          message: string
          notification_type: string
          sent_count: number | null
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          delivery_status?: string
          id?: string
          message: string
          notification_type: string
          sent_count?: number | null
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          delivery_status?: string
          id?: string
          message?: string
          notification_type?: string
          sent_count?: number | null
          title?: string
        }
        Relationships: []
      }
      monitoring_metrics: {
        Row: {
          component: string | null
          id: string
          metric_name: string
          metric_type: string
          metric_value: number
          tags: Json | null
          timestamp: string
        }
        Insert: {
          component?: string | null
          id?: string
          metric_name: string
          metric_type: string
          metric_value: number
          tags?: Json | null
          timestamp?: string
        }
        Update: {
          component?: string | null
          id?: string
          metric_name?: string
          metric_type?: string
          metric_value?: number
          tags?: Json | null
          timestamp?: string
        }
        Relationships: []
      }
      notification_group_members: {
        Row: {
          created_at: string | null
          group_id: string | null
          id: string
          member_id: string
          member_type: string
        }
        Insert: {
          created_at?: string | null
          group_id?: string | null
          id?: string
          member_id: string
          member_type: string
        }
        Update: {
          created_at?: string | null
          group_id?: string | null
          id?: string
          member_id?: string
          member_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "notification_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_groups: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      password_resets: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          cls_score: number | null
          device_info: Json | null
          fid_ms: number | null
          id: string
          lcp_ms: number | null
          load_time_ms: number
          network_info: Json | null
          page_path: string
          timestamp: string
          ttfb_ms: number | null
          user_id: string | null
        }
        Insert: {
          cls_score?: number | null
          device_info?: Json | null
          fid_ms?: number | null
          id?: string
          lcp_ms?: number | null
          load_time_ms: number
          network_info?: Json | null
          page_path: string
          timestamp?: string
          ttfb_ms?: number | null
          user_id?: string | null
        }
        Update: {
          cls_score?: number | null
          device_info?: Json | null
          fid_ms?: number | null
          id?: string
          lcp_ms?: number | null
          load_time_ms?: number
          network_info?: Json | null
          page_path?: string
          timestamp?: string
          ttfb_ms?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          first_name: string
          id: string
          last_name: string
          region_id: string | null
          role: string
          school_id: string | null
          sector_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          first_name: string
          id?: string
          last_name: string
          region_id?: string | null
          role: string
          school_id?: string | null
          sector_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          first_name?: string
          id?: string
          last_name?: string
          region_id?: string | null
          role?: string
          school_id?: string | null
          sector_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      regions: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      reminder_recipients: {
        Row: {
          created_at: string | null
          id: string
          recipient_id: string
          recipient_type: string
          reminder_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          recipient_id: string
          recipient_type: string
          reminder_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          recipient_id?: string
          recipient_type?: string
          reminder_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reminder_recipients_reminder_id_fkey"
            columns: ["reminder_id"]
            isOneToOne: false
            referencedRelation: "reminders"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          created_at: string | null
          created_by: string | null
          days_offset: number | null
          entity_id: string
          entity_type: string
          id: string
          is_active: boolean | null
          message: string
          recurring_pattern: Json | null
          reminder_type: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          days_offset?: number | null
          entity_id: string
          entity_type: string
          id?: string
          is_active?: boolean | null
          message: string
          recurring_pattern?: Json | null
          reminder_type: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          days_offset?: number | null
          entity_id?: string
          entity_type?: string
          id?: string
          is_active?: boolean | null
          message?: string
          recurring_pattern?: Json | null
          reminder_type?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      schema_definitions: {
        Row: {
          category_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          schema_json: Json
          updated_at: string
          version: number
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          schema_json: Json
          updated_at?: string
          version?: number
        }
        Update: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          schema_json?: Json
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "schema_definitions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      school_types: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      schools: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          sector_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          sector_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          sector_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schools_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      sectors: {
        Row: {
          created_at: string | null
          id: string
          name: string
          region_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          region_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          region_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sectors_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      table_versions: {
        Row: {
          created_at: string | null
          created_by: string | null
          ended_at: string | null
          id: string
          is_active: boolean | null
          schema: Json
          started_at: string | null
          table_id: string
          version_number: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          schema: Json
          started_at?: string | null
          table_id: string
          version_number: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          schema?: Json
          started_at?: string | null
          table_id?: string
          version_number?: number
        }
        Relationships: []
      }
      templates: {
        Row: {
          content: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          region_id: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          content: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          region_id?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          region_id?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "templates_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      validation_errors: {
        Row: {
          component_name: string
          context: Json | null
          error_message: string
          field_name: string
          form_id: string | null
          id: string
          input_value: Json | null
          timestamp: string
          user_id: string | null
          validation_rule: string | null
        }
        Insert: {
          component_name: string
          context?: Json | null
          error_message: string
          field_name: string
          form_id?: string | null
          id?: string
          input_value?: Json | null
          timestamp?: string
          user_id?: string | null
          validation_rule?: string | null
        }
        Update: {
          component_name?: string
          context?: Json | null
          error_message?: string
          field_name?: string
          form_id?: string | null
          id?: string
          input_value?: Json | null
          timestamp?: string
          user_id?: string | null
          validation_rule?: string | null
        }
        Relationships: []
      }
      validation_rules: {
        Row: {
          category_id: string | null
          condition: string
          created_at: string
          created_by: string | null
          description: string | null
          expression: string | null
          id: string
          message: string
          name: string
          roles: string[] | null
          source_field: string | null
          target_field: string
          type: string
          updated_at: string
          validation_fn: string | null
          value: Json | null
        }
        Insert: {
          category_id?: string | null
          condition: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          expression?: string | null
          id?: string
          message: string
          name: string
          roles?: string[] | null
          source_field?: string | null
          target_field: string
          type: string
          updated_at?: string
          validation_fn?: string | null
          value?: Json | null
        }
        Update: {
          category_id?: string | null
          condition?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          expression?: string | null
          id?: string
          message?: string
          name?: string
          roles?: string[] | null
          source_field?: string | null
          target_field?: string
          type?: string
          updated_at?: string
          validation_fn?: string | null
          value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "validation_rules_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
