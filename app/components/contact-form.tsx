'use client';
import { FormEvent, useState } from 'react';
import { useInsights } from './insights';
export function ContactForm() {
  const { track } = useInsights();
  const [status, setStatus] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/v1/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      if (response.ok) {
        setStatus('Thanks — your message was sent.');
        event.currentTarget.reset();
        track('contact_submission');
      } else {
        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        setStatus(
          data.error ?? 'Message could not be sent. Please try again later.',
        );
      }
    } catch {
      setStatus('Message could not be sent. Please try again later.');
    }
  }
  return (
    <form
      className="mt-8 grid gap-3"
      onFocus={() => track('contact_start')}
      onSubmit={submit}
    >
      <label>
        Name
        <input
          className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 p-3"
          maxLength={100}
          name="name"
          required
        />
      </label>
      <label>
        Email
        <input
          className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 p-3"
          name="email"
          required
          type="email"
        />
      </label>
      <label>
        Message
        <textarea
          className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 p-3"
          name="message"
          maxLength={4000}
          required
          rows={5}
        />
      </label>
      <button className="w-fit rounded-lg bg-cyan-300 px-4 py-2 font-semibold text-slate-950">
        Send message
      </button>
      <p className="text-xs text-slate-400">
        Your details are used only to reply. Messages are sent by email and are
        not stored by this site.
      </p>
      {status ? <p role="status">{status}</p> : null}
    </form>
  );
}
