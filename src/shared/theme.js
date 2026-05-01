// Theme palettes — `default` is the starting theme everyone gets; `light` and
// `dark` are unlockable via mastery scrolls (State Trooper and George Floyd
// respectively). Components read the active palette via useTheme() and apply
// colors inline. To add a new themed property, add it to ALL three palettes —
// keeping the keys in sync is the contract that lets components switch themes
// without conditionals.
//
// `panel` is the background for in-game panels (auction slots, building rows,
// the cookie-click panel). `modal_panel` is the background for popup modals
// specifically (gambling, roulette, confirms, reward popups). They diverge in
// the `default` theme: panels stay flat, modals get the temple texture.
//
// The active theme is persisted server-side in premium_game_data.theme; see
// PATCH /me/theme for the gating logic.
import { useSelector } from 'react-redux';
import cookie_clicker_bg from '../assets/game_screen/cookie_clicker_background_art.jpg';
import parchment from '../assets/game_screen/yellow_parchment_paper.jpg';

export const themes = {
  default: {
    name: 'default',
    // The cookie-clicker background image fills the outer screen, so every
    // screen (auction house, settings, etc.) shows the iconic art behind its
    // panels — not just modals. Panels stay flat-dark so cards stand out
    // against the wallpaper.
    bg: `url(${cookie_clicker_bg})`,
    bg_size: 'cover',
    bg_position: 'center',
    text: '#e0e0f0',
    text_muted: '#cdcdcd',
    panel: '#1e1e2e',
    panel_secondary: '#0f0f1a',
    panel_border: '#facc15',
    accent: '#facc15',
    accent_text: '#000',
    button_neutral_bg: '#333',
    button_neutral_text: '#fff',
    // Modals also get the cookie-clicker background, so popups feel themed
    // even when stacked over a feature panel. A dark scrim is layered on top
    // of the image so body / title text reads clearly against the busy art —
    // without that scrim, the yellow title + light text fight the background.
    modal_panel: `linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.55)), url(${cookie_clicker_bg}) center/cover`,
  },
  light: {
    name: 'light',
    bg: `url(${parchment})`,
    bg_size: 'cover',
    bg_position: 'center',
    text: '#1a1a1a',
    text_muted: '#5b4636',
    panel: 'rgba(255, 248, 220, 0.92)',
    panel_secondary: 'rgba(252, 232, 177, 0.95)',
    panel_border: '#92400e',
    accent: '#b45309',
    accent_text: '#fff8dc',
    button_neutral_bg: '#a78b6f',
    button_neutral_text: '#fff8dc',
    modal_panel: 'rgba(255, 248, 220, 0.92)',
  },
  dark: {
    name: 'dark',
    bg: '#1a1a2e',
    bg_size: 'auto',
    bg_position: 'center',
    text: '#e0e0f0',
    text_muted: '#aaa',
    panel: '#1e1e2e',
    panel_secondary: '#0f0f1a',
    panel_border: '#facc15',
    accent: '#facc15',
    accent_text: '#000',
    button_neutral_bg: '#333',
    button_neutral_text: '#fff',
    modal_panel: '#1e1e2e',
  },
};

export function useTheme() {
  const name = useSelector(state => state.session.premium_game_data?.theme ?? 'default');
  return themes[name] ?? themes.default;
}
