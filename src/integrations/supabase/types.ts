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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json
          id: string
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      deposits: {
        Row: {
          asset: string
          confirmations: number
          confirmed_at: string | null
          created_at: string
          destination_address: string
          expected_amount: number
          expires_at: string
          id: string
          network: string
          network_id: string
          received_amount: number | null
          reference: string
          reject_reason: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["deposit_status"]
          tx_hash: string | null
          usd_value: number | null
          user_id: string
        }
        Insert: {
          asset: string
          confirmations?: number
          confirmed_at?: string | null
          created_at?: string
          destination_address: string
          expected_amount: number
          expires_at?: string
          id?: string
          network: string
          network_id: string
          received_amount?: number | null
          reference: string
          reject_reason?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["deposit_status"]
          tx_hash?: string | null
          usd_value?: number | null
          user_id: string
        }
        Update: {
          asset?: string
          confirmations?: number
          confirmed_at?: string | null
          created_at?: string
          destination_address?: string
          expected_amount?: number
          expires_at?: string
          id?: string
          network?: string
          network_id?: string
          received_amount?: number | null
          reference?: string
          reject_reason?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["deposit_status"]
          tx_hash?: string | null
          usd_value?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deposits_network_id_fkey"
            columns: ["network_id"]
            isOneToOne: false
            referencedRelation: "supported_networks"
            referencedColumns: ["id"]
          },
        ]
      }
      ledger_entries: {
        Row: {
          amount_usd: number
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["ledger_kind"]
          note: string | null
          ref_id: string
          ref_type: string
          user_id: string
        }
        Insert: {
          amount_usd: number
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["ledger_kind"]
          note?: string | null
          ref_id: string
          ref_type: string
          user_id: string
        }
        Update: {
          amount_usd?: number
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["ledger_kind"]
          note?: string | null
          ref_id?: string
          ref_type?: string
          user_id?: string
        }
        Relationships: []
      }
      mining_equipment: {
        Row: {
          created_at: string
          hashrate_ths: number | null
          id: string
          location: string | null
          model: string
          notes: string | null
          power_watts: number | null
          serial_number: string | null
          status: string
        }
        Insert: {
          created_at?: string
          hashrate_ths?: number | null
          id?: string
          location?: string | null
          model: string
          notes?: string | null
          power_watts?: number | null
          serial_number?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          hashrate_ths?: number | null
          id?: string
          location?: string | null
          model?: string
          notes?: string | null
          power_watts?: number | null
          serial_number?: string | null
          status?: string
        }
        Relationships: []
      }
      mining_expenses: {
        Row: {
          amount_usd: number
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          incurred_on: string
          report_id: string | null
        }
        Insert: {
          amount_usd: number
          category: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          incurred_on: string
          report_id?: string | null
        }
        Update: {
          amount_usd?: number
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          incurred_on?: string
          report_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mining_expenses_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "mining_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      mining_reports: {
        Row: {
          avg_hashrate_ths: number | null
          btc_mined: number
          btc_usd_price: number | null
          created_at: string
          created_by: string | null
          id: string
          period_end: string
          period_start: string
          pool_fees_btc: number
          pool_name: string | null
          price_timestamp: string | null
          published: boolean
          source: string
          uptime_pct: number | null
        }
        Insert: {
          avg_hashrate_ths?: number | null
          btc_mined?: number
          btc_usd_price?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          period_end: string
          period_start: string
          pool_fees_btc?: number
          pool_name?: string | null
          price_timestamp?: string | null
          published?: boolean
          source?: string
          uptime_pct?: number | null
        }
        Update: {
          avg_hashrate_ths?: number | null
          btc_mined?: number
          btc_usd_price?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          period_end?: string
          period_start?: string
          pool_fees_btc?: number
          pool_name?: string | null
          price_timestamp?: string | null
          published?: boolean
          source?: string
          uptime_pct?: number | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      processed_chain_events: {
        Row: {
          event_id: string
          id: string
          provider: string
          received_at: string
        }
        Insert: {
          event_id: string
          id?: string
          provider: string
          received_at?: string
        }
        Update: {
          event_id?: string
          id?: string
          provider?: string
          received_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_status: string
          created_at: string
          email: string | null
          full_name: string
          id: string
          referral_code: string
          referred_by: string | null
          verification_status: string
        }
        Insert: {
          account_status?: string
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          referral_code: string
          referred_by?: string | null
          verification_status?: string
        }
        Update: {
          account_status?: string
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          referral_code?: string
          referred_by?: string | null
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_commissions: {
        Row: {
          amount_usd: number
          basis_usd: number
          created_at: string
          id: string
          rate: number
          referred_id: string
          referrer_id: string
          reviewed_by: string | null
          source_deposit_id: string
          status: Database["public"]["Enums"]["commission_status"]
          updated_at: string
        }
        Insert: {
          amount_usd: number
          basis_usd: number
          created_at?: string
          id?: string
          rate: number
          referred_id: string
          referrer_id: string
          reviewed_by?: string | null
          source_deposit_id: string
          status?: Database["public"]["Enums"]["commission_status"]
          updated_at?: string
        }
        Update: {
          amount_usd?: number
          basis_usd?: number
          created_at?: string
          id?: string
          rate?: number
          referred_id?: string
          referrer_id?: string
          reviewed_by?: string | null
          source_deposit_id?: string
          status?: Database["public"]["Enums"]["commission_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_commissions_source_deposit_id_fkey"
            columns: ["source_deposit_id"]
            isOneToOne: true
            referencedRelation: "deposits"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_distributions: {
        Row: {
          amount_usd: number
          created_at: string
          created_by: string | null
          id: string
          report_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount_usd: number
          created_at?: string
          created_by?: string | null
          id?: string
          report_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount_usd?: number
          created_at?: string
          created_by?: string | null
          id?: string
          report_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "revenue_distributions_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "mining_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          brand_name: string
          calculator_monthly_rate: number
          deposits_enabled: boolean
          eligibility_notes: string
          environment_label: string
          id: number
          min_investment_usd: number
          payment_provider: string
          payment_provider_configured: boolean
          referral_rate: number
          supported_jurisdictions: string
          updated_at: string
          withdrawals_enabled: boolean
        }
        Insert: {
          brand_name?: string
          calculator_monthly_rate?: number
          deposits_enabled?: boolean
          eligibility_notes?: string
          environment_label?: string
          id?: number
          min_investment_usd?: number
          payment_provider?: string
          payment_provider_configured?: boolean
          referral_rate?: number
          supported_jurisdictions?: string
          updated_at?: string
          withdrawals_enabled?: boolean
        }
        Update: {
          brand_name?: string
          calculator_monthly_rate?: number
          deposits_enabled?: boolean
          eligibility_notes?: string
          environment_label?: string
          id?: number
          min_investment_usd?: number
          payment_provider?: string
          payment_provider_configured?: boolean
          referral_rate?: number
          supported_jurisdictions?: string
          updated_at?: string
          withdrawals_enabled?: boolean
        }
        Relationships: []
      }
      supported_networks: {
        Row: {
          asset: string
          created_at: string
          decimals: number
          deposit_address: string | null
          enabled: boolean
          id: string
          label: string
          min_deposit: number
          min_withdrawal: number
          network: string
          required_confirmations: number
          verified: boolean
          withdrawal_fee: number
        }
        Insert: {
          asset: string
          created_at?: string
          decimals: number
          deposit_address?: string | null
          enabled?: boolean
          id?: string
          label: string
          min_deposit?: number
          min_withdrawal?: number
          network: string
          required_confirmations?: number
          verified?: boolean
          withdrawal_fee?: number
        }
        Update: {
          asset?: string
          created_at?: string
          decimals?: number
          deposit_address?: string | null
          enabled?: boolean
          id?: string
          label?: string
          min_deposit?: number
          min_withdrawal?: number
          network?: string
          required_confirmations?: number
          verified?: boolean
          withdrawal_fee?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          amount_usd: number
          asset: string
          client_request_id: string
          created_at: string
          destination_address: string
          fee_usd: number
          id: string
          network: string
          network_id: string
          reject_reason: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["withdrawal_status"]
          tx_hash: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_usd: number
          asset: string
          client_request_id: string
          created_at?: string
          destination_address: string
          fee_usd?: number
          id?: string
          network: string
          network_id: string
          reject_reason?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"]
          tx_hash?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_usd?: number
          asset?: string
          client_request_id?: string
          created_at?: string
          destination_address?: string
          fee_usd?: number
          id?: string
          network?: string
          network_id?: string
          reject_reason?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"]
          tx_hash?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawals_network_id_fkey"
            columns: ["network_id"]
            isOneToOne: false
            referencedRelation: "supported_networks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_confirm_deposit: {
        Args: {
          _deposit_id: string
          _received: number
          _tx_hash: string
          _usd_value: number
        }
        Returns: undefined
      }
      admin_record_distribution: {
        Args: { _amount: number; _report_id: string; _user_id: string }
        Returns: undefined
      }
      admin_reject_deposit: {
        Args: { _deposit_id: string; _reason: string }
        Returns: undefined
      }
      admin_set_account_status: {
        Args: { _account: string; _user_id: string; _verification: string }
        Returns: undefined
      }
      admin_set_commission_status: {
        Args: {
          _id: string
          _status: Database["public"]["Enums"]["commission_status"]
        }
        Returns: undefined
      }
      admin_update_network: {
        Args: { _id: string; _patch: Json }
        Returns: undefined
      }
      admin_update_settings: { Args: { _patch: Json }; Returns: undefined }
      admin_update_withdrawal: {
        Args: {
          _id: string
          _reason: string
          _status: Database["public"]["Enums"]["withdrawal_status"]
          _tx_hash: string
        }
        Returns: undefined
      }
      create_deposit: {
        Args: { _amount: number; _network_id: string }
        Returns: {
          asset: string
          confirmations: number
          confirmed_at: string | null
          created_at: string
          destination_address: string
          expected_amount: number
          expires_at: string
          id: string
          network: string
          network_id: string
          received_amount: number | null
          reference: string
          reject_reason: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["deposit_status"]
          tx_hash: string | null
          usd_value: number | null
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "deposits"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      my_referral_stats: { Args: never; Returns: Json }
      my_summary: { Args: never; Returns: Json }
      request_withdrawal: {
        Args: {
          _address: string
          _amount: number
          _client_request_id: string
          _network_id: string
        }
        Returns: {
          amount_usd: number
          asset: string
          client_request_id: string
          created_at: string
          destination_address: string
          fee_usd: number
          id: string
          network: string
          network_id: string
          reject_reason: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["withdrawal_status"]
          tx_hash: string | null
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "withdrawals"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      user_available_balance: { Args: { _uid: string }; Returns: number }
      write_audit: {
        Args: { _action: string; _details: Json; _tid: string; _ttype: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
      commission_status: "pending" | "approved" | "paid" | "reversed"
      deposit_status:
        | "created"
        | "awaiting_payment"
        | "detected"
        | "confirming"
        | "confirmed"
        | "rejected"
        | "expired"
      ledger_kind:
        | "deposit"
        | "withdrawal_reserve"
        | "withdrawal_release"
        | "distribution"
        | "commission"
        | "adjustment"
      withdrawal_status:
        | "requested"
        | "approved"
        | "broadcast"
        | "completed"
        | "rejected"
        | "cancelled"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "user"],
      commission_status: ["pending", "approved", "paid", "reversed"],
      deposit_status: [
        "created",
        "awaiting_payment",
        "detected",
        "confirming",
        "confirmed",
        "rejected",
        "expired",
      ],
      ledger_kind: [
        "deposit",
        "withdrawal_reserve",
        "withdrawal_release",
        "distribution",
        "commission",
        "adjustment",
      ],
      withdrawal_status: [
        "requested",
        "approved",
        "broadcast",
        "completed",
        "rejected",
        "cancelled",
      ],
    },
  },
} as const
