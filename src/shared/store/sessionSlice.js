import { createSlice } from '@reduxjs/toolkit';

const sessionSlice = createSlice({
  name: 'session',
  initialState: {
    is_logged_in: false,
    jwt: null,
    session_data: null,
    game_data: null,
    premium_game_data: null,
    account_tiers: [],
    buildings: {},
    scrolls: {},
  },
  reducers: {
    login(state, action) {
      const { user, token } = action.payload;
      state.is_logged_in = true;
      state.jwt = token;
      state.session_data = user;
      state.game_data = user.game_data;
      state.premium_game_data = user.premium_game_data ?? null;
    },
    logout(state) {
      state.is_logged_in = false;
      state.jwt = null;
      state.session_data = null;
      state.game_data = null;
      state.premium_game_data = null;
    },
    update_game_data(state, action) {
      state.game_data = action.payload;
    },
    update_premium_game_data(state, action) {
      state.premium_game_data = action.payload;
    },
    set_account_tiers(state, action) {
      state.account_tiers = action.payload;
    },
    set_buildings(state, action) {
      state.buildings = Object.fromEntries(action.payload.map(b => [b.key, b]));
    },
    set_scrolls(state, action) {
      state.scrolls = action.payload;
    },
  },
});

export const {
  login,
  logout,
  update_game_data,
  update_premium_game_data,
  set_account_tiers,
  set_buildings,
  set_scrolls,
} = sessionSlice.actions;

export default sessionSlice.reducer;
