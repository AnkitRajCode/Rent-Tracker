export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      properties: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          house_no: string | null;
          address_line: string | null;
          city: string | null;
          state: string | null;
          pin_code: string | null;
          landmark: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          house_no?: string | null;
          address_line?: string | null;
          city?: string | null;
          state?: string | null;
          pin_code?: string | null;
          landmark?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          house_no?: string | null;
          address_line?: string | null;
          city?: string | null;
          state?: string | null;
          pin_code?: string | null;
          landmark?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "properties_owner_id_fkey";
            columns: ["owner_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      houses: {
        Row: {
          id: string;
          property_id: string;
          owner_id: string;
          house_number: string;
          floor: string | null;
          type: string | null;
          rent_amount: number;
          security_deposit: number;
          status: "occupied" | "vacant";
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          owner_id: string;
          house_number: string;
          floor?: string | null;
          type?: string | null;
          rent_amount: number;
          security_deposit?: number;
          status?: "occupied" | "vacant";
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          owner_id?: string;
          house_number?: string;
          floor?: string | null;
          type?: string | null;
          rent_amount?: number;
          security_deposit?: number;
          status?: "occupied" | "vacant";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "houses_property_id_fkey";
            columns: ["property_id"];
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "houses_owner_id_fkey";
            columns: ["owner_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      tenants: {
        Row: {
          id: string;
          house_id: string;
          owner_id: string;
          name: string;
          phone: string;
          aadhaar: string | null;
          move_in_date: string;
          rent_due_day: number;
          email: string | null;
          can_login: boolean;
          agreement_url: string | null;
          deposit_refund_amount: number | null;
          deposit_refund_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          house_id: string;
          owner_id: string;
          name: string;
          phone: string;
          aadhaar?: string | null;
          move_in_date: string;
          rent_due_day?: number;
          email?: string | null;
          can_login?: boolean;
          agreement_url?: string | null;
          deposit_refund_amount?: number | null;
          deposit_refund_published?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          house_id?: string;
          owner_id?: string;
          name?: string;
          phone?: string;
          aadhaar?: string | null;
          move_in_date?: string;
          rent_due_day?: number;
          email?: string | null;
          can_login?: boolean;
          agreement_url?: string | null;
          deposit_refund_amount?: number | null;
          deposit_refund_published?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tenants_house_id_fkey";
            columns: ["house_id"];
            referencedRelation: "houses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tenants_owner_id_fkey";
            columns: ["owner_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      tenant_members: {
        Row: {
          id: string;
          tenant_id: string;
          owner_id: string;
          name: string;
          phone: string | null;
          email: string | null;
          aadhaar_number: string | null;
          aadhaar_doc_url: string | null;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          owner_id: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          aadhaar_number?: string | null;
          aadhaar_doc_url?: string | null;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          owner_id?: string;
          name?: string;
          phone?: string | null;
          email?: string | null;
          aadhaar_number?: string | null;
          aadhaar_doc_url?: string | null;
          is_primary?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tenant_members_tenant_id_fkey";
            columns: ["tenant_id"];
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tenant_members_owner_id_fkey";
            columns: ["owner_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      tenant_history: {
        Row: {
          id: string;
          house_id: string;
          owner_id: string;
          name: string;
          phone: string;
          aadhaar: string | null;
          move_in_date: string;
          move_out_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          house_id: string;
          owner_id: string;
          name: string;
          phone: string;
          aadhaar?: string | null;
          move_in_date: string;
          move_out_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          house_id?: string;
          owner_id?: string;
          name?: string;
          phone?: string;
          aadhaar?: string | null;
          move_in_date?: string;
          move_out_date?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tenant_history_house_id_fkey";
            columns: ["house_id"];
            referencedRelation: "houses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tenant_history_owner_id_fkey";
            columns: ["owner_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      rent_records: {
        Row: {
          id: string;
          house_id: string;
          tenant_id: string;
          owner_id: string;
          month: number;
          year: number;
          amount_due: number;
          electricity_bill: number;
          maintenance: number;
          amount_paid: number;
          status: "paid" | "pending" | "partial";
          payment_mode: "cash" | "upi" | "bank_transfer" | null;
          paid_on: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          house_id: string;
          tenant_id: string;
          owner_id: string;
          month: number;
          year: number;
          amount_due: number;
          electricity_bill?: number;
          maintenance?: number;
          amount_paid?: number;
          status?: "paid" | "pending" | "partial";
          payment_mode?: "cash" | "upi" | "bank_transfer" | null;
          paid_on?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          house_id?: string;
          tenant_id?: string;
          owner_id?: string;
          month?: number;
          year?: number;
          amount_due?: number;
          electricity_bill?: number;
          maintenance?: number;
          amount_paid?: number;
          status?: "paid" | "pending" | "partial";
          payment_mode?: "cash" | "upi" | "bank_transfer" | null;
          paid_on?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "rent_records_house_id_fkey";
            columns: ["house_id"];
            referencedRelation: "houses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "rent_records_tenant_id_fkey";
            columns: ["tenant_id"];
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "rent_records_owner_id_fkey";
            columns: ["owner_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      documents: {
        Row: {
          id: string;
          owner_id: string;
          house_id: string | null;
          tenant_id: string | null;
          name: string;
          url: string;
          is_public: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          house_id?: string | null;
          tenant_id?: string | null;
          name: string;
          url: string;
          is_public?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          house_id?: string | null;
          tenant_id?: string | null;
          name?: string;
          url?: string;
          is_public?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "documents_owner_id_fkey";
            columns: ["owner_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
  };
}

// Convenience row types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Property = Database["public"]["Tables"]["properties"]["Row"];
export type House = Database["public"]["Tables"]["houses"]["Row"];
export type Tenant = Database["public"]["Tables"]["tenants"]["Row"];
export type TenantHistory =
  Database["public"]["Tables"]["tenant_history"]["Row"];
export type RentRecord = Database["public"]["Tables"]["rent_records"]["Row"];
export type Document = Database["public"]["Tables"]["documents"]["Row"];
export type TenantMember = Database["public"]["Tables"]["tenant_members"]["Row"];
