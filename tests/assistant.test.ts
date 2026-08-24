import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  AssistantConfigurationError,
  answerQuestion,
  MAX_MESSAGE_CHARACTERS,
  validateMessage,
} from '../lib/assistant';
import { POST } from '../app/api/v1/chat/route';

const environment = {
  LLM_API_KEY: 'test-key',
  LLM_BASE_URL: 'https://provider.example/v1/',
  LLM_MODEL: 'free-model',
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
    vi.stubEnv('LLM_API_KEY', 'test-key');
    vi.stubEnv('LLM_BASE_URL', 'https://provider.example/v1');
    vi.stubEnv('LLM_MODEL', 'free-model');
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

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error:
        'The portfolio assistant is temporarily unavailable. Please try again later.',
    });
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
});
