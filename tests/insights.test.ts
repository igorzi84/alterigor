import { describe, expect, it, vi } from 'vitest';

import {
  getRequestBrowser,
  getRequestCountry,
  notifyTelegram,
  notifyTelegramChatQuestion,
  recordInsight,
  recordInsightSafely,
  validateChatNotificationRequest,
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
  it('uses the platform country header when request.cf is unavailable', () => {
    expect(
      getRequestCountry(
        new Request('https://example.test', {
          headers: { 'CF-IPCountry': 'CA' },
        }),
      ),
    ).toBe('CA');
  });

  it('reduces the user agent to a coarse browser family', () => {
    expect(
      getRequestBrowser(
        new Request('https://example.test', {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 Chrome/140.0.0.0 Safari/537.36',
          },
        }),
      ),
    ).toBe('Chrome');
    expect(
      getRequestBrowser(new Request('https://example.test')),
    ).toBeUndefined();
  });

  it('accepts an essential first-visit alert and only consented optional events', () => {
    expect(validateInsightRequest(request)).toEqual(request);
    expect(
      validateInsightRequest({
        event: 'first_visit',
        sessionId: request.sessionId,
      }),
    ).toEqual({ event: 'first_visit', sessionId: request.sessionId });
    expect(validateInsightRequest({ ...request, consent: false })).toBeNull();
    expect(
      validateInsightRequest({
        event: 'chat_start',
        sessionId: request.sessionId,
      }),
    ).toBeNull();
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

  it('sends an anonymous interaction label and an approximate country to Telegram', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 200 }));
    await notifyTelegram(
      'chat_start',
      {
        DB: {} as D1Database,
        TELEGRAM_BOT_TOKEN: 'bot-token',
        TELEGRAM_CHAT_ID: 'chat-id',
      },
      { browser: 'Chrome', country: 'CA' },
      fetchMock,
    );
    const body = String(fetchMock.mock.calls[0][1]?.body);
    expect(body).toContain('anonymous visitor started chat');
    expect(body).toContain('Approximate country: Canada');
    expect(body).toContain('Browser: Chrome');
    expect(body).not.toContain('email');
    expect(body).not.toContain('message content');
  });

  it('does not add an untrusted or unavailable country to a Telegram alert', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 200 }));
    await notifyTelegram(
      'first_visit',
      { TELEGRAM_BOT_TOKEN: 'bot-token', TELEGRAM_CHAT_ID: 'chat-id' },
      { country: 'Ontario' },
      fetchMock,
    );
    expect(String(fetchMock.mock.calls[0][1]?.body)).not.toContain(
      'Approximate country',
    );
  });

  it('only permits bounded name-and-question Telegram notifications', async () => {
    const notification = {
      name: 'Ada',
      question: 'What platform work has Igor done?',
    };
    expect(validateChatNotificationRequest(notification)).toEqual(notification);
    expect(
      validateChatNotificationRequest({ ...notification, name: '' }),
    ).toBeNull();
    expect(
      validateChatNotificationRequest({
        ...notification,
        question: 'x'.repeat(1201),
      }),
    ).toBeNull();

    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 200 }));
    await notifyTelegramChatQuestion(
      notification,
      { TELEGRAM_BOT_TOKEN: 'bot-token', TELEGRAM_CHAT_ID: 'chat-id' },
      fetchMock,
    );
    const body = String(fetchMock.mock.calls[0][1]?.body);
    expect(body).toContain('Ada');
    expect(body).toContain(notification.question);
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
