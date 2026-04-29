import { useEffect, useRef } from 'react';

export function useEscapeKey(handler, enabled = true) {
  const handler_ref = useRef(handler);
  useEffect(() => { handler_ref.current = handler; });

  useEffect(() => {
    if (!enabled) return;
    const listener = (e) => { if (e.key === 'Escape') handler_ref.current(); };
    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, [enabled]);
}
