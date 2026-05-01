// Clickbait-ad rotation data + helpers used by the middle pane of Main_Body.
// The ad image set comes from the alphabetical filenames in
// assets/clickbait_faces/ — drop a new image in that folder and it joins the
// rotation automatically. JPG is preferred for photographic ads (much smaller
// than PNG); PNG is fine for the few that need transparency.
//
// Each ad is paired with an optional "kirkified" version sourced from
// assets/clickbait_faces_kirkified/ by stem-name match. So `vishnu_1.jpg`
// pairs with `vishnu_1_kirkified.jpg` if it exists. When Kirk Mode is on,
// the ad panel swaps to the kirkified image; when there's no match, it
// shows the original alongside a "this image was unable to be kirkified"
// note. Adding a kirkified variant later: drop the file in the kirkified
// folder using the `<original_stem>_kirkified.jpg` naming and it pairs up
// automatically — no code change needed.

const ad_modules = import.meta.glob('../../assets/clickbait_faces/*.{png,jpg}', { eager: true });
const kirkified_modules = import.meta.glob('../../assets/clickbait_faces_kirkified/*.jpg', { eager: true });

function basename_no_ext(path) {
  const file = path.split('/').pop();
  return file.replace(/\.(png|jpg|jpeg|webp)$/i, '');
}

const kirkified_by_stem = {};
for (const [path, mod] of Object.entries(kirkified_modules)) {
  const stem = basename_no_ext(path).replace(/_kirkified$/, '');
  kirkified_by_stem[stem] = mod.default;
}

export const ADS = Object.entries(ad_modules).map(([path, mod]) => ({
  original: mod.default,
  kirkified: kirkified_by_stem[basename_no_ext(path)] ?? null,
}));

// Where to place the ad's close-X button. Each rotation picks a random corner
// to make the close button slightly harder to catch — leaning into the
// "annoying ad" gag.
export const AD_CLOSE_BUTTON_CORNERS = [
  { top: '8px', left: '8px' },
  { top: '8px', right: '8px' },
  { bottom: '8px', left: '8px' },
  { bottom: '8px', right: '8px' },
];

// Pick a different ad index than the current one. Avoids showing the same ad
// twice in a row, which feels broken even if it's technically random.
export function random_next_ad_index(current) {
  let next;
  do { next = Math.floor(Math.random() * ADS.length); } while (next === current);
  return next;
}
