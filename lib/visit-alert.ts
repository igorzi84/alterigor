export const VISIBLE_VISIT_DWELL_MS = 5_000;

export function canSendFirstVisit(
  visibilityState: DocumentVisibilityState,
  alreadySent: boolean,
): boolean {
  return visibilityState === 'visible' && !alreadySent;
}
