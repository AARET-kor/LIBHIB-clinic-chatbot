import test from "node:test";
import assert from "node:assert/strict";

import { markDueAftercareEvents } from "../src/lib/aftercare-service.js";

test("markDueAftercareEvents records append-only journey events when scheduled items become due", async () => {
  const journeyInserts = [];

  const sb = {
    from(table) {
      if (table === "patient_aftercare_events") {
        return {
          update(payload) {
            assert.equal(payload.response_status, "due");
            return {
              eq() { return this; },
              is() { return this; },
              lte() { return this; },
              select: async () => ({
                data: [
                  { id: "event-1", run_id: "run-1", step_id: "step-1" },
                ],
                error: null,
              }),
            };
          },
        };
      }

      if (table === "patient_aftercare_runs") {
        return {
          select() {
            return {
              eq() {
                return {
                  maybeSingle: async () => ({
                    data: { id: "run-1", clinic_id: "clinic-1", patient_id: "patient-1", visit_id: "visit-1" },
                    error: null,
                  }),
                };
              },
            };
          },
        };
      }

      if (table === "aftercare_steps") {
        return {
          select() {
            return {
              in: async () => ({
                data: [{ id: "step-1", step_key: "day1_check" }],
                error: null,
              }),
            };
          },
        };
      }

      if (table === "patient_journey_events") {
        return {
          insert(rows) {
            journeyInserts.push(...rows);
            return {
              select: async () => ({
                data: rows.map((row, index) => ({
                  id: `journey-${index + 1}`,
                  event_type: row.event_type,
                  created_at: "2026-04-23T00:00:00.000Z",
                })),
                error: null,
              }),
            };
          },
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    },
  };

  const count = await markDueAftercareEvents(sb, "run-1");

  assert.equal(count, 1);
  assert.equal(journeyInserts.length, 1);
  assert.equal(journeyInserts[0].event_type, "aftercare_due_marked");
  assert.equal(journeyInserts[0].actor_type, "system");
  assert.equal(journeyInserts[0].actor_id, "scheduler");
  assert.equal(journeyInserts[0].payload.step_key, "day1_check");
});
