import { deliverContact, validateContact } from '@/lib/contact';
import { getEnvironment, getNetworkAddress } from '@/lib/env';
import { consumeContactQuota } from '@/lib/quota';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const contact = validateContact(body);
    if (!contact)
      return Response.json(
        { error: 'Enter a valid name, email, and message.' },
        { status: 400 },
      );
    const networkAddress = getNetworkAddress(request);
    const env = await getEnvironment();
    if (!env.QUOTA_HMAC_SECRET)
      return Response.json(
        {
          error:
            'Contact delivery is temporarily unavailable. Please try again later.',
        },
        { status: 503 },
      );
    if (
      !(await consumeContactQuota(
        env.DB,
        networkAddress,
        env.QUOTA_HMAC_SECRET,
      ))
    )
      return Response.json(
        { error: 'Message limit reached. Please try again tomorrow.' },
        { status: 429 },
      );
    await deliverContact(contact, env);
    return Response.json({ ok: true });
  } catch {
    return Response.json(
      {
        error:
          'Contact delivery is temporarily unavailable. Please try again later.',
      },
      { status: 503 },
    );
  }
}
