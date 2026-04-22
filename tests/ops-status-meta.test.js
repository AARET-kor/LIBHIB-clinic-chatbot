import test from "node:test";
import assert from "node:assert/strict";

import {
  AFTERCARE_FILTER_LABELS,
  ESCALATION_ROLE_LABELS,
  ESCALATION_STATUS_LABELS,
  STAGE_ORDER,
  getAftercareGroupLabel,
  getAftercareRiskMeta,
  getEscalationGroupLabel,
  getEscalationPriorityMeta,
  getOperationalUrgencyMeta,
  isAftercareUnanswered,
  isEscalationUnanswered,
} from "../client/src/lib/opsStatusMeta.js";

test("exports canonical workflow label maps", () => {
  assert.equal(STAGE_ORDER[0], "booked");
  assert.equal(ESCALATION_STATUS_LABELS.requested, "요청됨");
  assert.equal(ESCALATION_ROLE_LABELS.nurse, "간호팀");
  assert.equal(AFTERCARE_FILTER_LABELS.safe_for_return, "리턴 가능");
});

test("returns shared escalation priority metadata", () => {
  assert.deepEqual(getEscalationPriorityMeta("urgent"), {
    label: "긴급",
    color: "#DC2626",
    bg: "#FEF2F2",
    tone: "urgent",
  });
  assert.equal(getEscalationPriorityMeta("unknown").label, "보통");
});

test("returns shared aftercare risk metadata", () => {
  assert.equal(getAftercareRiskMeta("watch").label, "관찰");
  assert.equal(getAftercareRiskMeta("unknown").tone, "positive");
});

test("marks unanswered escalation and aftercare items consistently", () => {
  assert.equal(isEscalationUnanswered({ status: "requested" }), true);
  assert.equal(isEscalationUnanswered({ status: "resolved" }), false);

  assert.equal(isAftercareUnanswered({ response_status: "due" }), true);
  assert.equal(isAftercareUnanswered({ sent_at: "2026-04-23T10:00:00.000Z", responded_at: null }), true);
  assert.equal(isAftercareUnanswered({ response_status: "reviewed", responded_at: "2026-04-23T11:00:00.000Z" }), false);
});

test("returns stable group labels for escalation and aftercare sections", () => {
  assert.equal(getEscalationGroupLabel("priority", "high"), "높음");
  assert.equal(getEscalationGroupLabel("role", "doctor"), "의료진");
  assert.equal(getEscalationGroupLabel("status", "acknowledged"), "확인 중");

  assert.equal(getAftercareGroupLabel("urgent"), "긴급");
  assert.equal(getAftercareGroupLabel("watch"), "관찰");
});

test("maps operational urgency into one shared tone system", () => {
  assert.equal(getOperationalUrgencyMeta({ kind: "escalation", priority: "urgent" }).tone, "urgent");
  assert.equal(getOperationalUrgencyMeta({ kind: "aftercare", riskLevel: "concern" }).tone, "high");
  assert.equal(getOperationalUrgencyMeta({ kind: "arrival", state: "desk_confirmation" }).tone, "high");
  assert.equal(getOperationalUrgencyMeta({ kind: "arrival", state: "room_ready" }).tone, "positive");
  assert.equal(getOperationalUrgencyMeta({ kind: "room", roomReady: true }).tone, "positive");
});
