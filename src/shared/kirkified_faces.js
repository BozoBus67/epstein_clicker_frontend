// Kirk-Mode-aware image pairing. Used anywhere a face/photo image set has
// optional kirkified counterparts in a sibling folder — currently mastery
// scroll faces and clickbait ads, possibly more later.
//
// Pairing convention: a default-folder file `<stem>.<ext>` pairs with a
// kirkified-folder file `<stem>_kirkified.<ext>` if it exists. Different
// extensions on the two sides are fine (`charlie_kirk.png` pairs with
// `charlie_kirk_kirkified.jpg`). To add a kirkified variant for an existing
// image, drop the file in the sibling folder using the matching stem;
// `pair_by_stem` picks it up at module load.
//
// Render-time selection is what `pick_face` (pure) and `useKirkifiedFace`
// (the Redux-aware hook) handle. Both return `{ url, missing_kirkified }` so
// callers can show a "this image was unable to be kirkified" note when
// kirk mode is on but no kirkified variant exists.

import { useSelector } from 'react-redux';

export function basename_no_ext(path) {
  const file = path.split('/').pop();
  return file.replace(/\.[^/.]+$/, '');
}

// Pair default-folder modules with kirkified-folder modules by stem name.
// Returns: { stem: { original, kirkified|null } }.
//
// Pass the result of `import.meta.glob(..., { eager: true })` for each side.
// `default_modules` defines the universe of stems; kirkified-side files
// without a matching default are silently dropped (orphans).
export function pair_by_stem(default_modules, kirkified_modules) {
  const kirkified_by_stem = {};
  for (const [path, mod] of Object.entries(kirkified_modules)) {
    const stem = basename_no_ext(path).replace(/_kirkified$/, '');
    kirkified_by_stem[stem] = mod.default;
  }
  const result = {};
  for (const [path, mod] of Object.entries(default_modules)) {
    const stem = basename_no_ext(path);
    result[stem] = { original: mod.default, kirkified: kirkified_by_stem[stem] ?? null };
  }
  return result;
}

// Pure version: pick the right URL based on a kirk_mode flag.
// `missing_kirkified` is true iff kirk mode is on AND no kirkified variant
// exists for this pair — UI can use it to surface a fallback note.
export function pick_face(pair, kirk_mode) {
  if (!pair) return { url: null, missing_kirkified: false };
  const use_kirkified = kirk_mode && !!pair.kirkified;
  return {
    url: use_kirkified ? pair.kirkified : pair.original,
    missing_kirkified: kirk_mode && !pair.kirkified,
  };
}

// React hook version: reads kirk_mode from Redux and returns the URL plus
// the missing_kirkified flag. Use this in any component that displays a
// face image and should respect Kirk Mode.
export function useKirkifiedFace(pair) {
  const kirk_mode = useSelector(state => state.session.premium_game_data?.kirk_mode ?? false);
  return pick_face(pair, kirk_mode);
}
