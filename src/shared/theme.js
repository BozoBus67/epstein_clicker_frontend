// Theme palettes for light (parchment) and dark (current navy/yellow). Components
// read the active palette via useTheme() and apply colors inline. To add a new
// themed property, add it to BOTH light and dark below — keeping the keys in sync
// is the contract that lets components switch themes without conditionals.
//
// The active theme is persisted server-side in premium_game_data.theme; see
// PATCH /me/theme which gates 'dark' behind owning a George Floyd scroll.
import { useSelector } from 'react-redux';
import parchment from '../assets/game_screen/yellow_parchment_paper.jpg';

export const themes = {
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
  },
};

export function useTheme() {
  const name = useSelector(state => state.session.premium_game_data?.theme ?? 'light');
  return themes[name] ?? themes.light;
}
