import { describe, expect, it } from 'vitest';

import { site } from '../lib/site';
import { profile } from '../content/profile';

describe('site metadata', () => {
  it('defines a portfolio identity', () => {
    expect(site.name).toBe('AlterIgor');
    expect(site.description).toContain('Platform engineering portfolio');
  });

  it('uses public professional profile links', () => {
    expect(profile.contact.github).toBe('https://github.com/igorzi84');
    expect(profile.contact.linkedin).toBe('https://linkedin.com/in/igorzi');
  });

  it('describes the Helm, Kustomize, and Argo CD deployment work accurately', () => {
    expect(profile.projects[1]).toMatchObject({
      name: 'Microservice Deployment with Helm, Kustomize, and Argo CD',
      technologies: expect.arrayContaining(['Helm', 'Kustomize', 'Argo CD']),
    });
  });

  it('does not require a public deployment URL during local development', () => {
    expect(site.title).toContain('Platform Engineering Portfolio');
  });
});
