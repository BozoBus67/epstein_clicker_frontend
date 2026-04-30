import { SCROLL_TIERS } from '../shared/constants';

const face_modules = import.meta.glob('../assets/master_scroll_faces/*', { eager: true });
export const FACES = Object.keys(face_modules).sort().map(k => face_modules[k].default);

export const TOOLTIP_W = 200;
const TOOLTIP_H = 50;
const GAP = 8;

export function get_tier(count) {
  for (const { min, tier } of SCROLL_TIERS) {
    if (count >= min) return tier;
  }
  return 0;
}

export function get_next_tier(count) {
  const sorted = [...SCROLL_TIERS].sort((a, b) => a.min - b.min);
  for (const { min, tier } of sorted) {
    if (count < min) return { needed: min, tier };
  }
  return null;
}

export function get_tooltip_style(rect) {
  const { top, bottom, left, right } = rect;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cx = (left + right) / 2;
  const cy = (top + bottom) / 2;

  if (top >= TOOLTIP_H + GAP)
    return { top: top - TOOLTIP_H - GAP, left: cx - TOOLTIP_W / 2 };
  if (bottom + TOOLTIP_H + GAP <= vh)
    return { top: bottom + GAP, left: cx - TOOLTIP_W / 2 };
  if (right + TOOLTIP_W + GAP <= vw)
    return { top: cy - TOOLTIP_H / 2, left: right + GAP };
  return { top: cy - TOOLTIP_H / 2, left: left - TOOLTIP_W - GAP };
}
