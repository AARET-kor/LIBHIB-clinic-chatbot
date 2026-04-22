import test from "node:test";
import assert from "node:assert/strict";

import { buildJourneyEventInsert, buildOperationalAuditPayload, writeJourneyEvents } from "../src/lib/ops-audit.js";

test("buildJourneyEventInsert creates append-only journey event payloads with actor info", () => {
  const row = buildJourneyEventInsert({
    clinic_id: "clinic-1",
    patient_id: "patient-1",
    visit_id: "visit-1",
    event_type: "room_assigned",
    actor_type: "staff",
    actor_id: "staff-1",
    payload: {
      room_id: "room-1",
      room_name: "Consultation Room 1",
      previous_room_id: null,
    },
  });

  assert.deepEqual(row, {
    clinic_id: "clinic-1",
    patient_id: "patient-1",
    visit_id: "visit-1",
    event_type: "room_assigned",
    actor_type: "staff",
    actor_id: "staff-1",
    payload: {
      room_id: "room-1",
      room_name: "Consultation Room 1",
      previous_room_id: null,
    },
  });
});

test("writeJourneyEvents inserts append-only journey events through one helper", async () => {
  const inserts = [];
  const sb = {
    from(table) {
      assert.equal(table, "patient_journey_events");
      return {
        insert(rows) {
          inserts.push(...rows);
          return {
            select: async () => ({
              data: rows.map((row, index) => ({
                id: `event-${index + 1}`,
                event_type: row.event_type,
                created_at: "2026-04-23T00:00:00.000Z",
              })),
              error: null,
            }),
          };
        },
      };
    },
  };

  const events = [
    buildJourneyEventInsert({
      clinic_id: "clinic-1",
      patient_id: "patient-1",
      visit_id: "visit-1",
      event_type: "escalation_acknowledged",
      actor_type: "staff",
      actor_id: "staff-1",
      payload: { escalation_id: "esc-1", from_status: "requested", to_status: "acknowledged" },
    }),
    buildJourneyEventInsert({
      clinic_id: "clinic-1",
      patient_id: "patient-1",
      visit_id: "visit-1",
      event_type: "aftercare_due_marked",
      actor_type: "system",
      actor_id: "scheduler",
      payload: { event_id: "aftercare-1", step_key: "day1_check" },
    }),
  ];

  const result = await writeJourneyEvents(sb, events);

  assert.equal(inserts.length, 2);
  assert.equal(inserts[0].event_type, "escalation_acknowledged");
  assert.equal(inserts[1].actor_id, "scheduler");
  assert.equal(result.length, 2);
});

test("buildOperationalAuditPayload standardizes current owner and current status fields", () => {
  const payload = buildOperationalAuditPayload({
    current_status: "assigned",
    current_owner_role: "nurse",
    current_owner_user_id: "staff-1",
    payload: {
      escalation_id: "esc-1",
    },
  });

  assert.deepEqual(payload, {
    current_status: "assigned",
    current_owner_role: "nurse",
    current_owner_user_id: "staff-1",
    escalation_id: "esc-1",
  });
});
