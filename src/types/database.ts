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

export type CompanyWithTasks = Company & {
  tasks: Task[]
}

// Supabase Database type for typed client
export type Database = {
  public: {
    Tables: {
      companies: {
        Row: Company
        Insert: Omit<Company, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Company, 'id' | 'created_at' | 'updated_at'>>
      }
      tasks: {
        Row: Task
        Insert: Omit<Task, 'id' | 'created_at'>
        Update: Partial<Omit<Task, 'id' | 'created_at'>>
      }
    }
  }
}
