-- ============================================================
-- 020_ghost_column_cleanup.sql
-- ============================================================
-- PURPOSE
--   Address two data-quality problems left over from early
--   schema iterations, using only additive or data-repair
--   operations. No columns are dropped or renamed here.
--
-- RISK LEVEL: LOW
--   Section A (procedures.name backfill) is a data repair:
--   it copies data from name → name_ko where name_ko is empty.
--   It does not drop, rename, or modify any column definition.
--
--   Section B (quotations clinic_name denorm) is read-only:
--   a diagnostic query only. No data is modified.
--
-- ⚠️  MANUAL CONFIRMATION RECOMMENDED FOR SECTION A
--   Before applying, run the diagnostic query in Section A-1
--   in Supabase SQL Editor to see how many rows would be
--   affected. If count > 0 and this is live production data,
--   confirm the backfill is correct before applying A-2.
--
-- ROLLBACK
--   Section A: There is no direct undo for a data backfill.
--   Before applying A-2, export affected rows:
--     SELECT id, name, name_ko FROM procedures
--     WHERE name_ko = '' AND name IS NOT NULL AND name != '';
--   Save the output. If needed, restore from that snapshot.
--
-- COLUMN DROP / RENAME
--   procedures.name and quotations.clinic_name will be removed
--   in Phase D (030_drop_ghost_columns.sql) only after this
--   migration has been applied and verified.
--
-- BACKGROUND
--   Migration 002 created procedures with a single `name TEXT
--   NOT NULL` column. Migration 005 recreated the table with
--   name_ko/en/ja/zh columns. Migration 012 patched name to
--   be nullable, but some rows created before 012 may still
--   have name populated and name_ko empty.
--
--   quotations.clinic_name was added as a denormalized copy
--   of clinics.clinic_name to avoid a JOIN. With proper FK
--   constraints now being added (021), it is redundant.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- SECTION A: procedures.name → name_ko backfill
-- ─────────────────────────────────────────────────────────────

-- A-1. DIAGNOSTIC — run this first, do not skip
--      Review the count and sample rows before applying A-2.
--
-- SELECT
--   COUNT(*) AS rows_needing_backfill,
--   MAX(length(name)) AS max_name_length
-- FROM procedures
-- WHERE name_ko = ''
--   AND name IS NOT NULL
--   AND name != '';
--
-- SELECT id, clinic_id, name, name_ko
-- FROM procedures
-- WHERE name_ko = ''
--   AND name IS NOT NULL
--   AND name != ''
-- LIMIT 20;
--
-- IF count = 0: Section A-2 is a no-op (safe to apply anyway).
-- IF count > 0: review the sample to confirm backfill is correct.

-- A-2. BACKFILL — copy name into name_ko where name_ko is empty
--      Wrapped in DO block so it can be inspected / commented out.
DO $$
DECLARE
  v_count INT;
BEGIN
  -- Count affected rows before applying
  SELECT COUNT(*) INTO v_count
  FROM procedures
  WHERE name_ko = ''
    AND name IS NOT NULL
    AND name != '';

  IF v_count = 0 THEN
    RAISE NOTICE '[020] procedures.name backfill: no rows needed (name_ko already populated)';
  ELSE
    RAISE NOTICE '[020] procedures.name backfill: % row(s) will have name copied to name_ko', v_count;

    UPDATE procedures
    SET name_ko = name
    WHERE name_ko = ''
      AND name IS NOT NULL
      AND name != '';

    RAISE NOTICE '[020] procedures.name backfill: complete';
  END IF;
END $$;

-- A-3. VERIFICATION — run after applying to confirm state
-- SELECT
--   SUM(CASE WHEN name IS NOT NULL AND name != '' AND name_ko = '' THEN 1 ELSE 0 END)
--     AS remaining_backfill_needed,
--   COUNT(*) AS total_procedures
-- FROM procedures;
-- Expected: remaining_backfill_needed = 0

-- ─────────────────────────────────────────────────────────────
-- SECTION B: quotations.clinic_name diagnostic (read-only)
--
--   quotations.clinic_name is a denormalized copy that will be
--   removed in Phase D. No action taken here — this section is
--   purely informational so you can decide in Phase D whether
--   any active quotations rely on the denormalized value.
-- ─────────────────────────────────────────────────────────────

-- B-1. DIAGNOSTIC — run manually to understand scope
--
-- SELECT
--   COUNT(*) AS total_quotations,
--   SUM(CASE WHEN clinic_name IS NOT NULL AND clinic_name != '' THEN 1 ELSE 0 END) AS has_clinic_name,
--   SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_quotations
-- FROM quotations;

-- ─────────────────────────────────────────────────────────────
-- SECTION C: Canonical trigger function alias
--
--   Two functions exist doing the same thing:
--     set_updated_at()    (from 002)
--     update_updated_at() (from 008, used by newer tables)
--
--   Both are `CREATE OR REPLACE` so no conflict — they coexist.
--   We canonicalize to update_updated_at() going forward.
--   The old set_updated_at() will be removed in Phase D after
--   confirming no active triggers depend on it exclusively.
--
--   For now, just ensure update_updated_at() exists and is
--   identical to the canonical definition.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- C-1. DIAGNOSTIC — show which tables use which trigger function
--
-- SELECT
--   tgrelid::regclass AS table_name,
--   tgname            AS trigger_name,
--   p.proname         AS function_name
-- FROM pg_trigger t
-- JOIN pg_proc p ON t.tgfoid = p.oid
-- WHERE p.proname IN ('set_updated_at', 'update_updated_at')
-- ORDER BY table_name;
