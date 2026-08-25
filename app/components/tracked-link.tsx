'use client';

import { AnchorHTMLAttributes } from 'react';

import type { InsightEvent } from '@/lib/insights';
import { useInsights } from './insights';

export function TrackedLink({
  event,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  event: Exclude<InsightEvent, 'first_visit'>;
}) {
  const { track } = useInsights();
  return <a {...props} onClick={() => track(event)} />;
}
