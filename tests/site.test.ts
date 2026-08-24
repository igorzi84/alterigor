import { describe, expect, it } from 'vitest';

import { site } from '../lib/site';

describe('site metadata', () => {
  it('defines a portfolio identity', () => {
    expect(site.name).toBe('AlterIgor');
    expect(site.description).toContain('AI portfolio assistant');
  });
});
