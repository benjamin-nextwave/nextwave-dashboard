-- Migration: Add onboarding system
-- Run this in Supabase SQL Editor

-- 1. Add onboarding_completed to clients/companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- 2. Create onboarding_tasks table
CREATE TABLE IF NOT EXISTS onboarding_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  task_number int NOT NULL,
  task_type text NOT NULL,
  status text NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'active', 'completed')),
  links jsonb DEFAULT '[]'::jsonb,
  is_optional boolean DEFAULT false,
  parent_task_number int,
  iteration int DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_onboarding_tasks_client_id ON onboarding_tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_tasks_status ON onboarding_tasks(status);

-- 4. Enable RLS (Row Level Security) - permissive for now
ALTER TABLE onboarding_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to onboarding_tasks" ON onboarding_tasks
  FOR ALL USING (true) WITH CHECK (true);
