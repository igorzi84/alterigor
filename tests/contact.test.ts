import { describe, expect, it, vi } from 'vitest';

import { deliverContact, validateContact } from '../lib/contact';
import { POST } from '../app/api/v1/contact/route';

const request = {
  email: 'visitor@example.com',
  message: 'Hello Igor',
  name: 'Visitor',
};
const environment = {
  CONTACT_FROM_EMAIL: 'portfolio@example.com',
  CONTACT_TO_EMAIL: 'igor@example.com',
  RESEND_API_KEY: 'test-key',
};

describe('contact delivery', () => {
  it('validates a voluntary contact request', () => {
    expect(validateContact(request)).toEqual(request);
    expect(validateContact({ ...request, email: 'not-an-email' })).toBeNull();
    expect(validateContact({ ...request, message: '' })).toBeNull();
  });

  it('sends a validated message through Resend with a reply address', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 200 }));
    await expect(
      deliverContact(request, environment, fetchMock),
    ).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer test-key' }),
        method: 'POST',
      }),
    );
    expect(fetchMock.mock.calls[0][1]?.body).toContain('visitor@example.com');
  });

  it('fails without configuration or when Resend rejects delivery', async () => {
    await expect(
      deliverContact(request, {}, vi.fn<typeof fetch>()),
    ).rejects.toThrow('not configured');
    await expect(
      deliverContact(
        request,
        environment,
        vi
          .fn<typeof fetch>()
          .mockResolvedValue(new Response(null, { status: 500 })),
      ),
    ).rejects.toThrow('failed');
  });

  it('rejects requests without a Cloudflare network address', async () => {
    const response = await POST(
      new Request('https://alterigor.example/api/v1/contact', {
        body: JSON.stringify(request),
        method: 'POST',
      }),
    );
    expect(response.status).toBe(400);
  });
});
