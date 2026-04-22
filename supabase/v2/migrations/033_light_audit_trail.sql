-- ============================================================
-- 033_light_audit_trail.sql
-- ============================================================
-- PURPOSE
--   Batch 5C-1
--   Extend patient_journey_events with a minimal append-only
--   set of operational audit events for escalation, aftercare,
--   and room session transitions.
-- ============================================================

ALTER TABLE patient_journey_events
  DROP CONSTRAINT IF EXISTS patient_journey_events_event_type_check;

ALTER TABLE patient_journey_events
  ADD CONSTRAINT patient_journey_events_event_type_check
  CHECK (event_type IN (
    'visit_created',
    'stage_changed',
    'patient_arrived',
    'check_in_completed',
    'room_assigned',
    'room_cleared',
    'room_session_ended',
    'room_next_loaded',
    'link_generated',
    'link_sent',
    'link_opened',
    'link_revoked',
    'link_expired',
    'form_sent',
    'form_submitted',
    'form_reviewed',
    'aftercare_d1_sent',
    'aftercare_d1_replied',
    'aftercare_d3_sent',
    'aftercare_d3_replied',
    'aftercare_d7_sent',
    'aftercare_d7_replied',
    'aftercare_due_marked',
    'aftercare_outbound_sent',
    'aftercare_response_recorded',
    'aftercare_reviewed',
    'escalation_acknowledged',
    'escalation_assigned',
    'escalation_responded',
    'escalation_resolved',
    'escalation_closed',
    'risk_flagged',
    'risk_cleared',
    'note_added',
    'coordinator_assigned',
    'no_show',
    'tiki_talk_session',
    'tiki_room_session',
    'tiki_paste_used',
    'export_created',
    'manual_entry'
  ));
