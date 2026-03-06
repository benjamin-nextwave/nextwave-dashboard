-- Create mail_tasks table
CREATE TABLE mail_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  deadline DATE NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ DEFAULT NULL,
  is_auto_generated BOOLEAN NOT NULL DEFAULT false,
  urgency INTEGER NOT NULL DEFAULT 2 CHECK (urgency IN (1, 2, 3)),
  has_been_snoozed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_mail_tasks_company_id ON mail_tasks(company_id);
CREATE INDEX idx_mail_tasks_deadline ON mail_tasks(deadline);
CREATE INDEX idx_mail_tasks_incomplete ON mail_tasks(is_completed, deadline) WHERE is_completed = false;

-- Enable RLS
ALTER TABLE mail_tasks ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anon key (matches existing pattern)
CREATE POLICY "Allow all for anon" ON mail_tasks
  FOR ALL
  USING (true)
  WITH CHECK (true);
