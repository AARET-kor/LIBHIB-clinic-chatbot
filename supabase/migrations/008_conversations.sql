-- ── 008_conversations.sql ────────────────────────────────────────────────────
-- Conversations + Messages tables for multi-tenant clinic chatbot

-- conversations
CREATE TABLE IF NOT EXISTS conversations (
  id            TEXT PRIMARY KEY,
  clinic_id     TEXT NOT NULL,
  patient       JSONB NOT NULL DEFAULT '{}',
  channel       TEXT,
  procedure     TEXT,
  procedure_name TEXT,
  status        TEXT DEFAULT 'unread',
  unread_count  INT  DEFAULT 0,
  preview       TEXT,
  timeline      JSONB DEFAULT '[]',
  gallery       JSONB DEFAULT '[]',
  notes         TEXT,
  aftercare_summary JSONB,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS conversations_clinic_id_idx ON conversations(clinic_id);
CREATE INDEX IF NOT EXISTS conversations_updated_at_idx ON conversations(updated_at DESC);

-- messages
CREATE TABLE IF NOT EXISTS messages (
  id              TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  clinic_id       TEXT NOT NULL,
  from_role       TEXT NOT NULL CHECK (from_role IN ('patient','staff')),
  original_text   TEXT,
  translated_text TEXT,
  time            TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx      ON messages(created_at);

-- RLS: service role has full access; authenticated users can read their clinic's rows
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages      ENABLE ROW LEVEL SECURITY;

-- Service role bypass (used by server.js via getSbAdmin)
CREATE POLICY conversations_service_all ON conversations FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY messages_service_all ON messages FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS conversations_updated_at ON conversations;
CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
