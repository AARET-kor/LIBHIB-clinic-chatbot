export function buildJourneyEventInsert({
  clinic_id,
  patient_id = null,
  visit_id = null,
  event_type,
  actor_type = "system",
  actor_id = null,
  payload = {},
}) {
  return {
    clinic_id,
    patient_id,
    visit_id,
    event_type,
    actor_type,
    actor_id,
    payload,
  };
}

export function buildOperationalAuditPayload({
  current_status = null,
  current_owner_role = null,
  current_owner_user_id = null,
  payload = {},
} = {}) {
  return {
    ...(current_status !== null ? { current_status } : {}),
    ...(current_owner_role !== null ? { current_owner_role } : {}),
    ...(current_owner_user_id !== null ? { current_owner_user_id } : {}),
    ...(payload || {}),
  };
}

export async function writeJourneyEvents(sb, events = []) {
  if (!sb || !Array.isArray(events) || events.length === 0) return [];
  const rows = events.filter(Boolean);
  if (!rows.length) return [];
  const { data, error } = await sb
    .from("patient_journey_events")
    .insert(rows)
    .select("id, event_type, created_at");
  if (error) throw error;
  return data || [];
}
