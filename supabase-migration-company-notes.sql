-- Create company_notes table
CREATE TABLE company_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('green', 'orange', 'red')) DEFAULT 'green',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index for fast lookups by company
CREATE INDEX idx_company_notes_company_id ON company_notes(company_id);

-- Enable RLS (match existing table policies)
ALTER TABLE company_notes ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anon key (matches existing pattern)
CREATE POLICY "Allow all for anon" ON company_notes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add duration_minutes to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT NULL;
