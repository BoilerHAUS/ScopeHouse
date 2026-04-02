export type RateLimitDecision = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
  resetAt: Date;
};

export interface RateLimitStore {
  consume(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<RateLimitDecision>;
}

type MemoryBucket = {
  count: number;
  resetAtMs: number;
};

class MemoryRateLimitStore implements RateLimitStore {
  private buckets = new Map<string, MemoryBucket>();

  async consume(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<RateLimitDecision> {
    const now = Date.now();
    const existing = this.buckets.get(key);

    if (!existing || existing.resetAtMs <= now) {
      const resetAtMs = now + windowSeconds * 1000;

      this.buckets.set(key, {
        count: 1,
        resetAtMs,
      });

      return {
        allowed: true,
        remaining: Math.max(limit - 1, 0),
        retryAfterSeconds: windowSeconds,
        resetAt: new Date(resetAtMs),
      };
    }

    const nextCount = existing.count + 1;
    existing.count = nextCount;

    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((existing.resetAtMs - now) / 1000),
    );

    return {
      allowed: nextCount <= limit,
      remaining: Math.max(limit - nextCount, 0),
      retryAfterSeconds,
      resetAt: new Date(existing.resetAtMs),
    };
  }
}

let activeRateLimitStore: RateLimitStore = new MemoryRateLimitStore();

export function createMemoryRateLimitStore() {
  return new MemoryRateLimitStore();
}

export function getRateLimitStore() {
  return activeRateLimitStore;
}

export function setRateLimitStore(store: RateLimitStore) {
  activeRateLimitStore = store;
}
