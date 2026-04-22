import { getDefaultClinicRuleConfig } from "./clinic-rule-config.js";

function toTimestamp(value) {
  if (!value) return Number.POSITIVE_INFINITY;
  const ts = new Date(value).getTime();
  return Number.isNaN(ts) ? Number.POSITIVE_INFINITY : ts;
}

function getRoomReadyRuleConfig(clinicRuleConfig = null) {
  const config = clinicRuleConfig || getDefaultClinicRuleConfig();
  return config?.rooms?.room_ready || getDefaultClinicRuleConfig().rooms.room_ready;
}

export function isVisitRoomReady(visit = {}, clinicRuleConfig = null) {
  const roomReadyConfig = getRoomReadyRuleConfig(clinicRuleConfig);
  const allowedStages = new Set(roomReadyConfig.allowed_stages || []);
  return Boolean(
    (!roomReadyConfig.require_checked_in || visit.checked_in_at) &&
    (!roomReadyConfig.require_intake_done || visit.intake_done) &&
    (!roomReadyConfig.require_consent_done || visit.consent_done) &&
    allowedStages.has(visit.stage || "booked"),
  );
}

export function isVisitInRoom(visit = {}) {
  return Boolean(
    visit.room_id &&
    !visit.room_cleared_at &&
    (visit.stage || "booked") !== "closed",
  );
}

export function buildRoomOccupancy({ rooms = [], visits = [], clinicRuleConfig = null }) {
  return rooms.map((room) => {
    const currentVisit = visits
      .filter((visit) => visit.room_id === room.id && isVisitInRoom(visit))
      .sort((a, b) => toTimestamp(a.room_assigned_at || a.checked_in_at) - toTimestamp(b.room_assigned_at || b.checked_in_at))[0] || null;

    return {
      ...room,
      occupancy_state: currentVisit ? "occupied" : "free",
      current_visit: currentVisit,
    };
  });
}

export function getRoomReadyQueue(visits = [], clinicRuleConfig = null) {
  return visits
    .filter((visit) => isVisitRoomReady(visit, clinicRuleConfig) && !visit.room_id)
    .sort((a, b) => {
      const checkInDiff = toTimestamp(a.checked_in_at) - toTimestamp(b.checked_in_at);
      if (checkInDiff !== 0) return checkInDiff;
      return toTimestamp(a.visit_date) - toTimestamp(b.visit_date);
    });
}
