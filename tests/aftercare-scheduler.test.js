import test from "node:test";
import assert from "node:assert/strict";

import { getAftercareSchedulerHealth } from "../src/scheduler/aftercare.js";

test("aftercare scheduler reports degraded when Redis is unavailable", () => {
  const health = getAftercareSchedulerHealth();

  assert.equal(typeof health.status, "string");
  assert.equal(typeof health.queue_enabled, "boolean");
  assert.equal(typeof health.redis.configured, "boolean");

  if (!health.redis.configured) {
    assert.equal(health.status, "degraded");
    assert.equal(health.reason, "redis_unavailable");
    assert.match(health.fallback_mode, /background delivery/i);
  }
});

