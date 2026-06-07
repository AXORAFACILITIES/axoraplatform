/**
 * Supabase database types for the Axora Facilities platform.
 *
 * Hand-written to match `supabase/migrations/001_initial_schema.sql` so the
 * typed clients compile before the project is connected. Once your Supabase
 * project is live, regenerate to keep this authoritative:
 *
 *   supabase gen types typescript --project-id <id> > lib/types/database.types.ts
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "admin" | "contractor" | "client";
export type ApplicationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "on_hold";
export type ClientType =
  | "residential"
  | "str_host"
  | "commercial"
  | "property_manager";
export type PropertyType =
  | "house"
  | "apartment"
  | "condo"
  | "commercial"
  | "airbnb"
  | "multi_unit";
export type ServiceType =
  | "standard"
  | "deep"
  | "str_turnover"
  | "move_in_out"
  | "commercial"
  | "post_construction";
export type JobStatus =
  | "pending"
  | "assigned"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "disputed";
export type InvoiceStatus =
  | "not_sent"
  | "sent"
  | "paid"
  | "overdue"
  | "disputed";
export type AssignmentStatus =
  | "offered"
  | "accepted"
  | "declined"
  | "completed"
  | "removed";
export type PayoutStatus = "pending" | "processing" | "paid";
export type QuoteStatus =
  | "new"
  | "contacted"
  | "quoted"
  | "booked"
  | "lost";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          first_name: string | null;
          last_name: string | null;
          email: string | null;
          phone: string | null;
          avatar_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      contractor_applications: {
        Row: {
          id: string;
          status: ApplicationStatus;
          submitted_at: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
          rejection_reason: string | null;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          date_of_birth: string | null;
          street_address: string | null;
          city: string | null;
          state: string | null;
          zip_code: string | null;
          referral_source: string | null;
          ec_name: string | null;
          ec_relationship: string | null;
          ec_phone: string | null;
          services_offered: string[];
          years_experience: string | null;
          has_team: boolean | null;
          team_size: number | null;
          owns_business: boolean | null;
          has_own_supplies: boolean | null;
          available_days: string[];
          earliest_start_time: string | null;
          latest_end_time: string | null;
          accepts_short_notice: string | null;
          service_areas: string[];
          has_transportation: string | null;
          work_authorized: boolean | null;
          has_drivers_license: boolean | null;
          felony_conviction: boolean | null;
          felony_explanation: string | null;
          bg_check_consent: boolean | null;
          has_own_insurance: boolean | null;
          ref1_name: string | null;
          ref1_relationship: string | null;
          ref1_phone: string | null;
          ref2_name: string | null;
          ref2_relationship: string | null;
          ref2_phone: string | null;
          digital_signature: string | null;
          signed_at: string | null;
          additional_notes: string | null;
          profile_id: string | null;
        };
        Insert: {
          id?: string;
          status?: ApplicationStatus;
          submitted_at?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          rejection_reason?: string | null;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          date_of_birth?: string | null;
          street_address?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          referral_source?: string | null;
          ec_name?: string | null;
          ec_relationship?: string | null;
          ec_phone?: string | null;
          services_offered?: string[];
          years_experience?: string | null;
          has_team?: boolean | null;
          team_size?: number | null;
          owns_business?: boolean | null;
          has_own_supplies?: boolean | null;
          available_days?: string[];
          earliest_start_time?: string | null;
          latest_end_time?: string | null;
          accepts_short_notice?: string | null;
          service_areas?: string[];
          has_transportation?: string | null;
          work_authorized?: boolean | null;
          has_drivers_license?: boolean | null;
          felony_conviction?: boolean | null;
          felony_explanation?: string | null;
          bg_check_consent?: boolean | null;
          has_own_insurance?: boolean | null;
          ref1_name?: string | null;
          ref1_relationship?: string | null;
          ref1_phone?: string | null;
          ref2_name?: string | null;
          ref2_relationship?: string | null;
          ref2_phone?: string | null;
          digital_signature?: string | null;
          signed_at?: string | null;
          additional_notes?: string | null;
          profile_id?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["contractor_applications"]["Insert"]
        >;
        Relationships: [];
      };
      contractors: {
        Row: {
          id: string;
          application_id: string | null;
          services_offered: string[];
          service_areas: string[];
          available_days: string[];
          accepts_short_notice: boolean | null;
          has_team: boolean | null;
          team_size: number | null;
          has_own_supplies: boolean | null;
          total_jobs_completed: number;
          total_earnings: number;
          rating: number | null;
          is_active: boolean;
          joined_at: string;
        };
        Insert: {
          id: string;
          application_id?: string | null;
          services_offered?: string[];
          service_areas?: string[];
          available_days?: string[];
          accepts_short_notice?: boolean | null;
          has_team?: boolean | null;
          team_size?: number | null;
          has_own_supplies?: boolean | null;
          total_jobs_completed?: number;
          total_earnings?: number;
          rating?: number | null;
          is_active?: boolean;
          joined_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["contractors"]["Insert"]
        >;
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          client_type: ClientType;
          company_name: string | null;
          billing_address: string | null;
          preferred_contact_method: string;
          notes: string | null;
          is_recurring: boolean;
          recurring_frequency: string | null;
          total_jobs: number;
          total_spent: number;
          created_at: string;
        };
        Insert: {
          id: string;
          client_type?: ClientType;
          company_name?: string | null;
          billing_address?: string | null;
          preferred_contact_method?: string;
          notes?: string | null;
          is_recurring?: boolean;
          recurring_frequency?: string | null;
          total_jobs?: number;
          total_spent?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["clients"]["Insert"]>;
        Relationships: [];
      };
      service_locations: {
        Row: {
          id: string;
          client_id: string;
          nickname: string | null;
          street_address: string | null;
          city: string | null;
          state: string | null;
          zip_code: string | null;
          property_type: PropertyType;
          bedrooms: number | null;
          bathrooms: number | null;
          square_footage: number | null;
          access_instructions: string | null;
          special_notes: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          nickname?: string | null;
          street_address?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          property_type?: PropertyType;
          bedrooms?: number | null;
          bathrooms?: number | null;
          square_footage?: number | null;
          access_instructions?: string | null;
          special_notes?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["service_locations"]["Insert"]
        >;
        Relationships: [];
      };
      jobs: {
        Row: {
          id: string;
          job_number: string | null;
          client_id: string | null;
          location_id: string | null;
          service_type: ServiceType;
          status: JobStatus;
          scheduled_date: string | null;
          scheduled_time: string | null;
          estimated_duration_hours: number | null;
          actual_start_time: string | null;
          actual_end_time: string | null;
          client_price: number | null;
          contractor_payout: number | null;
          axora_margin: number | null;
          add_ons: Json | null;
          add_ons_total: number;
          total_client_price: number | null;
          invoice_status: InvoiceStatus;
          invoice_sent_at: string | null;
          invoice_paid_at: string | null;
          relay_invoice_id: string | null;
          special_instructions: string | null;
          is_rush: boolean;
          rush_fee: number;
          checklist_type: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          job_number?: string | null;
          client_id?: string | null;
          location_id?: string | null;
          service_type: ServiceType;
          status?: JobStatus;
          scheduled_date?: string | null;
          scheduled_time?: string | null;
          estimated_duration_hours?: number | null;
          actual_start_time?: string | null;
          actual_end_time?: string | null;
          client_price?: number | null;
          contractor_payout?: number | null;
          axora_margin?: number | null;
          add_ons?: Json | null;
          add_ons_total?: number;
          total_client_price?: number | null;
          invoice_status?: InvoiceStatus;
          invoice_sent_at?: string | null;
          invoice_paid_at?: string | null;
          relay_invoice_id?: string | null;
          special_instructions?: string | null;
          is_rush?: boolean;
          rush_fee?: number;
          checklist_type?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["jobs"]["Insert"]>;
        Relationships: [];
      };
      job_assignments: {
        Row: {
          id: string;
          job_id: string;
          contractor_id: string;
          assigned_at: string;
          assigned_by: string | null;
          status: AssignmentStatus;
          accepted_at: string | null;
          completed_at: string | null;
          payout_amount: number | null;
          payout_status: PayoutStatus;
          payout_sent_at: string | null;
          contractor_notes: string | null;
        };
        Insert: {
          id?: string;
          job_id: string;
          contractor_id: string;
          assigned_at?: string;
          assigned_by?: string | null;
          status?: AssignmentStatus;
          accepted_at?: string | null;
          completed_at?: string | null;
          payout_amount?: number | null;
          payout_status?: PayoutStatus;
          payout_sent_at?: string | null;
          contractor_notes?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["job_assignments"]["Insert"]
        >;
        Relationships: [];
      };
      job_completions: {
        Row: {
          id: string;
          job_id: string;
          assignment_id: string | null;
          submitted_by: string | null;
          submitted_at: string;
          before_photos: string[];
          after_photos: string[];
          completion_notes: string | null;
          damage_reported: boolean;
          damage_description: string | null;
          damage_photos: string[] | null;
          checklist_completed: Json | null;
          client_rating: number | null;
          admin_notes: string | null;
        };
        Insert: {
          id?: string;
          job_id: string;
          assignment_id?: string | null;
          submitted_by?: string | null;
          submitted_at?: string;
          before_photos?: string[];
          after_photos?: string[];
          completion_notes?: string | null;
          damage_reported?: boolean;
          damage_description?: string | null;
          damage_photos?: string[] | null;
          checklist_completed?: Json | null;
          client_rating?: number | null;
          admin_notes?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["job_completions"]["Insert"]
        >;
        Relationships: [];
      };
      quote_requests: {
        Row: {
          id: string;
          status: QuoteStatus;
          source: string | null;
          name: string;
          email: string;
          phone: string;
          service_type: string | null;
          property_address: string | null;
          property_type: string | null;
          bedrooms: string | null;
          bathrooms: string | null;
          preferred_date: string | null;
          message: string | null;
          admin_notes: string | null;
          quoted_price: number | null;
          quoted_at: string | null;
          converted_to_job_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          status?: QuoteStatus;
          source?: string | null;
          name: string;
          email: string;
          phone: string;
          service_type?: string | null;
          property_address?: string | null;
          property_type?: string | null;
          bedrooms?: string | null;
          bathrooms?: string | null;
          preferred_date?: string | null;
          message?: string | null;
          admin_notes?: string | null;
          quoted_price?: number | null;
          quoted_at?: string | null;
          converted_to_job_id?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["quote_requests"]["Insert"]
        >;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          recipient_id: string;
          type: string;
          title: string;
          message: string;
          is_read: boolean;
          job_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipient_id: string;
          type: string;
          title: string;
          message: string;
          is_read?: boolean;
          job_id?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["notifications"]["Insert"]
        >;
        Relationships: [];
      };
      app_settings: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          key: string;
          value?: Json;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["app_settings"]["Insert"]
        >;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
      application_status: ApplicationStatus;
      client_type: ClientType;
      property_type: PropertyType;
      service_type: ServiceType;
      job_status: JobStatus;
      invoice_status: InvoiceStatus;
      assignment_status: AssignmentStatus;
      payout_status: PayoutStatus;
      quote_status: QuoteStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
