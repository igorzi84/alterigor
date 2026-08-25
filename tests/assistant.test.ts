import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  AssistantConfigurationError,
  answerQuestion,
  MAX_MESSAGE_CHARACTERS,
  validateMessage,
} from '../lib/assistant';
import type { AppEnvironment } from '../lib/env';
import { createChatHandlers, POST } from '../app/api/v1/chat/route';

const environment = {
  LLM_PROVIDERS: JSON.stringify([
    {
      apiKeyEnv: 'TEST_PRIMARY_KEY',
      baseUrl: 'https://provider.example/v1/',
      displayName: 'Primary model',
      model: 'free-model',
    },
  ]),
  TEST_PRIMARY_KEY: 'test-key',
};

describe('assistant provider', () => {
  it('sends a grounded request to an OpenAI-compatible provider', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: 'Grounded answer.' } }],
        }),
        { status: 200 },
      ),
    );

    await expect(
      answerQuestion(
        'What is Igor’s GitOps experience?',
        environment,
        fetchMock,
      ),
    ).resolves.toBe('Grounded answer.');

    const [url, request] = fetchMock.mock.calls[0];
    expect(url).toBe('https://provider.example/v1/chat/completions');
    expect(request?.headers).toMatchObject({
      Authorization: 'Bearer test-key',
    });
    expect(JSON.parse(request?.body as string)).toMatchObject({
      max_completion_tokens: 400,
      model: 'free-model',
      temperature: 0,
    });
    const requestBody = JSON.parse(request?.body as string) as {
      messages: Array<{ content: string }>;
    };
    expect(requestBody.messages[0].content).toContain(
      'Do not invent, infer, or\nexaggerate',
    );
    expect(requestBody.messages[0].content).toContain(
      'Microservice Deployment with Helm, Kustomize, and Argo CD',
    );
  });

  it('rejects missing provider configuration without exposing a secret', async () => {
    await expect(answerQuestion('Hello', {})).rejects.toBeInstanceOf(
      AssistantConfigurationError,
    );
  });

  it('uses a configured fallback only after a capacity response', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 429 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            choices: [{ message: { content: 'Fallback answer.' } }],
          }),
          { status: 200 },
        ),
      );
    const transitions: string[] = [];

    await expect(
      answerQuestion(
        'Hello',
        {
          ...environment,
          GROQ_API_KEY: 'groq-test-key',
          LLM_PROVIDERS: JSON.stringify([
            {
              apiKeyEnv: 'TEST_PRIMARY_KEY',
              baseUrl: 'https://provider.example/v1/',
              displayName: 'Primary model',
              model: 'free-model',
            },
            {
              apiKeyEnv: 'GROQ_API_KEY',
              baseUrl: 'https://groq.example/openai/v1',
              displayName: 'Backup model',
              model: 'backup-model',
            },
          ]),
        },
        fetchMock,
        (displayName) => {
          transitions.push(displayName);
        },
      ),
    ).resolves.toBe('Fallback answer.');

    expect(transitions).toEqual(['Backup model']);
    expect(fetchMock.mock.calls[1][0]).toBe(
      'https://groq.example/openai/v1/chat/completions',
    );
    expect(fetchMock.mock.calls[1][1]?.headers).toMatchObject({
      Authorization: 'Bearer groq-test-key',
    });
    expect(
      JSON.parse(fetchMock.mock.calls[1][1]?.body as string),
    ).toMatchObject({
      model: 'backup-model',
    });
  });

  it('fails closed when a fallback references an unavailable secret', async () => {
    await expect(
      answerQuestion('Hello', {
        ...environment,
        LLM_PROVIDERS: JSON.stringify([
          {
            apiKeyEnv: 'MISSING_PROVIDER_KEY',
            baseUrl: 'https://provider.example/v1',
            displayName: 'Backup model',
            model: 'backup-model',
          },
        ]),
      }),
    ).rejects.toBeInstanceOf(AssistantConfigurationError);
  });

  it('rejects invalid visitor messages', () => {
    expect(validateMessage('')).toBeNull();
    expect(validateMessage('x'.repeat(MAX_MESSAGE_CHARACTERS + 1))).toBeNull();
    expect(validateMessage({ message: 'Hello' })).toBeNull();
    expect(validateMessage('  Hello  ')).toBe('Hello');
  });
});

describe('chat endpoint', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('returns a generic unavailable response when the provider fails', async () => {
    vi.stubEnv('TEST_PRIMARY_KEY', 'test-key');
    vi.stubEnv('QUOTA_HMAC_SECRET', 'test-secret');
    vi.stubEnv(
      'LLM_PROVIDERS',
      JSON.stringify([
        {
          apiKeyEnv: 'TEST_PRIMARY_KEY',
          baseUrl: 'https://provider.example/v1',
          displayName: 'Primary model',
          model: 'free-model',
        },
      ]),
    );
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response(null, { status: 500 })),
    );

    const response = await POST(
      new Request('https://alterigor.example/api/v1/chat', {
        body: JSON.stringify({
          message: 'Hello',
          quotaKey: '00000000-0000-4000-8000-000000000000',
        }),
        method: 'POST',
      }),
    );

    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toContain('event: error');
    expect(text).toContain(
      'The portfolio assistant is temporarily unavailable. Please try again later.',
    );
  });

  it('rejects malformed requests before contacting a provider', async () => {
    const response = await POST(
      new Request('https://alterigor.example/api/v1/chat', {
        body: JSON.stringify({ message: '' }),
        method: 'POST',
      }),
    );

    expect(response.status).toBe(400);
  });

  it('does not call a provider when the session quota rejects a request', async () => {
    const answerQuestionMock = vi.fn<typeof answerQuestion>();
    const consumeQuotaMock = vi.fn().mockResolvedValue(false);
    const { POST: quotaLimitedPost } = createChatHandlers({
      answerQuestion: answerQuestionMock,
      consumeChatQuota: consumeQuotaMock,
      getEnvironment: async () =>
        ({
          DB: {} as D1Database,
          LLM_PROVIDERS: JSON.stringify([
            {
              apiKeyEnv: 'TEST_PROVIDER_KEY',
              baseUrl: 'https://provider.example/v1',
              displayName: 'Test provider',
              model: 'test-model',
            },
          ]),
          QUOTA_HMAC_SECRET: 'test-secret',
          TEST_PROVIDER_KEY: 'test-key',
        }) as AppEnvironment,
    });

    const response = await quotaLimitedPost(
      new Request('https://alterigor.example/api/v1/chat', {
        body: JSON.stringify({ message: 'Hello' }),
        method: 'POST',
      }),
    );

    expect(response.status).toBe(429);
    expect(consumeQuotaMock).toHaveBeenCalledOnce();
    expect(answerQuestionMock).not.toHaveBeenCalled();
  });
});
