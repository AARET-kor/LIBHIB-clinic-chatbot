-- ============================================================
-- 021_add_fk_constraints.sql
-- ============================================================
-- PURPOSE
--   Add foreign key constraints from the six old tables
--   (procedures, procedures_knowledge, patients, conversations,
--   aftercare_records, quotations) to clinics(clinic_id).
--
--   Also add the missing FK from visits.procedure_id to
--   procedures(id), which was omitted in migration 014.
--
-- RISK LEVEL: LOW — but read the NOT VALID note carefully
--
-- KEY TECHNIQUE: NOT VALID
--   All FK constraints are added with NOT VALID.
--   This means:
--     • New inserts/updates are immediately checked (enforced)
--     • Existing rows are NOT scanned or validated
--     • The table is NOT locked during the ALTER TABLE
--     • If existing data has orphaned clinic_ids, it is not
--       immediately rejected — only new inserts are blocked
--
--   This is the standard technique for adding FKs to live
--   production tables without downtime or scan overhead.
--   Validation of existing rows happens in Phase D migration
--   030 via VALIDATE CONSTRAINT (runs a table scan safely).
--
-- ROLLBACK
--   For each constraint, run:
--   ALTER TABLE <table> DROP CONSTRAINT <constraint_name>;
--   Names are listed below for easy rollback reference.
--
-- ⚠️  PRE-FLIGHT CHECKS
--   Run the diagnostic queries in Section 0 first.
--   If any clinic_id values exist in old tables that do NOT
--   have a matching row in clinics, the NOT VALID constraint
--   will still be added (it skips existing rows), BUT those
--   orphaned rows will cause VALIDATE CONSTRAINT in Phase D
--   to fail. Deal with them before Phase D by either:
--     a) inserting the missing clinic row into clinics
--     b) nulling the orphaned clinic_id
--
-- DEPENDENCIES
--   • clinics table must exist (from migration 002) ✅
--   • patients table must exist (from migration 009) ✅
--   • procedures table must exist (from migration 005) ✅
--   • visits table must exist (from migration 014)
--     → visits.procedure_id FK is isolated to Section 7
--       and includes a guard. If visits does not exist yet,
--       Section 7 is a no-op.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- SECTION 0: Pre-flight diagnostics (run manually, not applied)
--   Run these in Supabase SQL Editor BEFORE applying this file.
--   They reveal any orphaned clinic_id values that will need
--   attention before Phase D validation.
-- ─────────────────────────────────────────────────────────────

-- 0-A. Find orphaned clinic_ids across all old tables:
--
-- SELECT 'procedures' AS src, clinic_id, COUNT(*) AS rows
-- FROM procedures
-- WHERE clinic_id NOT IN (SELECT clinic_id FROM clinics)
-- GROUP BY clinic_id
-- UNION ALL
-- SELECT 'procedures_knowledge', clinic_id, COUNT(*)
-- FROM procedures_knowledge
-- WHERE clinic_id NOT IN (SELECT clinic_id FROM clinics)
-- GROUP BY clinic_id
-- UNION ALL
-- SELECT 'patients', clinic_id, COUNT(*)
-- FROM patients
-- WHERE clinic_id NOT IN (SELECT clinic_id FROM clinics)
-- GROUP BY clinic_id
-- UNION ALL
-- SELECT 'conversations', clinic_id, COUNT(*)
-- FROM conversations
-- WHERE clinic_id NOT IN (SELECT clinic_id FROM clinics)
-- GROUP BY clinic_id
-- UNION ALL
-- SELECT 'aftercare_records', clinic_id, COUNT(*)
-- FROM aftercare_records
-- WHERE clinic_id NOT IN (SELECT clinic_id FROM clinics)
-- GROUP BY clinic_id
-- UNION ALL
-- SELECT 'quotations', clinic_id, COUNT(*)
-- FROM quotations
-- WHERE clinic_id NOT IN (SELECT clinic_id FROM clinics)
-- GROUP BY clinic_id
-- ORDER BY src, clinic_id;
--
-- Expected result: zero rows. If rows appear, fix them first.

