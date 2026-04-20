-- ============================================================
-- 022_clinic_users.sql
-- ============================================================
-- PURPOSE
--   Create the clinic_users table: the explicit staff↔clinic
--   mapping that currently lives only in JWT app_metadata.
--
--   This table does NOT replace JWT-based auth. It runs in
--   parallel with the existing auth.users.app_metadata pattern.
--   Staff can still log in exactly as before. This table adds:
--     • Queryable roster ("who are the staff of clinic X?")
--     • Multi-clinic support groundwork (one user → many clinics)
--     • Deactivation without touching Supabase Auth UI
--     • Audit trail for invitations and role changes
--
-- RISK LEVEL: ZERO
--   Entirely new table. Nothing existing is modified.
--   The existing login flow and JWT auth are unchanged.
--
-- ROLLBACK
--   DROP TABLE IF EXISTS clinic_users;
--   (No other tables reference it via FK at this stage.)
--
-- BACKFILL NOTE
--   A backfill from auth.users is intentionally NOT included
--   here. Backfilling from auth.users requires service_role
--   access to the auth schema and is environment-specific.
--
--   To backfill manually after applying this migration, run
--   the query provided in Section 3. It uses the Supabase
--   admin API pattern (must be run with service_role access).
--
-- RELATIONSHIP TO MIGRATION 006
--   Migration 006 added the `handle_new_clinic_signup` trigger
--   on auth.users. That trigger creates a clinics row but does
--   NOT create a clinic_users row. After this migration, the
--   trigger should be updated (in a separate migration) to also
--   insert into clinic_users. That update is deferred to avoid
--   touching auth schema triggers in this batch.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. Create clinic_users table
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clinic_users (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Tenant anchor
  clinic_id    TEXT        NOT NULL REFERENCES clinics(clinic_id) ON DELETE CASCADE,

  -- Supabase auth link (auth.users.id is UUID)
  -- No FK to auth.users — auth schema is not accessible via
  -- standard migrations. user_id is stored for cross-reference.
  user_id      UUID        NOT NULL,
  email        TEXT        NOT NULL,

  -- Access control
  role         TEXT        NOT NULL DEFAULT 'staff'
    CHECK (role IN ('owner', 'admin', 'staff')),
  is_active    BOOLEAN     NOT NULL DEFAULT true,

  -- Invitation tracking
  invited_by   UUID,       -- auth.users.id of the staff who invited this user
  invited_at   TIMESTAMPTZ,

  -- Activity
  last_seen_at TIMESTAMPTZ,

  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Prevent duplicate (user_id, clinic_id) pairs
  UNIQUE (clinic_id, user_id)
);

-- ─────────────────────────────────────────────────────────────
-- 2. Indexes
-- ─────────────────────────────────────────────────────────────

-- Primary lookup: user_id → their clinic(s)
-- Used on every login to confirm clinic membership.
CREATE INDEX IF NOT EXISTS idx_clinic_users_user_id
  ON clinic_users(user_id);

-- Roster lookup: all staff for a given clinic
CREATE INDEX IF NOT EXISTS idx_clinic_users_clinic_active
  ON clinic_users(clinic_id, is_active)
  WHERE is_active = true;

-- Role queries (e.g., "find all owners of this clinic")
CREATE INDEX IF NOT EXISTS idx_clinic_users_role
  ON clinic_users(clinic_id, role);

-- ─────────────────────────────────────────────────────────────
-- 3. updated_at trigger
-- ─────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS clinic_users_updated_at ON clinic_users;
CREATE TRIGGER clinic_users_updated_at
  BEFORE UPDATE ON clinic_users
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 4. Row Level Security
--    clinic_users is sensitive staff roster data.
--    Only service_role (Express server) has access.
--    Future: add authenticated policy so owners can view
--    their own clinic's roster via a secure admin panel.
-- ─────────────────────────────────────────────────────────────
ALTER TABLE clinic_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY clinic_users_service_all ON clinic_users
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────
-- 5. Manual backfill query
--    Run this in Supabase SQL Editor with service_role access
--    AFTER the migration is applied to seed initial staff rows
--    from existing Supabase auth users.
--
--    This requires access to auth.users which is only available
--    via service_role in the Supabase dashboard SQL editor.
--    It cannot be included in a standard migration file because
--    auth schema access is restricted to the dashboard.
--
-- INSERT INTO clinic_users (clinic_id, user_id, email, role, created_at)
-- SELECT
--   (raw_app_meta_data ->> 'clinic_id')  AS clinic_id,
--   id                                    AS user_id,
--   email,
--   COALESCE(raw_app_meta_data ->> 'role', 'staff') AS role,
--   created_at
-- FROM auth.users
-- WHERE raw_app_meta_data ->> 'clinic_id' IS NOT NULL
-- ON CONFLICT (clinic_id, user_id) DO NOTHING;
--
-- Verify backfill:
-- SELECT cu.clinic_id, cu.email, cu.role, c.clinic_name
-- FROM clinic_users cu
-- JOIN clinics c ON c.clinic_id = cu.clinic_id
-- ORDER BY cu.clinic_id, cu.role;
-- ─────────────────────────────────────────────────────────────
