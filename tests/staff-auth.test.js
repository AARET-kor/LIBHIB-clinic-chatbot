import test from "node:test";
import assert from "node:assert/strict";

import { requireRole, requireStaffAuth } from "../src/middleware/auth.js";

function makeRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

test("requireStaffAuth blocks unauthenticated staff requests", async () => {
  const originalUrl = process.env.SUPABASE_URL;
  process.env.SUPABASE_URL = "https://example.supabase.co";

  const req = {
    headers: {},
    body: {},
    query: {},
  };
  const res = makeRes();
  let nextCalled = false;

  await requireStaffAuth(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.match(res.body?.error || "", /Authorization header required/);

  if (originalUrl === undefined) delete process.env.SUPABASE_URL;
  else process.env.SUPABASE_URL = originalUrl;
});

test("requireRole only allows owner or admin for clinic rule config patch", async () => {
  const middleware = requireRole("owner", "admin");

  const deniedReq = { staff_role: "staff" };
  const deniedRes = makeRes();
  let deniedNextCalled = false;

  middleware(deniedReq, deniedRes, () => {
    deniedNextCalled = true;
  });

  assert.equal(deniedNextCalled, false);
  assert.equal(deniedRes.statusCode, 403);
  assert.match(deniedRes.body?.error || "", /owner or admin/);

  const allowedReq = { staff_role: "admin" };
  const allowedRes = makeRes();
  let allowedNextCalled = false;

  middleware(allowedReq, allowedRes, () => {
    allowedNextCalled = true;
  });

  assert.equal(allowedNextCalled, true);
  assert.equal(allowedRes.statusCode, 200);
});