-- ─────────────────────────────────────────────────────────────
-- SECTION 1: procedures → clinics
--   Rollback: ALTER TABLE procedures DROP CONSTRAINT fk_procedures_clinic;
-- ─────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_procedures_clinic'
      AND table_name = 'procedures'
  ) THEN
    ALTER TABLE procedures
      ADD CONSTRAINT fk_procedures_clinic
      FOREIGN KEY (clinic_id)
      REFERENCES clinics(clinic_id)
      ON DELETE CASCADE
      NOT VALID;
    RAISE NOTICE '[021] fk_procedures_clinic added (NOT VALID)';
  ELSE
    RAISE NOTICE '[021] fk_procedures_clinic already exists — skipped';
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- SECTION 2: procedures_knowledge → clinics
--   Rollback: ALTER TABLE procedures_knowledge DROP CONSTRAINT fk_knowledge_clinic;
-- ─────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_knowledge_clinic'
      AND table_name = 'procedures_knowledge'
  ) THEN
    ALTER TABLE procedures_knowledge
      ADD CONSTRAINT fk_knowledge_clinic
      FOREIGN KEY (clinic_id)
      REFERENCES clinics(clinic_id)
      ON DELETE CASCADE
      NOT VALID;
    RAISE NOTICE '[021] fk_knowledge_clinic added (NOT VALID)';
  ELSE
    RAISE NOTICE '[021] fk_knowledge_clinic already exists — skipped';
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- SECTION 3: patients → clinics
--   Rollback: ALTER TABLE patients DROP CONSTRAINT fk_patients_clinic;
-- ─────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_patients_clinic'
      AND table_name = 'patients'
  ) THEN
    ALTER TABLE patients
      ADD CONSTRAINT fk_patients_clinic
      FOREIGN KEY (clinic_id)
      REFERENCES clinics(clinic_id)
      ON DELETE CASCADE
      NOT VALID;
    RAISE NOTICE '[021] fk_patients_clinic added (NOT VALID)';
  ELSE
    RAISE NOTICE '[021] fk_patients_clinic already exists — skipped';
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- SECTION 4: conversations → clinics
--   Rollback: ALTER TABLE conversations DROP CONSTRAINT fk_conversations_clinic;
-- ─────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_conversations_clinic'
      AND table_name = 'conversations'
  ) THEN
    ALTER TABLE conversations
      ADD CONSTRAINT fk_conversations_clinic
      FOREIGN KEY (clinic_id)
      REFERENCES clinics(clinic_id)
      ON DELETE CASCADE
      NOT VALID;
    RAISE NOTICE '[021] fk_conversations_clinic added (NOT VALID)';
  ELSE
    RAISE NOTICE '[021] fk_conversations_clinic already exists — skipped';
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- SECTION 5: aftercare_records → clinics
--   Rollback: ALTER TABLE aftercare_records DROP CONSTRAINT fk_aftercare_clinic;
-- ─────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_aftercare_clinic'
      AND table_name = 'aftercare_records'
  ) THEN
    ALTER TABLE aftercare_records
      ADD CONSTRAINT fk_aftercare_clinic
      FOREIGN KEY (clinic_id)
      REFERENCES clinics(clinic_id)
      ON DELETE CASCADE
      NOT VALID;
    RAISE NOTICE '[021] fk_aftercare_clinic added (NOT VALID)';
  ELSE
    RAISE NOTICE '[021] fk_aftercare_clinic already exists — skipped';
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- SECTION 6: quotations → clinics
--   Rollback: ALTER TABLE quotations DROP CONSTRAINT fk_quotations_clinic;
-- ─────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_quotations_clinic'
      AND table_name = 'quotations'
  ) THEN
    ALTER TABLE quotations
      ADD CONSTRAINT fk_quotations_clinic
      FOREIGN KEY (clinic_id)
      REFERENCES clinics(clinic_id)
      ON DELETE CASCADE
      NOT VALID;
    RAISE NOTICE '[021] fk_quotations_clinic added (NOT VALID)';
  ELSE
    RAISE NOTICE '[021] fk_quotations_clinic already exists — skipped';
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- SECTION 7: visits.procedure_id → procedures(id)
--   Only executes if the visits table exists (from 014).
--   Rollback: ALTER TABLE visits DROP CONSTRAINT fk_visits_procedure;
-- ─────────────────────────────────────────────────────────────
DO $$
BEGIN
  -- Guard: only run if visits table exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'visits'
  ) THEN
    RAISE NOTICE '[021] visits table not found — skipping fk_visits_procedure (apply 014 first)';
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_visits_procedure'
      AND table_name = 'visits'
  ) THEN
    ALTER TABLE visits
      ADD CONSTRAINT fk_visits_procedure
      FOREIGN KEY (procedure_id)
      REFERENCES procedures(id)
      ON DELETE SET NULL
      NOT VALID;
    RAISE NOTICE '[021] fk_visits_procedure added (NOT VALID)';
  ELSE
    RAISE NOTICE '[021] fk_visits_procedure already exists — skipped';
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- SECTION 8: Verification
-- ─────────────────────────────────────────────────────────────
-- Run after applying to confirm all constraints were added:
--
-- SELECT
--   tc.table_name,
--   tc.constraint_name,
--   tc.constraint_type,
--   kcu.column_name,
--   ccu.table_name AS references_table,
--   pgc.convalidated AS is_validated
-- FROM information_schema.table_constraints tc
-- JOIN information_schema.key_column_usage kcu
--   ON tc.constraint_name = kcu.constraint_name
-- JOIN information_schema.constraint_column_usage ccu
--   ON tc.constraint_name = ccu.constraint_name
-- JOIN pg_constraint pgc
--   ON pgc.conname = tc.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY'
--   AND tc.table_name IN (
--     'procedures','procedures_knowledge','patients',
--     'conversations','aftercare_records','quotations','visits'
--   )
-- ORDER BY tc.table_name;
--
-- Expected: is_validated = false for all new constraints (NOT VALID).
-- They become true only after Phase D VALIDATE CONSTRAINT.
--
-- IMPORTANT FOR PHASE D:
--   To validate existing rows (run a full table scan) later:
--   ALTER TABLE procedures           VALIDATE CONSTRAINT fk_procedures_clinic;
--   ALTER TABLE procedures_knowledge VALIDATE CONSTRAINT fk_knowledge_clinic;
--   ALTER TABLE patients             VALIDATE CONSTRAINT fk_patients_clinic;
--   ALTER TABLE conversations        VALIDATE CONSTRAINT fk_conversations_clinic;
--   ALTER TABLE aftercare_records    VALIDATE CONSTRAINT fk_aftercare_clinic;
--   ALTER TABLE quotations           VALIDATE CONSTRAINT fk_quotations_clinic;
--   ALTER TABLE visits               VALIDATE CONSTRAINT fk_visits_procedure;
--
--   Run each VALIDATE separately on a quiet period — each acquires
--   a SHARE UPDATE EXCLUSIVE lock but does not block reads.
