// Clickbait-ad rotation data + helpers used by the middle pane of Main_Body.
// The ad image set comes from the alphabetical filenames in
// assets/clickbait_faces/ — drop a new image in that folder and it joins the
// rotation automatically. JPG is preferred for photographic ads (much smaller
// than PNG); PNG is fine for the few that need transparency.

const ad_modules = import.meta.glob('../../assets/clickbait_faces/*.{png,jpg}', { eager: true });

export const ADS = Object.values(ad_modules).map(m => m.default);

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
