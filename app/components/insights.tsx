'use client';

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react';

import type { InsightEvent } from '@/lib/insights';
import { canSendFirstVisit, VISIBLE_VISIT_DWELL_MS } from '@/lib/visit-alert';

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
  const existing = localStorage.getItem(sessionKey);
  if (existing) return existing;
  const value = crypto.randomUUID();
  localStorage.setItem(sessionKey, value);
  return value;
}

export function InsightsProvider({ children }: { children: ReactNode }) {
  const firstVisitSent = useRef(false);
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
    let timer: ReturnType<typeof setTimeout> | undefined;

    function cancel() {
      if (timer !== undefined) clearTimeout(timer);
      timer = undefined;
    }

    function schedule() {
      cancel();
      if (
        !canSendFirstVisit(document.visibilityState, firstVisitSent.current)
      ) {
        return;
      }
      timer = setTimeout(() => {
        if (
          !canSendFirstVisit(document.visibilityState, firstVisitSent.current)
        ) {
          return;
        }
        firstVisitSent.current = true;
        send('first_visit');
      }, VISIBLE_VISIT_DWELL_MS);
    }

    function onVisibilityChange() {
      if (document.visibilityState === 'visible') schedule();
      else cancel();
    }

    document.addEventListener('visibilitychange', onVisibilityChange);
    schedule();
    return () => {
      cancel();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
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
            One anonymous browser-session visit sends an alert to Igor with an
            approximate country and browser family based on your connection.
            Allow optional interaction metrics to send similar alerts for chat
            starts, GitHub or LinkedIn clicks, and contact activity. These
            anonymous metrics never collect your name, chat, message, email, IP
            address, browser version, operating system, or browsing profile;
            hashed event records are deleted after 30 days.
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
