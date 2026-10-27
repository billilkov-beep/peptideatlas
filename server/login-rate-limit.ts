type Bucket = { attempts: number; expires: number };
type Result = { allowed: true } | { allowed: false; retryAfterSeconds: number };

/** Bounds both expensive password checks and in-memory rate-limit state. */
export class LoginRateLimiter {
  private readonly buckets = new Map<string, Bucket>();
  private nextCleanup = 0;
  private readonly windowMs: number;
  private readonly ipLimit: number;
  private readonly accountLimit: number;
  private readonly maxEntries: number;
  private readonly now: () => number;

  constructor(options: { windowMs?: number; ipLimit?: number; accountLimit?: number; maxEntries?: number; now?: () => number } = {}) {
    this.windowMs = options.windowMs ?? 15 * 60 * 1000;
    this.ipLimit = options.ipLimit ?? 60;
    this.accountLimit = options.accountLimit ?? 10;
    this.maxEntries = options.maxEntries ?? 10000;
    this.now = options.now ?? Date.now;
    if (this.maxEntries < 2 || this.windowMs <= 0 || this.ipLimit < 1 || this.accountLimit < 1) throw new Error('Invalid login rate-limit configuration.');
  }

  private accountKey(ip: string, email: string) { return `account:${ip}\0${email}`; }
  private current(key: string, now: number) {
    const bucket = this.buckets.get(key);
    if (bucket && bucket.expires <= now) { this.buckets.delete(key); return undefined; }
    return bucket;
  }

  consume(ip: string, email: string): Result {
    const now = this.now();
    // Sweep at most once per 30 seconds even when a full-map attack continues.
    if (now >= this.nextCleanup) {
      for (const [key, value] of this.buckets) if (value.expires <= now) this.buckets.delete(key);
      this.nextCleanup = now + Math.min(30000, this.windowMs);
    }
    const ipKey = `ip:${ip}`;
    const accountKey = this.accountKey(ip, email);
    const ipBucket = this.current(ipKey, now);
    // Check the IP budget before looking up or allocating arbitrary email keys.
    if (ipBucket && ipBucket.attempts >= this.ipLimit) return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((ipBucket.expires - now) / 1000)) };
    const accountBucket = this.current(accountKey, now);
    if (accountBucket && accountBucket.attempts >= this.accountLimit) return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((accountBucket.expires - now) / 1000)) };
    const required = Number(!ipBucket) + Number(!accountBucket);
    if (this.buckets.size + required > this.maxEntries) return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((this.nextCleanup - now) / 1000)) };
    const ipNext = ipBucket ?? { attempts: 0, expires: now + this.windowMs };
    const accountNext = accountBucket ?? { attempts: 0, expires: now + this.windowMs };
    ipNext.attempts++; accountNext.attempts++;
    this.buckets.set(ipKey, ipNext);
    this.buckets.set(accountKey, accountNext);
    return { allowed: true };
  }

  successfulLogin(ip: string, email: string) {
    this.buckets.delete(this.accountKey(ip, email));
    // A successful login must not reset the IP budget: valid credentials should
    // not provide a way to replenish an attacker's expensive password attempts.
  }

  get trackedBuckets() { return this.buckets.size; }
}
