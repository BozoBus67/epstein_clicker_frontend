import { SCROLL_IDS } from '../../shared/scroll_registry';

// Roulette wheel geometry. The wheel is divided into one segment per scroll;
// the SVG is sized in pixels and the geometry is computed once at module load
// rather than on every render.

export { SCROLL_IDS };

const N = SCROLL_IDS.length;

export const SEGMENT_DEG = 360 / N;
export const WHEEL_SIZE = 420;
export const WHEEL_RADIUS = WHEEL_SIZE / 2;
export const FACE_RADIUS = WHEEL_RADIUS - 38;
export const FACE_SIZE = 36;
