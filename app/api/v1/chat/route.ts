import {
  AssistantConfigurationError,
  answerQuestion,
  getProviderSettings,
  validateMessage,
} from '@/lib/assistant';
import { getEnvironment } from '@/lib/env';
import {
  CHAT_SESSION_LIMIT,
  chatQuotaRemaining,
  consumeChatQuota,
  validQuotaKey,
} from '@/lib/quota';

const unavailableMessage =
  'The portfolio assistant is temporarily unavailable. Please try again later.';

function event(name: string, payload: object): Uint8Array {
  return new TextEncoder().encode(
    `event: ${name}\ndata: ${JSON.stringify(payload)}\n\n`,
  );
}

const sessionCookieName = 'alterigor_chat_session';

function sessionId(request: Request): { value: string; isNew: boolean } {
  const cookies = request.headers.get('Cookie') ?? '';
  const value = cookies
    .split(';')
    .map((cookie) => cookie.trim().split('=', 2))
    .find(([name]) => name === sessionCookieName)?.[1];
  return validQuotaKey(value)
    ? { value, isNew: false }
    : { value: crypto.randomUUID(), isNew: true };
}

function sessionHeaders(session: { value: string; isNew: boolean }) {
  const headers = new Headers({ 'Cache-Control': 'no-store' });
  if (session.isNew) {
    headers.set(
      'Set-Cookie',
      `${sessionCookieName}=${session.value}; HttpOnly; Path=/api/v1/chat; SameSite=Lax; Secure`,
    );
  }
  return headers;
}

function streamResponse(
  callback: (
    controller: ReadableStreamDefaultController<Uint8Array>,
  ) => Promise<void>,
  headers: Headers,
) {
  return new Response(
    new ReadableStream({
      async start(controller) {
        try {
          await callback(controller);
        } finally {
          controller.close();
        }
      },
    }),
    {
      headers: new Headers({
        ...Object.fromEntries(headers),
        'Content-Type': 'text/event-stream; charset=utf-8',
      }),
    },
  );
}

async function environment() {
  return getEnvironment();
}

type ChatDependencies = {
  answerQuestion: typeof answerQuestion;
  chatQuotaRemaining: typeof chatQuotaRemaining;
  consumeChatQuota: typeof consumeChatQuota;
  getEnvironment: typeof environment;
  getProviderSettings: typeof getProviderSettings;
};

const defaultDependencies: ChatDependencies = {
  answerQuestion,
  chatQuotaRemaining,
  consumeChatQuota,
  getEnvironment: environment,
  getProviderSettings,
};

export function createChatHandlers(overrides: Partial<ChatDependencies> = {}) {
  const dependencies = { ...defaultDependencies, ...overrides };

  async function GET(request: Request) {
    const session = sessionId(request);
    const headers = sessionHeaders(session);

    try {
      const env = await dependencies.getEnvironment();
      const settings = dependencies.getProviderSettings(env);
      if (!env.QUOTA_HMAC_SECRET) throw new AssistantConfigurationError();
      const remaining = await chatQuotaRemaining(
        env.DB,
        session.value,
        env.QUOTA_HMAC_SECRET,
      );
      return Response.json(
        {
          displayName: settings.providers[0].displayName,
          limit: CHAT_SESSION_LIMIT,
          remaining,
        },
        { headers },
      );
    } catch {
      return Response.json(
        { error: unavailableMessage },
        { headers, status: 503 },
      );
    }
  }

  async function POST(request: Request) {
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

    const session = sessionId(request);
    const headers = sessionHeaders(session);

    try {
      const env = await dependencies.getEnvironment();
      const settings = dependencies.getProviderSettings(env);
      if (!env.QUOTA_HMAC_SECRET) throw new AssistantConfigurationError();
      if (
        !(await dependencies.consumeChatQuota(
          env.DB,
          session.value,
          env.QUOTA_HMAC_SECRET,
        ))
      ) {
        return Response.json(
          {
            error: 'Your five-question chat session is complete.',
            limit: CHAT_SESSION_LIMIT,
            remaining: 0,
          },
          { headers, status: 429 },
        );
      }
      const remaining = await dependencies.chatQuotaRemaining(
        env.DB,
        session.value,
        env.QUOTA_HMAC_SECRET,
      );
      return streamResponse(async (controller) => {
        let activeDisplayName = settings.providers[0].displayName;
        try {
          const answer = await dependencies.answerQuestion(
            message,
            env,
            fetch,
            (displayName) => {
              activeDisplayName = displayName;
              controller.enqueue(
                event('status', { displayName, type: 'fallback' }),
              );
            },
          );
          controller.enqueue(
            event('answer', {
              answer,
              displayName: activeDisplayName,
              remaining,
            }),
          );
        } catch (error) {
          const status =
            error instanceof AssistantConfigurationError ? 503 : 502;
          console.error(
            JSON.stringify({ event: 'assistant_request_failed', status }),
          );
          controller.enqueue(
            event('error', { error: unavailableMessage, remaining }),
          );
        }
      }, headers);
    } catch (error) {
      const status = error instanceof AssistantConfigurationError ? 503 : 502;
      console.error(
        JSON.stringify({ event: 'assistant_request_failed', status }),
      );
      return Response.json({ error: unavailableMessage }, { headers, status });
    }
  }

  return { GET, POST };
}

const handlers = createChatHandlers();

export const GET = handlers.GET;
export const POST = handlers.POST;
