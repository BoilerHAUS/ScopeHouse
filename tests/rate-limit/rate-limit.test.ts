import assert from "node:assert/strict";
import test from "node:test";
import { readRateLimitConfig } from "@/server/rate-limit/config";
import {
  RateLimitExceededError,
  rateLimitAiByProject,
  rateLimitAuthByIp,
  rateLimitUploadsByUser,
} from "@/server/rate-limit/limit";
import { getIpAddressFromHeaders } from "@/server/rate-limit/request";
import {
  createMemoryRateLimitStore,
  setRateLimitStore,
} from "@/server/rate-limit/store";

test("readRateLimitConfig uses defaults and validates invalid env values", () => {
  assert.deepEqual(readRateLimitConfig({}), {
    auth: {
      maxRequests: 10,
      windowSeconds: 300,
    },
    upload: {
      maxRequests: 20,
      windowSeconds: 600,
    },
    ai: {
      maxRequests: 6,
      windowSeconds: 900,
    },
  });

  assert.throws(
    () => readRateLimitConfig({ RATE_LIMIT_AI_MAX_REQUESTS: "0" }),
    /RATE_LIMIT_AI_MAX_REQUESTS must be a positive integer/,
  );
});

test("getIpAddressFromHeaders prefers forwarded headers and falls back to unknown", () => {
  assert.equal(
    getIpAddressFromHeaders(
      new Headers({
        "x-forwarded-for": "203.0.113.10, 10.0.0.2",
      }),
    ),
    "203.0.113.10",
  );

  assert.equal(getIpAddressFromHeaders(new Headers()), "unknown");
});

test("rate limit helpers enforce auth, upload, and AI limits", async (t) => {
  const previousAuthMax = process.env.RATE_LIMIT_AUTH_MAX_REQUESTS;
  const previousAuthWindow = process.env.RATE_LIMIT_AUTH_WINDOW_SECONDS;
  const previousUploadMax = process.env.RATE_LIMIT_UPLOAD_MAX_REQUESTS;
  const previousUploadWindow = process.env.RATE_LIMIT_UPLOAD_WINDOW_SECONDS;
  const previousAiMax = process.env.RATE_LIMIT_AI_MAX_REQUESTS;
  const previousAiWindow = process.env.RATE_LIMIT_AI_WINDOW_SECONDS;

  process.env.RATE_LIMIT_AUTH_MAX_REQUESTS = "1";
  process.env.RATE_LIMIT_AUTH_WINDOW_SECONDS = "60";
  process.env.RATE_LIMIT_UPLOAD_MAX_REQUESTS = "1";
  process.env.RATE_LIMIT_UPLOAD_WINDOW_SECONDS = "60";
  process.env.RATE_LIMIT_AI_MAX_REQUESTS = "1";
  process.env.RATE_LIMIT_AI_WINDOW_SECONDS = "60";
  setRateLimitStore(createMemoryRateLimitStore());

  t.after(() => {
    setRateLimitStore(createMemoryRateLimitStore());

    if (previousAuthMax === undefined) {
      delete process.env.RATE_LIMIT_AUTH_MAX_REQUESTS;
    } else {
      process.env.RATE_LIMIT_AUTH_MAX_REQUESTS = previousAuthMax;
    }

    if (previousAuthWindow === undefined) {
      delete process.env.RATE_LIMIT_AUTH_WINDOW_SECONDS;
    } else {
      process.env.RATE_LIMIT_AUTH_WINDOW_SECONDS = previousAuthWindow;
    }

    if (previousUploadMax === undefined) {
      delete process.env.RATE_LIMIT_UPLOAD_MAX_REQUESTS;
    } else {
      process.env.RATE_LIMIT_UPLOAD_MAX_REQUESTS = previousUploadMax;
    }

    if (previousUploadWindow === undefined) {
      delete process.env.RATE_LIMIT_UPLOAD_WINDOW_SECONDS;
    } else {
      process.env.RATE_LIMIT_UPLOAD_WINDOW_SECONDS = previousUploadWindow;
    }

    if (previousAiMax === undefined) {
      delete process.env.RATE_LIMIT_AI_MAX_REQUESTS;
    } else {
      process.env.RATE_LIMIT_AI_MAX_REQUESTS = previousAiMax;
    }

    if (previousAiWindow === undefined) {
      delete process.env.RATE_LIMIT_AI_WINDOW_SECONDS;
    } else {
      process.env.RATE_LIMIT_AI_WINDOW_SECONDS = previousAiWindow;
    }
  });

  await rateLimitAuthByIp("198.51.100.20");
  await assert.rejects(
    () => rateLimitAuthByIp("198.51.100.20"),
    RateLimitExceededError,
  );

  await rateLimitUploadsByUser("user_123");
  await assert.rejects(
    () => rateLimitUploadsByUser("user_123"),
    RateLimitExceededError,
  );

  await rateLimitAiByProject("project_123");
  await assert.rejects(
    () => rateLimitAiByProject("project_123"),
    RateLimitExceededError,
  );
});
