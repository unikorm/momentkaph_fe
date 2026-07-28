/**
 * Wraps matchMedia with a change callback, replacing Angular CDK's BreakpointObserver.
 * Returns an unsubscribe function — callers MUST call it from Page.destroy(), since a
 * matchMedia listener is document-scoped and outlives the page's DOM otherwise.
 */
export function watchMedia(query: string, onChange: (matches: boolean) => void): () => void {
  const mql = matchMedia(query);
  const handler = () => onChange(mql.matches);
  mql.addEventListener('change', handler);
  onChange(mql.matches);
  return () => mql.removeEventListener('change', handler);
}

/** Breakpoint shared by gallery-type's asset choice (JS) and its grid layout (CSS, see gallery-type.css). */
export const MOBILE_QUERY = '(max-width: 700px)';
