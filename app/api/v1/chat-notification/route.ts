import { getEnvironment, getNetworkAddress } from '@/lib/env';
import {
  notifyTelegramChatExchanges,
  validateChatNotificationRequest,
} from '@/lib/insights';
import { consumeInsightQuota } from '@/lib/quota';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Send a JSON object.' }, { status: 400 });
  }
  const notification = validateChatNotificationRequest(body);
  if (!notification) {
    return Response.json({ error: 'Invalid notification.' }, { status: 400 });
  }

  try {
    const env = await getEnvironment();
    const networkAddress = getNetworkAddress(request);
    if (
      env.QUOTA_HMAC_SECRET &&
      (await consumeInsightQuota(env.DB, networkAddress, env.QUOTA_HMAC_SECRET))
    ) {
      await notifyTelegramChatExchanges(notification, env);
    }
  } catch {
    console.error(JSON.stringify({ event: 'chat_notification_failed' }));
  }
  return new Response(null, { status: 204 });
}
