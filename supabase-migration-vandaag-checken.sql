-- Migratie: "Vandaag checken" en "Bedrijven overzicht" features
-- Voegt baseline-status en to-do-selectie toe aan companies,
-- notitie-negeren aan company_notes, en creëert company_mail_logs.

-- 1. Baseline-status per klant
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS daily_baseline TEXT NOT NULL DEFAULT 'daily'
  CHECK (daily_baseline IN ('daily', 'friday'));

-- 2. To-do datum: klant zit in de To do-tab als todo_date = vandaag
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS todo_date DATE DEFAULT NULL;

-- 3. Notitie-negeren: timestamp is null als de notitie actief is
ALTER TABLE company_notes
  ADD COLUMN IF NOT EXISTS ignored_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_company_notes_ignored_at ON company_notes(ignored_at);

-- 4. Mail-log per klant (handmatig in te voeren)
CREATE TABLE IF NOT EXISTS company_mail_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('in', 'out')),
  subject TEXT NOT NULL,
  body TEXT,
  interaction_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_company_mail_logs_company_id ON company_mail_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_company_mail_logs_interaction_date ON company_mail_logs(interaction_date DESC);

ALTER TABLE company_mail_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for anon" ON company_mail_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);
