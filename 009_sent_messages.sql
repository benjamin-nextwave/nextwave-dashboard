-- Migration 009: Sent messages table for Benjamin → Merlijn communication
-- Run this in Supabase SQL Editor

CREATE TABLE sent_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('task', 'question')),
  title text NOT NULL,
  body text,
  company_name text,
  created_at timestamptz DEFAULT now()
);

-- RLS: allow authenticated users full access
ALTER TABLE sent_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read sent_messages"
  ON sent_messages FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert sent_messages"
  ON sent_messages FOR INSERT TO authenticated
  WITH CHECK (true);
