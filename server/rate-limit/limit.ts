import { readRateLimitConfig } from "@/server/rate-limit/config";
import { getRateLimitStore } from "@/server/rate-limit/store";

export class RateLimitExceededError extends Error {
  constructor(
    message: string,
    readonly retryAfterSeconds: number,
  ) {
    super(message);
    this.name = "RateLimitExceededError";
  }
}

export function isRateLimitExceededError(error: unknown) {
  return error instanceof RateLimitExceededError;
}

async function enforceRateLimit({
  key,
  limit,
  windowSeconds,
  message,
}: {
  key: string;
  limit: number;
  windowSeconds: number;
  message: string;
}) {
  const decision = await getRateLimitStore().consume(key, limit, windowSeconds);

  if (!decision.allowed) {
    throw new RateLimitExceededError(message, decision.retryAfterSeconds);
  }

  return decision;
}

export async function rateLimitAuthByIp(ipAddress: string) {
  const config = readRateLimitConfig();

  return enforceRateLimit({
    key: `auth:${ipAddress}`,
    limit: config.auth.maxRequests,
    windowSeconds: config.auth.windowSeconds,
    message:
      "Too many sign-in or sign-up attempts from this connection. Try again in a few minutes.",
  });
}

export async function rateLimitUploadsByUser(userId: string) {
  const config = readRateLimitConfig();

  return enforceRateLimit({
    key: `upload:${userId}`,
    limit: config.upload.maxRequests,
    windowSeconds: config.upload.windowSeconds,
    message: "Too many uploads right now. Try again in a few minutes.",
  });
}

export async function rateLimitAiByProject(projectId: string) {
  const config = readRateLimitConfig();

  return enforceRateLimit({
    key: `ai:${projectId}`,
    limit: config.ai.maxRequests,
    windowSeconds: config.ai.windowSeconds,
    message:
      "AI generation is temporarily rate limited for this project. Try again in a few minutes.",
  });
}
