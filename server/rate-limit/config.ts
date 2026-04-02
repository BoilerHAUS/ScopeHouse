function parsePositiveInt(
  value: string | undefined,
  fallback: number,
  variableName: string,
) {
  if (!value?.trim()) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${variableName} must be a positive integer.`);
  }

  return parsed;
}

export function readRateLimitConfig(
  env: Record<string, string | undefined> = process.env,
) {
  return {
    auth: {
      maxRequests: parsePositiveInt(
        env.RATE_LIMIT_AUTH_MAX_REQUESTS,
        10,
        "RATE_LIMIT_AUTH_MAX_REQUESTS",
      ),
      windowSeconds: parsePositiveInt(
        env.RATE_LIMIT_AUTH_WINDOW_SECONDS,
        300,
        "RATE_LIMIT_AUTH_WINDOW_SECONDS",
      ),
    },
    upload: {
      maxRequests: parsePositiveInt(
        env.RATE_LIMIT_UPLOAD_MAX_REQUESTS,
        20,
        "RATE_LIMIT_UPLOAD_MAX_REQUESTS",
      ),
      windowSeconds: parsePositiveInt(
        env.RATE_LIMIT_UPLOAD_WINDOW_SECONDS,
        600,
        "RATE_LIMIT_UPLOAD_WINDOW_SECONDS",
      ),
    },
    ai: {
      maxRequests: parsePositiveInt(
        env.RATE_LIMIT_AI_MAX_REQUESTS,
        6,
        "RATE_LIMIT_AI_MAX_REQUESTS",
      ),
      windowSeconds: parsePositiveInt(
        env.RATE_LIMIT_AI_WINDOW_SECONDS,
        900,
        "RATE_LIMIT_AI_WINDOW_SECONDS",
      ),
    },
  };
}
