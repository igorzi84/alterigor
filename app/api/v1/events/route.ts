import { recordInsightSafely, validateInsightRequest } from '@/lib/insights';
import { getEnvironment, getNetworkAddress } from '@/lib/env';
import { consumeInsightQuota } from '@/lib/quota';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Send a JSON object.' }, { status: 400 });
  }
  const insight = validateInsightRequest(body);
  if (!insight) {
    return Response.json({ error: 'Invalid event.' }, { status: 400 });
  }
  const env = await getEnvironment();
  const networkAddress = getNetworkAddress(request);
  const country =
    typeof request.cf?.country === 'string' ? request.cf.country : undefined;
  try {
    if (
      networkAddress &&
      env.QUOTA_HMAC_SECRET &&
      (await consumeInsightQuota(env.DB, networkAddress, env.QUOTA_HMAC_SECRET))
    ) {
      await recordInsightSafely(insight, env, {
        country,
      });
    }
  } catch {
    console.error(JSON.stringify({ event: 'visitor_insight_failed' }));
  }
  return new Response(null, { status: 204 });
}
