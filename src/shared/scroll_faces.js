// Scroll image lookup, keyed by slug. Convention: a file
// `master_scroll_faces/<slug>.<ext>` is the default face for scroll <slug>.
// An optional kirkified counterpart at
// `master_scroll_faces_kirkified/<slug>_kirkified.<ext>` is paired in
// automatically — see `kirkified_faces.js` for the pairing rules.
//
// Consumers should reach for `useKirkifiedFace(SCROLL_FACE_PAIRS[slug])` to
// get the right URL for the current Kirk Mode setting.

import { pair_by_stem } from './kirkified_faces';

const default_modules = import.meta.glob('../assets/master_scroll_faces/*', { eager: true });
const kirkified_modules = import.meta.glob('../assets/master_scroll_faces_kirkified/*', { eager: true });

export const SCROLL_FACE_PAIRS = pair_by_stem(default_modules, kirkified_modules);
