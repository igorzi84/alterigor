const DAILY_LIMIT = 20;
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

export async function consumeChatQuota(
  database: D1Database,
  quotaKey: string,
  secret: string,
): Promise<boolean> {
  const bucket = new Date().toISOString().slice(0, 10);
  const hash = await keyHash(quotaKey, secret);
  await database
    .prepare(
      'CREATE TABLE IF NOT EXISTS chat_quota (bucket TEXT NOT NULL, key_hash TEXT NOT NULL, count INTEGER NOT NULL, updated_at INTEGER NOT NULL, PRIMARY KEY (bucket, key_hash))',
    )
    .run();
  await database
    .prepare('DELETE FROM chat_quota WHERE updated_at < ?')
    .bind(Date.now() - DAY_MS)
    .run();
  const result = await database
    .prepare(
      'INSERT INTO chat_quota (bucket, key_hash, count, updated_at) VALUES (?, ?, 1, ?) ON CONFLICT(bucket, key_hash) DO UPDATE SET count = count + 1, updated_at = excluded.updated_at RETURNING count',
    )
    .bind(bucket, hash, Date.now())
    .first<{ count: number }>();
  return Boolean(result && result.count <= DAILY_LIMIT);
}
