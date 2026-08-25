import { describe, expect, it } from 'vitest';

import {
  cacheAnswer,
  getCachedAnswer,
  questionFingerprint,
} from '../lib/chat-cache';

function fakeStorage(): Storage {
  const data = new Map<string, string>();
  return {
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: () => null,
    get length() {
      return data.size;
    },
    removeItem: (key) => data.delete(key),
    setItem: (key, value) => data.set(key, value),
  };
}

describe('session-only chat answer cache', () => {
  it('uses one fingerprint for whitespace and case-only repeats', async () => {
    await expect(questionFingerprint('  What does Igor do? ')).resolves.toBe(
      await questionFingerprint('what does igor do?'),
    );
  });

  it('returns a cached answer without retaining the question text', async () => {
    const storage = fakeStorage();
    const fingerprint = await questionFingerprint('What does Igor do?');

    cacheAnswer(storage, 'answers', fingerprint, 'He is a platform engineer.');

    expect(getCachedAnswer(storage, 'answers', fingerprint)).toBe(
      'He is a platform engineer.',
    );
    expect(storage.getItem('answers')).not.toContain('What does Igor do?');
  });
});
