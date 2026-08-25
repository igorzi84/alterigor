export const CHAT_SESSION_LIMIT = 5;
const CONTACT_DAILY_LIMIT = 5;
const INSIGHT_DAILY_LIMIT = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

export function validQuotaKey(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f-]{36}$/i.test(value);
}

async function keyHash(value: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { hash: 'SHA-256', name: 'HMAC' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(value),
  );
  return Array.from(new Uint8Array(signature), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
}

async function consumeQuota(
  database: D1Database,
  quotaKey: string,
  secret: string,
  table: 'chat_quota' | 'contact_quota' | 'insight_quota',
  limit: number,
): Promise<boolean> {
  const bucket = new Date().toISOString().slice(0, 10);
  const hash = await keyHash(quotaKey, secret);
  await database
    .prepare(
      `CREATE TABLE IF NOT EXISTS ${table} (bucket TEXT NOT NULL, key_hash TEXT NOT NULL, count INTEGER NOT NULL, updated_at INTEGER NOT NULL, PRIMARY KEY (bucket, key_hash))`,
    )
    .run();
  await database
    .prepare(`DELETE FROM ${table} WHERE updated_at < ?`)
    .bind(Date.now() - DAY_MS)
    .run();
  const result = await database
    .prepare(
      `INSERT INTO ${table} (bucket, key_hash, count, updated_at) VALUES (?, ?, 1, ?) ON CONFLICT(bucket, key_hash) DO UPDATE SET count = count + 1, updated_at = excluded.updated_at RETURNING count`,
    )
    .bind(bucket, hash, Date.now())
    .first<{ count: number }>();
  return Boolean(result && result.count <= limit);
}

async function quotaCount(
  database: D1Database,
  quotaKey: string,
  secret: string,
  table: 'chat_quota' | 'contact_quota' | 'insight_quota',
): Promise<number> {
  const bucket = new Date().toISOString().slice(0, 10);
  const hash = await keyHash(quotaKey, secret);
  await database
    .prepare(
      `CREATE TABLE IF NOT EXISTS ${table} (bucket TEXT NOT NULL, key_hash TEXT NOT NULL, count INTEGER NOT NULL, updated_at INTEGER NOT NULL, PRIMARY KEY (bucket, key_hash))`,
    )
    .run();
  await database
    .prepare(`DELETE FROM ${table} WHERE updated_at < ?`)
    .bind(Date.now() - DAY_MS)
    .run();
  const result = await database
    .prepare(`SELECT count FROM ${table} WHERE bucket = ? AND key_hash = ?`)
    .bind(bucket, hash)
    .first<{ count: number }>();
  return result?.count ?? 0;
}

export async function consumeChatQuota(
  database: D1Database,
  quotaKey: string,
  secret: string,
): Promise<boolean> {
  return consumeQuota(
    database,
    quotaKey,
    secret,
    'chat_quota',
    CHAT_SESSION_LIMIT,
  );
}

export async function chatQuotaRemaining(
  database: D1Database,
  quotaKey: string,
  secret: string,
): Promise<number> {
  const count = await quotaCount(database, quotaKey, secret, 'chat_quota');
  return Math.max(0, CHAT_SESSION_LIMIT - count);
}

export async function consumeContactQuota(
  database: D1Database,
  networkAddress: string,
  secret: string,
): Promise<boolean> {
  return consumeQuota(
    database,
    networkAddress,
    secret,
    'contact_quota',
    CONTACT_DAILY_LIMIT,
  );
}

export async function consumeInsightQuota(
  database: D1Database,
  networkAddress: string,
  secret: string,
): Promise<boolean> {
  return consumeQuota(
    database,
    networkAddress,
    secret,
    'insight_quota',
    INSIGHT_DAILY_LIMIT,
  );
}
