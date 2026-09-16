import { describe, expect, it } from 'vitest';

import { canSendFirstVisit } from '@/lib/visit-alert';

describe('canSendFirstVisit', () => {
  it('allows an unsent visit only while the page is visible', () => {
    expect(canSendFirstVisit('visible', false)).toBe(true);
  });

  it('rejects hidden pages and duplicate sends', () => {
    expect(canSendFirstVisit('hidden', false)).toBe(false);
    expect(canSendFirstVisit('visible', true)).toBe(false);
  });
});
