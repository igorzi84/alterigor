export type ContactRequest = { name: string; email: string; message: string };
type ContactDeliveryEnvironment = {
  RESEND_API_KEY?: string;
  CONTACT_FROM_EMAIL?: string;
  CONTACT_TO_EMAIL?: string;
};

export function validateContact(value: unknown): ContactRequest | null {
  if (typeof value !== 'object' || value === null) return null;
  const { email, message, name } = value as Record<string, unknown>;
  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof message !== 'string'
  )
    return null;
  const request = {
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
  };
  return request.name.length > 0 &&
    request.name.length <= 100 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.email) &&
    request.message.length > 0 &&
    request.message.length <= 4000
    ? request
    : null;
}

export async function deliverContact(
  request: ContactRequest,
  environment: ContactDeliveryEnvironment,
  fetchImplementation: typeof fetch = fetch,
) {
  const apiKey = environment.RESEND_API_KEY?.trim();
  const from = environment.CONTACT_FROM_EMAIL?.trim();
  const to = environment.CONTACT_TO_EMAIL?.trim();
  if (!apiKey || !from || !to) throw new Error('Contact is not configured.');
  const response = await fetchImplementation('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: request.email,
      subject: `Portfolio contact from ${request.name}`,
      text: `${request.message}\n\nReply to: ${request.email}`,
    }),
  });
  if (!response.ok) throw new Error('Contact delivery failed.');
}
