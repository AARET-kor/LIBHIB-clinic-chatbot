import { Worker } from "bullmq";
import { createClient } from "@supabase/supabase-js";
import { aftercareQueue, getRedisRuntimeHealth, redisConnection } from "../lib/queue.js";
import {
  deliverDueAftercareEvents,
  ensureAftercareRunForVisit,
  markDueAftercareEvents,
} from "../lib/aftercare-service.js";

const HOURLY_PATTERN = "0 * * * *";
const TIMEZONE = "Asia/Seoul";
const INITIAL_RUNTIME = {
  status: "degraded",
  reason: "scheduler_not_started",
  queue_enabled: Boolean(aftercareQueue),
  worker_started: false,
  repeat_registered: false,
  last_started_at: null,
  last_error: null,
};

let schedulerRuntime = { ...INITIAL_RUNTIME };

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !serviceRoleKey) return null;
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } });
}

async function sweepAftercareDueEvents(sb, clinicId) {
  const nowIso = new Date().toISOString();

  let visitQuery = sb
    .from("visits")
    .select(`
      id, clinic_id, patient_id, procedure_id, stage, visit_date, room_cleared_at, updated_at,
      procedures ( id, name_ko, name_en )
    `)
    .not("procedure_id", "is", null)
    .lte("visit_date", nowIso)
    .order("visit_date", { ascending: false })
    .limit(500);

  if (clinicId) visitQuery = visitQuery.eq("clinic_id", clinicId);

  const { data: visits, error: visitError } = await visitQuery;
  if (visitError) throw visitError;

  let runCount = 0;
  let dueCount = 0;

  for (const visit of visits || []) {
    const run = await ensureAftercareRunForVisit(sb, visit.clinic_id, visit.patient_id, visit);
    if (!run) continue;
    runCount += 1;
    dueCount += await markDueAftercareEvents(sb, run.id);
  }

  const sentCount = await deliverDueAftercareEvents(sb, clinicId);

  return {
    scanned_visits: (visits || []).length,
    active_runs: runCount,
    newly_due_events: dueCount,
    sent_events: sentCount,
  };
}

function updateSchedulerRuntime(patch = {}) {
  schedulerRuntime = {
    ...schedulerRuntime,
    ...patch,
    queue_enabled: Boolean(aftercareQueue),
  };
  return getAftercareSchedulerHealth();
}

export function getAftercareSchedulerHealth() {
  const redis = getRedisRuntimeHealth();
  const base = {
    scheduler: "aftercare",
    status: schedulerRuntime.status,
    reason: schedulerRuntime.reason,
    queue_enabled: schedulerRuntime.queue_enabled,
    worker_started: schedulerRuntime.worker_started,
    repeat_registered: schedulerRuntime.repeat_registered,
    last_started_at: schedulerRuntime.last_started_at,
    last_error: schedulerRuntime.last_error,
    fallback_mode: schedulerRuntime.status === "degraded"
      ? "due events still surface via patient/staff reads, but background delivery may be delayed"
      : null,
    redis,
  };

  if (!aftercareQueue || !redis.configured) {
    return {
      ...base,
      status: "degraded",
      reason: "redis_unavailable",
      queue_enabled: false,
      worker_started: false,
      repeat_registered: false,
      fallback_mode: "due events still surface via patient/staff reads, but background delivery is not running in the background",
    };
  }

  if (schedulerRuntime.status !== "healthy" && !redis.available) {
    return {
      ...base,
      status: "degraded",
      reason: schedulerRuntime.reason || redis.reason || "redis_connection_unready",
    };
  }

  return base;
}

function startAftercareWorker() {
  if (!redisConnection) return;

  const worker = new Worker(
    "tikidoc-aftercare",
    async (job) => {
      const clinicId = job.data?.clinicId || null;
      const sb = getSupabaseAdmin();
      if (!sb) {
        console.warn("[Aftercare Scheduler] Supabase env missing; skipping");
        return;
      }

      const result = await sweepAftercareDueEvents(sb, clinicId);
      console.log(`[Aftercare Scheduler] scanned=${result.scanned_visits} runs=${result.active_runs} due=${result.newly_due_events} sent=${result.sent_events}`);
    },
    {
      connection: redisConnection,
      concurrency: 1,
    }
  );

  worker.on("failed", (_job, err) => {
    const health = updateSchedulerRuntime({
      status: "degraded",
      reason: "worker_failed",
      last_error: err.message,
      worker_started: false,
    });
    console.error(`[Aftercare Scheduler] status=${health.status} reason=${health.reason} error=${err.message}`);
  });
  worker.on("error", (err) => {
    const health = updateSchedulerRuntime({
      status: "degraded",
      reason: "worker_error",
      last_error: err.message,
      worker_started: false,
    });
    console.error(`[Aftercare Scheduler] status=${health.status} reason=${health.reason} error=${err.message}`);
  });

  updateSchedulerRuntime({
    status: "healthy",
    reason: null,
    worker_started: true,
    last_error: null,
  });
}

export async function startAftercareScheduler() {
  if (!aftercareQueue) {
    const health = updateSchedulerRuntime({
      status: "degraded",
      reason: "redis_unavailable",
      worker_started: false,
      repeat_registered: false,
      last_error: null,
    });
    console.warn(`[Aftercare Scheduler] status=${health.status} reason=${health.reason} fallback=lazy_reads_only`);
    return;
  }
  try {
    const existing = await aftercareQueue.getRepeatableJobs();
    const alreadySet = existing.some((job) => job.name === "aftercare-due-scan");

    if (!alreadySet) {
      await aftercareQueue.add(
        "aftercare-due-scan",
        { clinicId: process.env.CLINIC_UUID || null },
        {
          repeat: {
            pattern: HOURLY_PATTERN,
            tz: TIMEZONE,
          },
          removeOnComplete: true,
          removeOnFail: { count: 30 },
        }
      );
      console.log("[Aftercare Scheduler] hourly due-scan registered");
    }

    updateSchedulerRuntime({
      repeat_registered: true,
      last_started_at: new Date().toISOString(),
      last_error: null,
      status: "healthy",
      reason: null,
    });

    startAftercareWorker();
    const health = getAftercareSchedulerHealth();
    console.log(`[Aftercare Scheduler] status=${health.status} queue=${health.queue_enabled ? "enabled" : "disabled"} redis=${health.redis.connection_status} worker=${health.worker_started ? "started" : "stopped"}`);
  } catch (err) {
    const health = updateSchedulerRuntime({
      status: "degraded",
      reason: "startup_failed",
      worker_started: false,
      repeat_registered: false,
      last_error: err.message,
    });
    console.error(`[Aftercare Scheduler] status=${health.status} reason=${health.reason} error=${err.message}`);
    throw err;
  }
}

export { sweepAftercareDueEvents };
