import { useState, useEffect, useRef } from 'react';

// How often the displayed value re-renders. We update inside requestAnimationFrame
// (~60fps), but only commit a new state if at least DISPLAY_TICK_MS has passed
// since the last commit — keeps the rendered number readable when the rate is
// fast enough that 60fps would just smear digits.
const DISPLAY_TICK_MS = 50;

// Smoothly animate an integer counter that grows linearly at `cps` per second
// from a `quantity` baseline. The baseline is rebased whenever the underlying
// `quantity` or `cps` changes — typically when the backend confirms a save or
// the user changes buildings.
//
// Returns an integer suitable for direct rendering (e.g. cookies counter).
export function useAnimatedQuantity(quantity, cps) {
  const [displayed, set_displayed] = useState(quantity);
  const base_ref = useRef({ quantity, cps, time: performance.now() });
  const last_paint_ref = useRef(0);

  useEffect(() => {
    base_ref.current = { quantity, cps, time: performance.now() };
  }, [quantity, cps]);

  useEffect(() => {
    let raf;
    const tick = () => {
      const now = performance.now();
      if (now - last_paint_ref.current >= DISPLAY_TICK_MS) {
        const { quantity: q, cps: c, time } = base_ref.current;
        set_displayed(Math.floor(q + c * (now - time) / 1000));
        last_paint_ref.current = now;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return displayed;
}
