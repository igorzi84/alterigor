'use client';

import { FormEvent, useState } from 'react';

const sessionNameKey = 'alterigor-visitor-name';
const quotaKeyKey = 'alterigor-chat-quota-key';

type Message = { role: 'assistant' | 'user'; content: string };

export function ChatPanel() {
  const [name, setName] = useState(() =>
    typeof window === 'undefined'
      ? ''
      : (sessionStorage.getItem(sessionNameKey) ?? ''),
  );
  const [draftName, setDraftName] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);

  function startChat(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = draftName.trim().slice(0, 80);
    if (!value) return;
    sessionStorage.setItem(sessionNameKey, value);
    setName(value);
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = message.trim();
    if (!question || isSending) return;
    const nextMessages: Message[] = [
      ...messages,
      { content: question, role: 'user' as const },
    ];
    setMessages(nextMessages);
    setMessage('');
    setError('');
    setIsSending(true);
    try {
      const quotaKey =
        sessionStorage.getItem(quotaKeyKey) ?? crypto.randomUUID();
      sessionStorage.setItem(quotaKeyKey, quotaKey);
      const response = await fetch('/api/v1/chat', {
        body: JSON.stringify({ message: question, quotaKey }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const body = (await response.json()) as {
        answer?: string;
        error?: string;
      };
      if (!response.ok || !body.answer) throw new Error(body.error);
      setMessages(
        [
          ...nextMessages,
          { content: body.answer, role: 'assistant' as const },
        ].slice(-6),
      );
    } catch {
      setError(
        'The assistant is temporarily unavailable. Please try again later.',
      );
    } finally {
      setIsSending(false);
    }
  }

  if (!name) {
    return (
      <form className="mt-8 flex gap-3" onSubmit={startChat}>
        <label className="sr-only" htmlFor="visitor-name">
          Your first name
        </label>
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
      </form>
    );
  }

  return (
    <div className="mt-8">
      <p className="text-sm text-slate-300">
        Hi {name}. Ask about Igor&apos;s platform engineering work.
      </p>
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
          disabled={isSending}
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
      <p className="mt-3 text-xs text-slate-400">
        Your name and this conversation stay in this browser session.
      </p>
    </div>
  );
}
