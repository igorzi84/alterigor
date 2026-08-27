'use client';

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from 'react';

import type { InsightEvent } from '@/lib/insights';

const consentKey = 'alterigor-metrics-consent';
const sessionKey = 'alterigor-metrics-session';
const consentEvent = 'alterigor-metrics-consent-change';

type Insights = {
  track: (event: Exclude<InsightEvent, 'first_visit'>) => void;
};

const InsightsContext = createContext<Insights>({ track: () => {} });

function subscribeToConsent(callback: () => void) {
  window.addEventListener(consentEvent, callback);
  return () => window.removeEventListener(consentEvent, callback);
}

function storedConsent(): 'accepted' | 'declined' | null {
  const value = localStorage.getItem(consentKey);
  return value === 'accepted' || value === 'declined' ? value : null;
}

function sessionId(): string {
  const existing = sessionStorage.getItem(sessionKey);
  if (existing) return existing;
  const value = crypto.randomUUID();
  sessionStorage.setItem(sessionKey, value);
  return value;
}

export function InsightsProvider({ children }: { children: ReactNode }) {
  const consent = useSyncExternalStore(
    subscribeToConsent,
    storedConsent,
    () => null,
  );

  const send = useMemo(
    () =>
      (event: InsightEvent, optionalMetrics = false) => {
        void fetch('/api/v1/events', {
          body: JSON.stringify({
            ...(optionalMetrics ? { consent: true } : {}),
            event,
            sessionId: sessionId(),
          }),
          headers: { 'Content-Type': 'application/json' },
          keepalive: true,
          method: 'POST',
        }).catch(() => undefined);
      },
    [],
  );

  const track = useMemo(
    () => (event: Exclude<InsightEvent, 'first_visit'>) => {
      if (consent === 'accepted') send(event, true);
    },
    [consent, send],
  );

  useEffect(() => {
    send('first_visit');
  }, [send]);

  function decide(value: 'accepted' | 'declined') {
    localStorage.setItem(consentKey, value);
    window.dispatchEvent(new Event(consentEvent));
  }

  return (
    <InsightsContext.Provider value={{ track }}>
      {children}
      {consent === null ? (
        <aside className="fixed inset-x-4 bottom-4 z-10 mx-auto max-w-xl rounded-xl border border-slate-600 bg-slate-900 p-4 text-sm shadow-2xl">
          <p className="font-semibold text-slate-100">
            Optional anonymous metrics
          </p>
          <p className="mt-1 leading-6 text-slate-300">
            One anonymous browser-session visit sends a generic alert to Igor.
            Allow optional interaction metrics to send anonymous alerts for chat
            starts, GitHub or LinkedIn clicks, and contact activity. These
            anonymous metrics never collect your name, chat, message, email, IP
            address, or browsing profile; hashed event records are deleted after
            30 days.
          </p>
          <div className="mt-3 flex gap-3">
            <button
              className="rounded-lg bg-cyan-300 px-3 py-2 font-semibold text-slate-950"
              onClick={() => decide('accepted')}
              type="button"
            >
              Allow anonymous metrics
            </button>
            <button
              className="rounded-lg border border-slate-500 px-3 py-2 text-slate-100"
              onClick={() => decide('declined')}
              type="button"
            >
              No thanks
            </button>
          </div>
        </aside>
      ) : null}
    </InsightsContext.Provider>
  );
}

export function useInsights() {
  return useContext(InsightsContext);
}
