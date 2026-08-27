'use client';

import { FormEvent, useEffect, useState, useSyncExternalStore } from 'react';
import {
  cacheAnswer,
  getCachedAnswer,
  questionFingerprint,
} from '@/lib/chat-cache';
import { profile } from '@/content/profile';
import { useInsights } from './insights';

const sessionNameKey = 'alterigor-visitor-name';
const cachedAnswersKey = 'alterigor-chat-answer-cache';
const unavailableMessage =
  'The portfolio assistant is temporarily unavailable. Please try again later.';

const subscribeToSessionStorage = () => () => {};

type Message = { role: 'assistant' | 'user'; content: string };
type ChatStatus = { displayName: string; limit: number; remaining: number };

function parseEvent(block: string): { name: string; data: unknown } | null {
  const lines = block.split('\n');
  const name = lines.find((line) => line.startsWith('event: '))?.slice(7);
  const data = lines.find((line) => line.startsWith('data: '))?.slice(6);
  if (!name || !data) return null;
  try {
    return { name, data: JSON.parse(data) };
  } catch {
    return null;
  }
}

export function ChatPanel() {
  const { track } = useInsights();
  const [sessionVersion, setSessionVersion] = useState(0);
  const name = useSyncExternalStore(
    subscribeToSessionStorage,
    () => sessionStorage.getItem(sessionNameKey) ?? '',
    () => '',
  );
  const [draftName, setDraftName] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<ChatStatus | null>(null);
  const [providerStatus, setProviderStatus] = useState('');

  useEffect(() => {
    if (!name) return;
    void fetch('/api/v1/chat')
      .then(async (response) => {
        if (!response.ok) throw new Error();
        const data = (await response.json()) as ChatStatus;
        if (
          typeof data.displayName !== 'string' ||
          typeof data.limit !== 'number' ||
          typeof data.remaining !== 'number'
        ) {
          throw new Error();
        }
        setStatus(data);
      })
      .catch(() => setError(unavailableMessage));
  }, [name, sessionVersion]);

  function startChat(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = draftName.trim().slice(0, 80);
    if (!value) return;
    sessionStorage.setItem(sessionNameKey, value);
    track('chat_start');
    setSessionVersion((version) => version + 1);
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = message.trim();
    if (!question || isSending || status?.remaining === 0) return;
    const nextMessages: Message[] = [
      ...messages,
      { content: question, role: 'user' as const },
    ];
    setMessages(nextMessages);
    setMessage('');
    setError('');
    setIsSending(true);
    try {
      void fetch('/api/v1/chat-notification', {
        body: JSON.stringify({ name, question }),
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        method: 'POST',
      }).catch(() => undefined);
      const fingerprint = await questionFingerprint(question);
      const cachedAnswer = getCachedAnswer(
        sessionStorage,
        cachedAnswersKey,
        fingerprint,
      );
      if (cachedAnswer) {
        setMessages(
          [
            ...nextMessages,
            { content: cachedAnswer, role: 'assistant' as const },
          ].slice(-6),
        );
        return;
      }
      if (status) setProviderStatus(`Trying ${status.displayName}…`);
      const response = await fetch('/api/v1/chat', {
        body: JSON.stringify({ message: question }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      if (!response.ok || !response.body) {
        const body = (await response.json()) as {
          error?: string;
          remaining?: number;
        };
        if (typeof body.remaining === 'number' && status) {
          setStatus({ ...status, remaining: body.remaining });
        }
        throw new Error(body.error);
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let answered = false;
      while (true) {
        const { done, value } = await reader.read();
        buffer += decoder.decode(value, { stream: !done });
        const blocks = buffer.split('\n\n');
        buffer = blocks.pop() ?? '';
        for (const block of blocks) {
          const parsed = parseEvent(block);
          if (
            !parsed ||
            typeof parsed.data !== 'object' ||
            parsed.data === null
          )
            continue;
          const data = parsed.data as {
            answer?: string;
            displayName?: string;
            error?: string;
            remaining?: number;
            type?: string;
          };
          if (
            parsed.name === 'status' &&
            data.type === 'fallback' &&
            data.displayName
          ) {
            setStatus((current) =>
              current
                ? { ...current, displayName: data.displayName! }
                : current,
            );
            setProviderStatus(
              `Model limit reached. Trying ${data.displayName}…`,
            );
          }
          if (typeof data.remaining === 'number' && status) {
            setStatus({ ...status, remaining: data.remaining });
          }
          if (parsed.name === 'answer' && data.answer) {
            answered = true;
            if (data.displayName) {
              setStatus((current) =>
                current
                  ? { ...current, displayName: data.displayName! }
                  : current,
              );
            }
            cacheAnswer(
              sessionStorage,
              cachedAnswersKey,
              fingerprint,
              data.answer,
            );
            setMessages(
              [
                ...nextMessages,
                { content: data.answer, role: 'assistant' as const },
              ].slice(-6),
            );
          }
          if (parsed.name === 'error') throw new Error(data.error);
        }
        if (done) break;
      }
      if (!answered) throw new Error();
    } catch {
      setError(
        'The assistant is temporarily unavailable. Please try again later.',
      );
    } finally {
      setIsSending(false);
      setProviderStatus('');
    }
  }

  if (!name) {
    return (
      <form className="mt-8 space-y-3" onSubmit={startChat}>
        <label className="sr-only" htmlFor="visitor-name">
          Your first name
        </label>
        <div className="flex gap-3">
          <input
            className="min-w-0 flex-1 rounded-lg border border-slate-600 bg-slate-900 px-3 py-2"
            id="visitor-name"
            maxLength={80}
            onChange={(event) => setDraftName(event.target.value)}
            placeholder="Your first name"
            value={draftName}
          />
          <button
            className="rounded-lg bg-cyan-300 px-4 py-2 font-semibold text-slate-950"
            type="submit"
          >
            Start chat
          </button>
        </div>
        <p className="text-xs leading-5 text-slate-300">
          By starting chat, you agree that your entered name and each question
          you submit will be sent to Igor through private Telegram
          notifications. Telegram may retain this information; it is not stored
          by this site.
        </p>
      </form>
    );
  }

  return (
    <div className="mt-8">
      <p className="text-sm text-slate-300">
        Hi {name}. Ask about Igor&apos;s platform engineering work.
      </p>
      {status ? (
        <p className="mt-2 text-sm text-cyan-200">Using {status.displayName}</p>
      ) : null}
      <div className="mt-4" aria-labelledby="example-questions-heading">
        <p
          className="text-sm font-medium text-slate-200"
          id="example-questions-heading"
        >
          Try a question
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {profile.exampleQuestions.map((question) => (
            <button
              className="rounded-full border border-slate-600 px-3 py-1.5 text-left text-sm text-slate-200 transition hover:border-cyan-200 hover:text-cyan-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
              key={question}
              onClick={() => setMessage(question)}
              type="button"
            >
              {question}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 space-y-3" aria-live="polite">
        {messages.map((item, index) => (
          <p
            className={
              item.role === 'user'
                ? 'ml-8 rounded-lg bg-cyan-300 p-3 text-slate-950'
                : 'mr-8 rounded-lg bg-slate-800 p-3'
            }
            key={`${item.role}-${index}`}
          >
            {item.content}
          </p>
        ))}
      </div>
      <form className="mt-4 flex gap-3" onSubmit={sendMessage}>
        <label className="sr-only" htmlFor="chat-message">
          Question
        </label>
        <input
          className="min-w-0 flex-1 rounded-lg border border-slate-600 bg-slate-900 px-3 py-2"
          id="chat-message"
          maxLength={1200}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Ask a question"
          value={message}
        />
        <button
          className="rounded-lg bg-cyan-300 px-4 py-2 font-semibold text-slate-950 disabled:opacity-50"
          disabled={isSending || status?.remaining === 0}
          type="submit"
        >
          {isSending ? 'Sending…' : 'Send'}
        </button>
      </form>
      {error ? (
        <p className="mt-3 text-sm text-rose-300" role="alert">
          {error}
        </p>
      ) : null}
      {providerStatus ? (
        <p className="mt-3 text-sm text-cyan-200" role="status">
          {providerStatus}
        </p>
      ) : null}
      {status ? (
        <p className="mt-3 text-sm text-slate-300">
          {status.remaining} of {status.limit} questions left
        </p>
      ) : null}
      {status?.remaining === 0 ? (
        <p className="mt-3 text-sm text-amber-200" role="status">
          Your five-question chat session is complete.
        </p>
      ) : null}
      <p className="mt-3 text-xs text-slate-400">
        Your name stays in this browser session. Submitted questions are sent to
        Igor through Telegram and are not stored by this site.
      </p>
    </div>
  );
}
