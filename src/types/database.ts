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
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}
