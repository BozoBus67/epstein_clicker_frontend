import { createSlice } from '@reduxjs/toolkit';

const sessionSlice = createSlice({
  name: 'session',
  initialState: {
    is_logged_in: false,
    session_data: null,
    game_data: null,
    premium_game_data: null,
    account_tiers: [],
    buildings: {},
    scrolls: {},
  },
  reducers: {
    login(state, action) {
      const { user } = action.payload;
      state.is_logged_in = true;
      state.session_data = user;
      state.game_data = user.game_data;
      state.premium_game_data = user.premium_game_data ?? null;
    },
    logout(state) {
      state.is_logged_in = false;
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

    // Field-granular updates. Prefer these over whole-object replacement when
    // updating one top-level field — see ./README.md for the lost-update
    // race they prevent.
    update_game_data_field(state, action) {
      const { key, value } = action.payload;
      if (state.game_data) state.game_data[key] = value;
    },
    increment_game_data_field(state, action) {
      const { key, amount } = action.payload;
      if (state.game_data) {
        state.game_data[key] = (state.game_data[key] ?? 0) + amount;
      }
    },
    update_premium_game_data_field(state, action) {
      const { key, value } = action.payload;
      if (state.premium_game_data) state.premium_game_data[key] = value;
    },
    increment_premium_game_data_field(state, action) {
      const { key, amount } = action.payload;
      if (state.premium_game_data) {
        state.premium_game_data[key] = (state.premium_game_data[key] ?? 0) + amount;
      }
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
    patch_session_data(state, action) {
      if (state.session_data) Object.assign(state.session_data, action.payload);
    },
  },
});

export const {
  login,
  logout,
  update_game_data,
  update_premium_game_data,
  update_game_data_field,
  increment_game_data_field,
  update_premium_game_data_field,
  increment_premium_game_data_field,
  set_account_tiers,
  set_buildings,
  set_scrolls,
  patch_session_data,
} = sessionSlice.actions;

export default sessionSlice.reducer;
