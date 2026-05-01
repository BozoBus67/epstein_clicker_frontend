import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Modal_Overlay, Section } from '../shared/components';
import { useEscapeKey, useTierGate } from '../shared/hooks';
import { increment_game_data_field, update_premium_game_data } from '../shared/store/sessionSlice';
import { useTheme } from '../shared/theme';
import { api_daily_checkin, api_fivemin_checkin, api_hourly_checkin } from './api';
import { CPS_TICK_MS, FIVEMIN_CHECKIN_MS, HOURLY_CHECKIN_MS, SAVE_INTERVAL_MS } from './constants';
import Gamble_Modal from './gambling/gamble_modal';
import Roulette_Modal from './gambling/roulette_modal';
import { recalculate_cps, save_game_data } from './game_utils';
import Main_Body from './main_screen_parts/main_body';
import Top_Bar from './main_screen_parts/top_bar';

export default function Main_Screen() {
  const dispatch = useDispatch();
  const is_logged_in = useSelector(state => state.session.is_logged_in);
  const game_data = useSelector(state => state.session.game_data);
  const premium_game_data = useSelector(state => state.session.premium_game_data);

  const game_data_ref = useRef(game_data);
  const [daily_reward_data, set_daily_reward_data] = useState(null);
  const [hourly_reward_data, set_hourly_reward_data] = useState(null);
  const [fivemin_reward_data, set_fivemin_reward_data] = useState(null);
  const [show_gamble, set_show_gamble] = useState(false);
  const [show_roulette, set_show_roulette] = useState(false);

  const trigger_save = async () => {
    try {
      await save_game_data();
      toast.success('Game saved!');
    } catch (e) {
      // Auto-save fires every minute, so dedupe via toast id — a single
      // persistent error indicator is better than 60 stacked failure toasts
      // when the network is flaky.
      toast.error(e?.detail || 'Error: Save failed.', { id: 'save-error' });
    }
  };

  // Keep the cps-tick effect's view of game_data fresh without re-creating the interval.
  useEffect(() => {
    game_data_ref.current = game_data;
  }, [game_data]);

  // CPS depends on building counts and on which scrolls the user owns.
  // Recalc whenever either changes — without this, scroll-driven buffs (e.g.
  // Shadow Clone Jutsu's ×1000) wouldn't take effect until the user happened
  // to buy another building, which is the only other place recalculate_cps
  // currently fires from. Reads game_data.buildings (a stable Immer ref that
  // only changes when buildings are bought) so the effect doesn't loop on
  // its own cps-update dispatch.
  useEffect(() => {
    if (!game_data) return;
    recalculate_cps();
  }, [game_data?.buildings, premium_game_data]);

  // Auto-save every minute.
  useEffect(() => {
    const interval = setInterval(trigger_save, SAVE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  // Cmd/Ctrl + S to save manually.
  useEffect(() => {
    const handle_key = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        trigger_save();
      }
    };
    window.addEventListener('keydown', handle_key);
    return () => window.removeEventListener('keydown', handle_key);
  }, []);

  // Daily check-in: fire on mount + on tab visibility regain. Recurring, so
  // the failure toast uses a fixed id to dedupe repeated network blips.
  useEffect(() => {
    const do_checkin = async () => {
      if (document.hidden) return;
      try {
        const data = await api_daily_checkin();
        if (!data.already_checked_in) set_daily_reward_data(data);
        if (data.premium_game_data) dispatch(update_premium_game_data(data.premium_game_data));
      } catch (e) {
        toast.error(e?.detail || 'Error: Daily check-in failed.', { id: 'daily-checkin-error' });
      }
    };
    do_checkin();
    document.addEventListener('visibilitychange', do_checkin);
    return () => document.removeEventListener('visibilitychange', do_checkin);
  }, [is_logged_in]);

  // Hourly + 5-minute check-ins on a schedule, plus tab-visibility regain.
  // Each api_fn gets its own toast id so its errors dedupe independently.
  useEffect(() => {
    const do_checkin = async (api_fn, set_reward, error_id) => {
      if (document.hidden) return;
      try {
        const data = await api_fn();
        if (!data.already_checked_in) set_reward(data);
        if (data.premium_game_data) dispatch(update_premium_game_data(data.premium_game_data));
      } catch (e) {
        toast.error(e?.detail || 'Error: Check-in failed.', { id: error_id });
      }
    };

    const fivemin_args = [api_fivemin_checkin, set_fivemin_reward_data, 'fivemin-checkin-error'];
    const hourly_args  = [api_hourly_checkin,  set_hourly_reward_data,  'hourly-checkin-error'];

    do_checkin(...fivemin_args);
    do_checkin(...hourly_args);

    const on_visibility = () => {
      do_checkin(...fivemin_args);
      do_checkin(...hourly_args);
    };

    const fivemin_interval = setInterval(() => do_checkin(...fivemin_args), FIVEMIN_CHECKIN_MS);
    const hourly_interval = setInterval(() => do_checkin(...hourly_args), HOURLY_CHECKIN_MS);
    document.addEventListener('visibilitychange', on_visibility);

    return () => {
      clearInterval(fivemin_interval);
      clearInterval(hourly_interval);
      document.removeEventListener('visibilitychange', on_visibility);
    };
  }, [is_logged_in]);

  // CPS tick: every second, increment quantity by current cps. The reducer
  // reads cps from the live state itself (atomic increment), so no need to
  // capture game_data here.
  useEffect(() => {
    const interval = setInterval(() => {
      const gd = game_data_ref.current;
      if (!gd) return;
      dispatch(increment_game_data_field({ key: 'quantity', amount: gd.cps }));
    }, CPS_TICK_MS);
    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh' }}>
      {daily_reward_data && <Reward_Popup title="Daily Reward!" data={daily_reward_data} on_close={() => set_daily_reward_data(null)} />}
      {hourly_reward_data && <Reward_Popup title="Hourly Reward!" data={hourly_reward_data} on_close={() => set_hourly_reward_data(null)} />}
      {fivemin_reward_data && <Reward_Popup title="5 Minute Reward!" data={fivemin_reward_data} on_close={() => set_fivemin_reward_data(null)} />}
      {show_gamble && <Gamble_Modal on_close={() => set_show_gamble(false)} />}
      {show_roulette && <Roulette_Modal on_close={() => set_show_roulette(false)} />}
      <Section name="top bar">
        <Top_Bar
          on_gamble_click={() => set_show_gamble(true)}
          on_roulette_click={() => set_show_roulette(true)}
        />
      </Section>
      <Section name="main body" fill>
        <Main_Body />
      </Section>
      <Section name="settings button">
        <Settings_Button />
      </Section>
    </div>
  );
}

function Settings_Button() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { gate, lock_modal } = useTierGate(1);
  const [hovered, set_hovered] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => gate(() => navigate('/game/settings'))}
        onMouseEnter={() => set_hovered(true)}
        onMouseLeave={() => set_hovered(false)}
        style={{
          position: 'fixed',
          bottom: '16px',
          left: '16px',
          width: '44px',
          height: '44px',
          border: `2px solid ${theme.accent}`,
          borderRadius: '8px',
          background: theme.panel,
          color: theme.accent,
          fontSize: '24px',
          lineHeight: 1,
          cursor: 'pointer',
          transform: hovered ? 'scale(1.08)' : 'scale(1)',
          transition: 'all 0.1s ease',
        }}
      >
        ⚙️
      </button>
      {lock_modal}
    </>
  );
}

function Reward_Popup({ title, data, on_close }) {
  const theme = useTheme();
  useEscapeKey(on_close);
  return (
    <Modal_Overlay panel_style={{ alignItems: 'center', textAlign: 'center', minWidth: '280px' }}>
      <h2 style={{ color: theme.accent, margin: 0, fontSize: '28px', fontWeight: 'bold' }}>{title}</h2>
      <p style={{ margin: 0 }}>Streak: {data.streak}</p>
      <p style={{ margin: 0 }}>Tokens granted: {data.tokens_granted}</p>
      <button
        type="button"
        onClick={on_close}
        style={{
          marginTop: '8px', padding: '8px 24px', background: theme.accent,
          color: theme.accent_text, border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold',
        }}
      >
        OK
      </button>
    </Modal_Overlay>
  );
}
