const RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

export const INSIGHT_EVENTS = [
  'first_visit',
  'chat_start',
  'github_click',
  'linkedin_click',
  'contact_start',
  'contact_submission',
] as const;

export type InsightEvent = (typeof INSIGHT_EVENTS)[number];

type InsightEnvironment = {
  DB?: D1Database;
  QUOTA_HMAC_SECRET?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
};

export type InsightRequest = {
  consent?: true;
  event: InsightEvent;
  sessionId: string;
};

export type ChatNotificationRequest = {
  name: string;
  question: string;
};

function validSessionId(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f-]{36}$/i.test(value);
}

async function sessionHash(value: string, secret: string): Promise<string> {
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

export function validateInsightRequest(value: unknown): InsightRequest | null {
  if (typeof value !== 'object' || value === null) return null;
  const request = value as Record<string, unknown>;
  const event = request.event as InsightEvent;
  const permitted =
    request.consent === true ||
    (event === 'first_visit' && request.consent === undefined);
  return permitted &&
    validSessionId(request.sessionId) &&
    typeof request.event === 'string' &&
    INSIGHT_EVENTS.includes(event)
    ? {
        ...(request.consent === true ? { consent: true } : {}),
        event,
        sessionId: request.sessionId,
      }
    : null;
}

export function validateChatNotificationRequest(
  value: unknown,
): ChatNotificationRequest | null {
  if (typeof value !== 'object' || value === null) return null;
  const request = value as Record<string, unknown>;
  const name = typeof request.name === 'string' ? request.name.trim() : '';
  const question =
    typeof request.question === 'string' ? request.question.trim() : '';
  if (!name || name.length > 80 || !question || question.length > 1200)
    return null;
  return { name, question };
}

export async function recordInsight(
  request: InsightRequest,
  environment: InsightEnvironment,
): Promise<boolean> {
  if (!environment.DB || !environment.QUOTA_HMAC_SECRET)
    throw new Error('Insights unavailable.');
  const now = Date.now();
  const hash = await sessionHash(
    request.sessionId,
    environment.QUOTA_HMAC_SECRET,
  );
  const results = await environment.DB.batch([
    environment.DB.prepare(
      'CREATE TABLE IF NOT EXISTS visitor_events (event_name TEXT NOT NULL, session_hash TEXT NOT NULL, occurred_at INTEGER NOT NULL, PRIMARY KEY (event_name, session_hash))',
    ),
    environment.DB.prepare(
      'CREATE INDEX IF NOT EXISTS idx_visitor_events_occurred_at ON visitor_events (occurred_at)',
    ),
    environment.DB.prepare(
      'DELETE FROM visitor_events WHERE occurred_at < ?',
    ).bind(now - RETENTION_MS),
    environment.DB.prepare(
      'INSERT INTO visitor_events (event_name, session_hash, occurred_at) VALUES (?, ?, ?) ON CONFLICT(event_name, session_hash) DO NOTHING',
    ).bind(request.event, hash, now),
  ]);
  return results[3]?.meta.changes === 1;
}

export async function notifyTelegram(
  event: InsightEvent,
  environment: InsightEnvironment,
  fetchImplementation: typeof fetch = fetch,
): Promise<void> {
  const token = environment.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = environment.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) return;
  try {
    const response = await fetchImplementation(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        body: JSON.stringify({
          chat_id: chatId,
          text: telegramMessage(event),
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      },
    );
    if (!response.ok) throw new Error('Telegram rejected notification.');
  } catch {
    console.error(JSON.stringify({ event: 'telegram_notification_failed' }));
  }
}

export async function notifyTelegramChatQuestion(
  request: ChatNotificationRequest,
  environment: InsightEnvironment,
  fetchImplementation: typeof fetch = fetch,
): Promise<void> {
  const token = environment.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = environment.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) return;
  try {
    const response = await fetchImplementation(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        body: JSON.stringify({
          chat_id: chatId,
          text: `AlterIgor chat question from ${request.name}:\n${request.question}`,
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      },
    );
    if (!response.ok) throw new Error('Telegram rejected notification.');
  } catch {
    console.error(JSON.stringify({ event: 'telegram_notification_failed' }));
  }
}

function telegramMessage(event: InsightEvent): string {
  const messages: Record<InsightEvent, string> = {
    first_visit: 'AlterIgor: a new anonymous browser session visited the site.',
    chat_start: 'AlterIgor: an anonymous visitor started chat.',
    github_click: 'AlterIgor: an anonymous visitor clicked GitHub.',
    linkedin_click: 'AlterIgor: an anonymous visitor clicked LinkedIn.',
    contact_start: 'AlterIgor: an anonymous visitor started the contact form.',
    contact_submission:
      'AlterIgor: an anonymous visitor submitted the contact form.',
  };
  return messages[event];
}

export async function recordInsightSafely(
  request: InsightRequest,
  environment: InsightEnvironment,
): Promise<void> {
  try {
    const inserted = await recordInsight(request, environment);
    if (inserted && (request.event === 'first_visit' || request.consent)) {
      // Cloudflare can finish the worker as soon as this request returns.
      // Await delivery so the notification is not abandoned with the request.
      await notifyTelegram(request.event, environment);
    }
  } catch {
    console.error(JSON.stringify({ event: 'visitor_insight_failed' }));
  }
}
