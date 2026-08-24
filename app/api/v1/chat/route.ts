import {
  AssistantConfigurationError,
  answerQuestion,
  validateMessage,
} from '@/lib/assistant';
import { consumeChatQuota, validQuotaKey } from '@/lib/quota';

const unavailableResponse = {
  error:
    'The portfolio assistant is temporarily unavailable. Please try again later.',
};

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: 'Send a JSON object with a message.' },
      { status: 400 },
    );
  }

  const message = validateMessage(
    typeof body === 'object' && body !== null && 'message' in body
      ? body.message
      : undefined,
  );

  if (!message) {
    return Response.json(
      { error: 'Message must contain 1 to 1200 characters.' },
      { status: 400 },
    );
  }

  const quotaKey =
    typeof body === 'object' && body !== null && 'quotaKey' in body
      ? body.quotaKey
      : undefined;
  if (!validQuotaKey(quotaKey)) {
    return Response.json(
      { error: 'Start a new chat session before sending a message.' },
      { status: 400 },
    );
  }

  try {
    const { env } = await import('cloudflare:workers');
    if (
      !env.QUOTA_HMAC_SECRET ||
      !(await consumeChatQuota(env.DB, quotaKey, env.QUOTA_HMAC_SECRET))
    ) {
      return Response.json(
        { error: 'Chat request limit reached. Please try again tomorrow.' },
        { status: 429 },
      );
    }
    const answer = await answerQuestion(message);
    return Response.json({ answer });
  } catch (error) {
    const status = error instanceof AssistantConfigurationError ? 503 : 502;
    console.error(
      JSON.stringify({ event: 'assistant_request_failed', status }),
    );
    return Response.json(unavailableResponse, { status });
  }
}
