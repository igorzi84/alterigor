import { describe, expect, it } from 'vitest';

import {
  consumeChatQuota,
  consumeContactQuota,
  validQuotaKey,
} from '../lib/quota';

function fakeDatabase() {
  let count = 0;
  const statement = {
    bind: () => statement,
    first: async () => ({ count: ++count }),
    run: async () => ({}),
  };
  return { prepare: () => statement } as unknown as D1Database;
}

describe('chat quota', () => {
  const quotaKey = '00000000-0000-4000-8000-000000000000';

  it('accepts only a UUID-shaped anonymous browser-session key', () => {
    expect(validQuotaKey(quotaKey)).toBe(true);
    expect(validQuotaKey('visitor@example.com')).toBe(false);
  });

  it('rejects the twenty-first request before a provider call', async () => {
    const database = fakeDatabase();

    for (let request = 0; request < 20; request += 1) {
      await expect(
        consumeChatQuota(database, quotaKey, 'test-secret'),
      ).resolves.toBe(true);
    }

    await expect(
      consumeChatQuota(database, quotaKey, 'test-secret'),
    ).resolves.toBe(false);
  });

  it('fails closed when quota storage is unavailable', async () => {
    const database = {
      prepare: () => {
        throw new Error('D1 unavailable');
      },
    } as unknown as D1Database;

    await expect(
      consumeChatQuota(database, quotaKey, 'test-secret'),
    ).rejects.toThrow('D1 unavailable');
  });

  it('limits contacts by a server-derived network key', async () => {
    const database = fakeDatabase();

    for (let request = 0; request < 5; request += 1) {
      await expect(
        consumeContactQuota(database, '203.0.113.7', 'test-secret'),
      ).resolves.toBe(true);
    }

    await expect(
      consumeContactQuota(database, '203.0.113.7', 'test-secret'),
    ).resolves.toBe(false);
  });
});
