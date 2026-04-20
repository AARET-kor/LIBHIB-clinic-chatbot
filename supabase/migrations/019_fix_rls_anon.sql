-- ============================================================
-- 019_fix_rls_anon.sql
-- ============================================================
-- PURPOSE
--   Fix three categories of insecure RLS policies introduced
--   by migrations 011 and 013 as workarounds when
--   SUPABASE_SERVICE_ROLE_KEY was not set in Railway.
--
-- RISK LEVEL: LOW
--   No schema changes. Only policy changes. The server.js
--   Express backend uses service_role (bypasses RLS entirely)
--   so removing anon/public policies does NOT break the API.
--   The frontend client uses Supabase only for auth.getUser()
--   and does not query data tables directly.
--
-- ⚠️  PREREQUISITE — READ BEFORE RUNNING
--   This migration removes the anon-role fallback policies.
--   After applying it, any code path that reaches Supabase
--   with the anon key (not service_role) will get RLS denied.
--
--   VERIFY FIRST: confirm SUPABASE_SERVICE_ROLE_KEY is set
--   in your Railway environment variables. If the server is
--   still using the anon key as a fallback (because
--   SUPABASE_SERVICE_ROLE_KEY is missing), apply the env var
--   BEFORE running this migration.
--
--   To check: look at Railway → your service → Variables →
--   confirm SUPABASE_SERVICE_ROLE_KEY exists and is not empty.
--
-- ROLLBACK
--   Restore the old anon policies manually:
--
--   CREATE POLICY "anon_procedures_access" ON procedures
--     FOR ALL TO anon
--     USING (clinic_id IS NOT NULL AND clinic_id != '')
--     WITH CHECK (clinic_id IS NOT NULL AND clinic_id != '');
--
--   CREATE POLICY "anon_knowledge_access" ON procedures_knowledge
--     FOR ALL TO anon
--     USING (clinic_id IS NOT NULL AND clinic_id != '')
--     WITH CHECK (clinic_id IS NOT NULL AND clinic_id != '');
--
--   CREATE POLICY "patients_anon_access" ON patients
--     FOR ALL TO anon
--     USING (clinic_id IS NOT NULL AND clinic_id != '')
--     WITH CHECK (clinic_id IS NOT NULL AND clinic_id != '');
--
--   CREATE POLICY "quotations_public_read" ON quotations
--     FOR SELECT USING (true);
--
-- THE THREE SECURITY ISSUES FIXED
--   1. procedures + procedures_knowledge (011):
--      anon policy allows any caller with clinic_id != '' to
--      read/write ANY clinic's procedure data.
--      → REMOVE. service_role policy already provides access.
--
--   2. patients (013):
--      Same anon bypass. Any caller can read patient names,
--      phone numbers, emails, and notes for any clinic.
--      → REMOVE. Highest severity patient PII exposure.
--
--   3. quotations (007):
--      PUBLIC READ — `USING (true)` with no role restriction.
--      Any HTTP client with the Supabase URL + anon key can
--      read ALL quotations from ALL clinics without auth.
--      → REMOVE. Replace with service_role only.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. procedures — remove anon bypass
-- ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "anon_procedures_access"    ON procedures;

-- Keep: service_role full access (already exists from 005)
-- Keep: authenticated clinic-scoped access (already exists from 004/005)
-- Verify what remains after this migration:
-- SELECT policyname, roles, cmd FROM pg_policies WHERE tablename = 'procedures';

-- ─────────────────────────────────────────────────────────────
-- 2. procedures_knowledge — remove anon bypass
-- ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "anon_knowledge_access"     ON procedures_knowledge;

-- Keep: service_role full access (from 004)
-- Keep: authenticated clinic-scoped select (from 004)

-- ─────────────────────────────────────────────────────────────
-- 3. patients — remove anon bypass (HIGHEST PRIORITY)
--    This table contains: name, phone, email, country, note
-- ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "patients_anon_access"      ON patients;

-- Narrow the authenticated policy that was also added in 013:
-- The 013 version allows any authenticated user to read any
-- patient as long as clinic_id != '' — still too broad.
-- Replace with a proper clinic-scoped authenticated policy.

DROP POLICY IF EXISTS "patients_auth_access"      ON patients;

-- New authenticated policy: only reads your own clinic's patients.
-- Uses JWT app_metadata.clinic_id (set by Supabase Auth on login).
-- Falls back to session variable for server-side setRole patterns.
CREATE POLICY "patients_auth_clinic_scoped" ON patients
  FOR ALL TO authenticated
  USING (
    clinic_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'clinic_id'),
      current_setting('app.current_clinic_id', true)
    )
  )
  WITH CHECK (
    clinic_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'clinic_id'),
      current_setting('app.current_clinic_id', true)
    )
  );

-- ─────────────────────────────────────────────────────────────
-- 4. quotations — remove public read (CRITICAL DATA LEAK)
--    quotations_public_read had USING (true) with no role
--    filter, exposing all quotations to the public internet.
-- ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "quotations_public_read"    ON quotations;
DROP POLICY IF EXISTS "quotations_service_insert" ON quotations;
DROP POLICY IF EXISTS "quotations_service_update" ON quotations;

-- Replace with service_role-only full access (matches server.js pattern)
CREATE POLICY "quotations_service_all" ON quotations
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────
-- 5. master_procedures — anon read is intentional (public catalog)
--    This table has no clinic_id — it is a shared template
--    catalog. Anon read is appropriate and unchanged.
-- ─────────────────────────────────────────────────────────────
-- No change to master_procedures. anon_master_read stays.

-- ─────────────────────────────────────────────────────────────
-- 6. Verification — run after applying to audit policy state
-- ─────────────────────────────────────────────────────────────
-- SELECT tablename, policyname, roles::text, cmd
-- FROM pg_policies
-- WHERE tablename IN ('procedures', 'procedures_knowledge', 'patients', 'quotations')
-- ORDER BY tablename, policyname;
--
-- Expected: no rows with roles containing 'anon' for procedures,
-- procedures_knowledge, patients. quotations should show only
-- service_role. master_procedures should show anon SELECT.
