import { describe, expect, it } from 'vitest';

import { additionalChatKnowledge } from '../content/public-chat-knowledge';

describe('public chat knowledge', () => {
  it('contains reviewed professional capabilities', () => {
    expect(additionalChatKnowledge).toEqual(
      expect.arrayContaining([
        expect.stringContaining('TLS/PKI'),
        expect.stringContaining('Temporal'),
        expect.stringContaining('Kubernetes'),
        expect.stringContaining('observability'),
      ]),
    );
  });

  it('excludes repository analysis and internal implementation details', () => {
    expect(additionalChatKnowledge.join('\n')).not.toMatch(
      /RCP|RCE|GlobalSign|GCS|NS1|Jira|Slack|repository evidence|commit/i,
    );
  });
});
