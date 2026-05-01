import { useEffect, useRef } from 'react';

// Fire `handler` when a mousedown happens outside any element matching
// `selector`. Used by popovers (music player, volume control) to close on
// click-outside. `enabled` lets callers attach the listener only while open.
export function useOutsideClick(selector, handler, enabled = true) {
  const handler_ref = useRef(handler);
  useEffect(() => { handler_ref.current = handler; });

  useEffect(() => {
    if (!enabled) return;
    const listener = (e) => {
      if (!e.target.closest(selector)) handler_ref.current();
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [enabled, selector]);
}
