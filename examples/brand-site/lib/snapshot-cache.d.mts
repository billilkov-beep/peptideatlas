export const CATEGORY_LABELS: Readonly<Record<string, string>>;
export class ConnectionError extends Error { status: number; constructor(message: string, status?: number); }
export function validateBaseUrl(raw: string, allowLocal?: boolean): string;
export function normalizeSnapshot(source: unknown, now?: number): {
  schemaVersion: number; version: string; generatedAt: string; fetchedAt: number; expiresAt: number;
  viewerVersion: string; node: Record<string, unknown>; categories: Record<string, string>;
  items: Array<Record<string, unknown>>;
};
export class SnapshotCache {
  constructor(options: { baseUrl: string; apiKey: string; cacheFile?: string; allowLocal?: boolean; fetchImpl?: typeof fetch; now?: () => number });
  load(): Promise<void>; clear(): Promise<void>;
  current(): ReturnType<typeof normalizeSnapshot> | null;
  refresh(): Promise<ReturnType<typeof normalizeSnapshot> | null>;
  get(): Promise<ReturnType<typeof normalizeSnapshot>>;
}
