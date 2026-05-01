// Shared mastery-scroll face image set, used by anywhere that displays scrolls
// (mastery scrolls page, gambling modals, etc.). Sorted by filename so the
// index is stable and matches the alphabetical-filename → mastery_scroll_N
// convention used in SCROLL_NAMES.

const face_modules = import.meta.glob('../assets/master_scroll_faces/*', { eager: true });

export const SCROLL_FACES = Object.keys(face_modules).sort().map(k => face_modules[k].default);
