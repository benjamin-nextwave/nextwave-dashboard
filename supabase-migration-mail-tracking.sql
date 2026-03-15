-- Mail tracking: simple per-company per-day tracking
-- Used by the mailing Gantt view to track which companies were contacted on which days
CREATE TABLE IF NOT EXISTS mail_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  contact_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, contact_date)
);

CREATE INDEX idx_mail_tracking_company_id ON mail_tracking(company_id);
CREATE INDEX idx_mail_tracking_contact_date ON mail_tracking(contact_date);
