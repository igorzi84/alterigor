const MAX_CACHED_ANSWERS = 20;
const MAX_ANSWER_LENGTH = 1_600;

type CachedAnswer = { answer: string; cachedAt: number };
type CachedAnswers = Record<string, CachedAnswer>;

function normalizeQuestion(question: string): string {
  return question.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

export async function questionFingerprint(question: string): Promise<string> {
  const bytes = new TextEncoder().encode(normalizeQuestion(question));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
}

function readCache(storage: Storage, key: string): CachedAnswers {
  try {
    const value: unknown = JSON.parse(storage.getItem(key) ?? '{}');
    if (typeof value !== 'object' || value === null) return {};

    return Object.fromEntries(
      Object.entries(value).filter(
        ([fingerprint, cached]) =>
          /^[a-f0-9]{64}$/.test(fingerprint) &&
          typeof cached === 'object' &&
          cached !== null &&
          'answer' in cached &&
          typeof cached.answer === 'string' &&
          cached.answer.length <= MAX_ANSWER_LENGTH &&
          'cachedAt' in cached &&
          typeof cached.cachedAt === 'number',
      ),
    ) as CachedAnswers;
  } catch {
    return {};
  }
}

export function getCachedAnswer(
  storage: Storage,
  key: string,
  fingerprint: string,
): string | null {
  return readCache(storage, key)[fingerprint]?.answer ?? null;
}

export function cacheAnswer(
  storage: Storage,
  key: string,
  fingerprint: string,
  answer: string,
): void {
  const entries = Object.entries({
    ...readCache(storage, key),
    [fingerprint]: { answer, cachedAt: Date.now() },
  })
    .sort(([, left], [, right]) => left.cachedAt - right.cachedAt)
    .slice(-MAX_CACHED_ANSWERS);
  storage.setItem(key, JSON.stringify(Object.fromEntries(entries)));
}
