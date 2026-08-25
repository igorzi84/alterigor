import { describe, expect, it, vi } from 'vitest';

import {
  notifyTelegram,
  recordInsight,
  recordInsightSafely,
  validateInsightRequest,
} from '../lib/insights';

const request = {
  consent: true as const,
  event: 'first_visit' as const,
  sessionId: '00000000-0000-4000-8000-000000000000',
};

function fakeDatabase() {
  const prepared: string[] = [];
  const statement = (sql: string) => ({
    bind: () => statement(sql),
    first: async () => (sql.includes('SELECT changes') ? { changes: 1 } : null),
    run: async () => ({}),
  });
  return {
    batch: async () => [{}, {}, {}, { meta: { changes: 1 } }],
    prepare: (sql: string) => {
      prepared.push(sql);
      return statement(sql);
    },
    prepared,
  };
}

describe('visitor insights', () => {
  it('accepts only allowlisted, consented anonymous events', () => {
    expect(validateInsightRequest(request)).toEqual(request);
    expect(validateInsightRequest({ ...request, consent: false })).toBeNull();
    expect(
      validateInsightRequest({ ...request, event: 'page_view' }),
    ).toBeNull();
    expect(
      validateInsightRequest({ ...request, sessionId: 'visitor@example.com' }),
    ).toBeNull();
  });

  it('hashes sessions, deduplicates events, and schedules 30-day cleanup in D1', async () => {
    const database = fakeDatabase();
    await expect(
      recordInsight(request, {
        DB: database as unknown as D1Database,
        QUOTA_HMAC_SECRET: 'test-secret',
      }),
    ).resolves.toBe(true);
    expect(database.prepared.join('\n')).toContain('session_hash');
    expect(database.prepared.join('\n')).toContain(
      'DELETE FROM visitor_events',
    );
    expect(database.prepared.join('\n')).not.toContain(request.sessionId);
  });

  it('does not include visitor data in Telegram notifications', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 200 }));
    await notifyTelegram(
      'contact_submission',
      {
        DB: {} as D1Database,
        TELEGRAM_BOT_TOKEN: 'bot-token',
        TELEGRAM_CHAT_ID: 'chat-id',
      },
      fetchMock,
    );
    const body = String(fetchMock.mock.calls[0][1]?.body);
    expect(body).toContain('contact form message was delivered');
    expect(body).not.toContain('email');
    expect(body).not.toContain('message content');
  });

  it('contains D1 failures so they do not affect the visitor experience', async () => {
    const error = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    await expect(
      recordInsightSafely(request, {
        DB: {
          batch: async () => Promise.reject(new Error('D1 unavailable')),
        } as unknown as D1Database,
        QUOTA_HMAC_SECRET: 'test-secret',
      }),
    ).resolves.toBeUndefined();
    expect(error).toHaveBeenCalledWith(
      JSON.stringify({ event: 'visitor_insight_failed' }),
    );
    error.mockRestore();
  });
});
