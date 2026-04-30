import { useEffect, useRef, useState } from 'react';
import { useEscapeKey, useTierGate } from '../shared/hooks';
import { Section } from '../shared/components';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { update_game_data, update_premium_game_data } from '../shared/store/sessionSlice';
import { save_game_data } from './game_utils';
import { api_daily_checkin, api_hourly_checkin, api_fivemin_checkin } from './api';
import Top_Bar from './main_screen_parts/top_bar';
import Main_Body from './main_screen_parts/main_body';
import Gamble_Modal from './gamble_modal';

export default function Main_Screen() {
  const dispatch = useDispatch();
  const jwt = useSelector(state => state.session.jwt);
  const game_data = useSelector(state => state.session.game_data);
  const game_data_ref = useRef(game_data);
  const [daily_reward_data, set_daily_reward_data] = useState(null);
  const [hourly_reward_data, set_hourly_reward_data] = useState(null);
  const [fivemin_reward_data, set_fivemin_reward_data] = useState(null);
  const [show_gamble, set_show_gamble] = useState(false);

  useEffect(() => {
    game_data_ref.current = game_data;
  }, [game_data]);

  const trigger_save = () => {
    save_game_data();
    toast.success('Game saved!');
  };

  useEffect(() => {
    const interval = setInterval(trigger_save, 60000);
    return () => clearInterval(interval);
  }, []);

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

  useEffect(() => {
    const do_checkin = async () => {
      if (document.hidden) return;
      try {
        const data = await api_daily_checkin();
        if (!data.already_checked_in) set_daily_reward_data(data);
        if (data.premium_game_data) dispatch(update_premium_game_data(data.premium_game_data));
      } catch (e) { console.error('Daily checkin error:', e); }
    };
    do_checkin();
    document.addEventListener('visibilitychange', do_checkin);
    return () => document.removeEventListener('visibilitychange', do_checkin);
  }, [jwt]);

  useEffect(() => {
    const do_checkin = async (api_fn, set_reward) => {
      if (document.hidden) return;
      try {
        const data = await api_fn();
        if (!data.already_checked_in) set_reward(data);
        if (data.premium_game_data) dispatch(update_premium_game_data(data.premium_game_data));
      } catch (e) { console.error('Checkin error:', e); }
    };

    do_checkin(api_fivemin_checkin, set_fivemin_reward_data);
    do_checkin(api_hourly_checkin, set_hourly_reward_data);

    const on_visibility = () => {
      do_checkin(api_fivemin_checkin, set_fivemin_reward_data);
      do_checkin(api_hourly_checkin, set_hourly_reward_data);
    };

    const fivemin_interval = setInterval(() => do_checkin(api_fivemin_checkin, set_fivemin_reward_data), 5 * 60 * 1000);
    const hourly_interval = setInterval(() => do_checkin(api_hourly_checkin, set_hourly_reward_data), 60 * 60 * 1000);
    document.addEventListener('visibilitychange', on_visibility);

    return () => {
      clearInterval(fivemin_interval);
      clearInterval(hourly_interval);
      document.removeEventListener('visibilitychange', on_visibility);
    };
  }, [jwt]);

  useEffect(() => {
    const interval = setInterval(() => {
      const gd = game_data_ref.current;
      if (!gd) return;
      dispatch(update_game_data({ ...gd, quantity: gd.quantity + gd.cps }));
    }, 1000);
    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh' }}>
      {daily_reward_data && <Reward_Popup title="Daily Reward!" streak_label="Day" data={daily_reward_data} on_close={() => set_daily_reward_data(null)} />}
      {hourly_reward_data && <Reward_Popup title="Hourly Reward!" streak_label="Hour" data={hourly_reward_data} on_close={() => set_hourly_reward_data(null)} />}
      {fivemin_reward_data && <Reward_Popup title="5 Minute Reward!" streak_label="x" data={fivemin_reward_data} on_close={() => set_fivemin_reward_data(null)} />}
      {show_gamble && <Gamble_Modal on_close={() => set_show_gamble(false)} />}
      <Section name="top bar">
        <Main_Screen_Topbar on_gamble_click={() => set_show_gamble(true)} />
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

function Main_Screen_Topbar({ on_gamble_click }) {
  return <Top_Bar on_gamble_click={on_gamble_click} />;
}

function Settings_Button() {
  const navigate = useNavigate();
  const { gate, lock_modal } = useTierGate(1);
  const [hovered, set_hovered] = useState(false);

  return (
    <>
      <button
        onClick={() => gate(() => navigate('/game/settings'))}
        onMouseEnter={() => set_hovered(true)}
        onMouseLeave={() => set_hovered(false)}
        style={{
          position: 'fixed',
          bottom: '16px',
          left: '16px',
          width: '44px',
          height: '44px',
          border: '2px solid #facc15',
          borderRadius: '8px',
          background: '#1e1e2e',
          color: '#facc15',
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

function Reward_Popup({ title, streak_label, data, on_close }) {
  useEscapeKey(on_close);
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
    }}>
      <div style={{
        background: '#1e1e2e', border: '2px solid #facc15', borderRadius: '12px',
        padding: '32px', minWidth: '280px', textAlign: 'center', color: 'white',
      }}>
        <h2 style={{ color: '#facc15', marginBottom: '8px' }}>{title}</h2>
        <p>Streak: {streak_label} {data.streak}</p>
        <p>Tokens granted: {data.tokens_granted}</p>
        <button
          onClick={on_close}
          style={{
            marginTop: '20px', padding: '8px 24px', background: '#facc15',
            color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold',
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
}
