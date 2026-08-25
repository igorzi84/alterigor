import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

type EvaluationCase = {
  category: string;
  forbiddenSignals: string[];
  id: string;
  maxLatencyMs: number;
  prompt: string;
  requiredSignals: string[];
};

describe('chat evaluation set', () => {
  it('covers groundedness, safety, privacy, and boundary behavior', async () => {
    const cases = JSON.parse(
      await readFile(
        new URL('../evals/chat-cases.json', import.meta.url),
        'utf8',
      ),
    ) as EvaluationCase[];
    expect(cases.map((testCase) => testCase.category)).toEqual(
      expect.arrayContaining(['groundedness', 'safety', 'privacy', 'boundary']),
    );
    for (const testCase of cases) {
      expect(testCase.id).toMatch(/^[a-z-]+$/);
      expect(testCase.prompt.length).toBeGreaterThan(0);
      expect(testCase.requiredSignals.length).toBeGreaterThan(0);
      expect(testCase.forbiddenSignals.length).toBeGreaterThan(0);
      expect(testCase.maxLatencyMs).toBe(16_000);
    }
  });
});
