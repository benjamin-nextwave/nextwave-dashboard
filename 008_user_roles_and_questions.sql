-- Migration 008: User roles + Questions table + assigned_to on tasks
-- Run this in Supabase SQL Editor

-- 1. User roles table for role-based access
CREATE TABLE user_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('merlijn', 'benjamin'))
);

-- RLS: users can read their own role
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own role"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- 2. Questions table for Merlijn → Benjamin communication
CREATE TABLE questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  answer text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'answered')),
  created_at timestamptz NOT NULL DEFAULT now(),
  answered_at timestamptz
);

-- RLS: allow authenticated users full access
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read questions"
  ON questions FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert questions"
  ON questions FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update questions"
  ON questions FOR UPDATE TO authenticated
  USING (true);

-- Index for filtering by status
CREATE INDEX idx_questions_status ON questions(status);
CREATE INDEX idx_questions_company_id ON questions(company_id);

-- 3. Add assigned_to column to tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_to text;

-- ============================================================
-- INSTRUCTIES NA HET UITVOEREN VAN DEZE MIGRATIE:
-- ============================================================
--
-- 1. Ga naar Supabase Dashboard → Authentication → Users → Add user
--    - Email: benjamin@nextwave-solutions.nl
--    - Wachtwoord: [kies een sterk wachtwoord]
--    - Klik "Create user"
--
-- 2. Kopieer de UUID van Benjamin's nieuwe gebruiker
--
-- 3. Kopieer ook de UUID van Merlijn's bestaande gebruiker
--    (of maak een account aan voor Merlijn als dat nog niet bestaat)
--
-- 4. Voer dit SQL uit met de juiste UUID's:
--
--    INSERT INTO user_roles (user_id, role) VALUES
--      ('<merlijn-user-id>', 'merlijn'),
--      ('<benjamin-user-id>', 'benjamin');
--
-- ============================================================
