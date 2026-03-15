// TypeScript types matching the Supabase schema
// Can be replaced with auto-generated types later: npx supabase gen types typescript

export type Company = {
  id: string
  name: string
  warmup_start_date: string | null
  go_live_date: string | null
  status: 'warmup' | 'live' | 'completed' | 'paused'
  contact_person: string | null
  email: string | null
  phone: string | null
  client_notes: string | null
  personality_score: number | null
  mail_variant_1: string | null
  mail_variant_2: string | null
  mail_variant_3: string | null
  feedback_mailvarianten: string | null
  toekomstige_wensen: string | null
  extra_notes: string | null
  google_drive_url: string | null
  campagne_livegang: string | null
  rapport_date: number | null
  scrape_date_1: number | null
  scrape_date_2: number | null
  scrape_date_3: number | null
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export type Task = {
  id: string
  company_id: string
  title: string
  deadline: string
  is_completed: boolean
  is_urgent: boolean
  is_date_editable: boolean
  is_not_important: boolean
  duration_minutes: number | null
  notes: string | null
  created_at: string
}

export type Meeting = {
  id: string
  company_id: string
  title: string
  meeting_date: string
  meeting_time: string
  meeting_link: string | null
  notes: string | null
  is_completed: boolean
  created_at: string
}

export type CompanyNote = {
  id: string
  company_id: string
  content: string
  priority: 'green' | 'orange' | 'red'
  created_at: string
}

export type MailTask = {
  id: string
  company_id: string
  deadline: string
  is_completed: boolean
  completed_at: string | null
  is_auto_generated: boolean
  urgency: 1 | 2 | 3
  is_urgent: boolean
  reason: string | null
  has_been_snoozed: boolean
  created_at: string
}

export type OnboardingTask = {
  id: string
  client_id: string
  task_number: number
  task_type: string
  status: 'locked' | 'active' | 'completed'
  links: { label: string; url: string }[]
  is_optional: boolean
  parent_task_number: number | null
  iteration: number
  created_at: string
  updated_at: string
}

export type MailTaskWithCompany = MailTask & {
  company_name: string
  last_completed_at: string | null
}

export type MailTracking = {
  id: string
  company_id: string
  contact_date: string
  created_at: string
}

export type MeetingWithCompany = Meeting & {
  company_name: string
}

export type CompanyWithTasks = Company & {
  tasks: Task[]
}

// Fields that are optional on insert (nullable or have defaults)
type CompanyInsert = {
  name: string
  warmup_start_date?: string | null
  go_live_date?: string | null
  status?: Company['status']
  contact_person?: string | null
  email?: string | null
  phone?: string | null
  client_notes?: string | null
  personality_score?: number | null
  mail_variant_1?: string | null
  mail_variant_2?: string | null
  mail_variant_3?: string | null
  feedback_mailvarianten?: string | null
  toekomstige_wensen?: string | null
  extra_notes?: string | null
  google_drive_url?: string | null
  campagne_livegang?: string | null
  onboarding_completed?: boolean
  rapport_date?: number | null
  scrape_date_1?: number | null
  scrape_date_2?: number | null
  scrape_date_3?: number | null
}

// Supabase Database type for typed client
// Must include Views, Functions, and Relationships to satisfy supabase-js v2 GenericSchema
export type Database = {
  public: {
    Tables: {
      companies: {
        Row: Company
        Insert: CompanyInsert
        Update: Partial<Omit<Company, 'id' | 'created_at' | 'updated_at'>>
        Relationships: [
          {
            foreignKeyName: 'tasks_company_id_fkey'
            columns: ['id']
            isOneToOne: false
            referencedRelation: 'tasks'
            referencedColumns: ['company_id']
          },
        ]
      }
      tasks: {
        Row: Task
        Insert: Omit<Task, 'id' | 'created_at'>
        Update: Partial<Omit<Task, 'id' | 'created_at'>>
        Relationships: [
          {
            foreignKeyName: 'tasks_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
        ]
      }
      meetings: {
        Row: Meeting
        Insert: Omit<Meeting, 'id' | 'created_at'>
        Update: Partial<Omit<Meeting, 'id' | 'created_at'>>
        Relationships: [
          {
            foreignKeyName: 'meetings_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
        ]
      }
      mail_tasks: {
        Row: MailTask
        Insert: Omit<MailTask, 'id' | 'created_at'>
        Update: Partial<Omit<MailTask, 'id' | 'created_at'>>
        Relationships: [
          {
            foreignKeyName: 'mail_tasks_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
        ]
      }
      company_notes: {
        Row: CompanyNote
        Insert: Omit<CompanyNote, 'id' | 'created_at'>
        Update: Partial<Omit<CompanyNote, 'id' | 'created_at'>>
        Relationships: [
          {
            foreignKeyName: 'company_notes_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
        ]
      }
      mail_tracking: {
        Row: MailTracking
        Insert: Omit<MailTracking, 'id' | 'created_at'>
        Update: Partial<Omit<MailTracking, 'id' | 'created_at'>>
        Relationships: [
          {
            foreignKeyName: 'mail_tracking_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
        ]
      }
      onboarding_tasks: {
        Row: OnboardingTask
        Insert: Omit<OnboardingTask, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<OnboardingTask, 'id' | 'created_at' | 'updated_at'>>
        Relationships: [
          {
            foreignKeyName: 'onboarding_tasks_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}
