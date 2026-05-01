import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it } from 'vitest';
import sessionReducer, {
  login,
  logout,
  update_game_data,
  update_game_data_field,
  increment_game_data_field,
  update_premium_game_data_field,
  increment_premium_game_data_field,
} from './sessionSlice';

// Each test gets a fresh store. Cheap to recreate, isolates state between cases.
function make_store() {
  return configureStore({ reducer: { session: sessionReducer } });
}

describe('sessionSlice — login / logout', () => {
  it('login sets is_logged_in and copies user data into the slice', () => {
    const store = make_store();
    store.dispatch(login({ user: {
      id: 'u1',
      username: 'alice',
      game_data: { quantity: 100, cps: 5 },
      premium_game_data: { tokens: 50 },
    } }));
    const state = store.getState().session;
    expect(state.is_logged_in).toBe(true);
    expect(state.session_data.username).toBe('alice');
    expect(state.game_data).toEqual({ quantity: 100, cps: 5 });
    expect(state.premium_game_data).toEqual({ tokens: 50 });
  });

  it('logout clears all user state', () => {
    const store = make_store();
    store.dispatch(login({ user: { game_data: { quantity: 1 }, premium_game_data: { tokens: 1 } } }));
    store.dispatch(logout());
    const state = store.getState().session;
    expect(state.is_logged_in).toBe(false);
    expect(state.session_data).toBeNull();
    expect(state.game_data).toBeNull();
    expect(state.premium_game_data).toBeNull();
  });
});

describe('sessionSlice — field-granular game_data reducers', () => {
  let store;
  beforeEach(() => {
    store = make_store();
    store.dispatch(update_game_data({ quantity: 100, cps: 5, cookies_per_click: 1 }));
  });

  it('update_game_data_field sets a single field and leaves others alone', () => {
    store.dispatch(update_game_data_field({ key: 'cps', value: 99 }));
    const gd = store.getState().session.game_data;
    expect(gd.cps).toBe(99);
    expect(gd.quantity).toBe(100);          // untouched
    expect(gd.cookies_per_click).toBe(1);   // untouched
  });

  it('increment_game_data_field adds positive amounts', () => {
    store.dispatch(increment_game_data_field({ key: 'quantity', amount: 50 }));
    expect(store.getState().session.game_data.quantity).toBe(150);
  });

  it('increment_game_data_field handles negative amounts (decrement)', () => {
    store.dispatch(increment_game_data_field({ key: 'quantity', amount: -30 }));
    expect(store.getState().session.game_data.quantity).toBe(70);
  });

  it('increment_game_data_field treats a missing field as 0', () => {
    store.dispatch(increment_game_data_field({ key: 'new_field', amount: 7 }));
    expect(store.getState().session.game_data.new_field).toBe(7);
  });
});

describe('sessionSlice — field-granular premium_game_data reducers', () => {
  let store;
  beforeEach(() => {
    store = make_store();
    store.dispatch(login({ user: {
      game_data: {},
      premium_game_data: { tokens: 100, mastery_scroll_1: 3, theme: 'light' },
    } }));
  });

  it('update_premium_game_data_field sets one field, leaves others alone', () => {
    store.dispatch(update_premium_game_data_field({ key: 'theme', value: 'dark' }));
    const pgd = store.getState().session.premium_game_data;
    expect(pgd.theme).toBe('dark');
    expect(pgd.tokens).toBe(100);              // untouched
    expect(pgd.mastery_scroll_1).toBe(3);      // untouched
  });

  it('increment_premium_game_data_field is atomic (read+write inside reducer)', () => {
    store.dispatch(increment_premium_game_data_field({ key: 'tokens', amount: 50 }));
    expect(store.getState().session.premium_game_data.tokens).toBe(150);
  });

  it('increment_premium_game_data_field treats missing field as 0', () => {
    store.dispatch(increment_premium_game_data_field({ key: 'mastery_scroll_99', amount: 1 }));
    expect(store.getState().session.premium_game_data.mastery_scroll_99).toBe(1);
  });
});

// REGRESSION TEST — locks in the lost-update race fix.
//
// Before the field-granular reducers existed, every state update spread the
// whole pgd object, so two concurrent updates could clobber each other —
// each saw the SAME pgd snapshot, applied their change, and the second to
// dispatch wiped out the first's update. See ./README.md for the full story.
//
// This test simulates that scenario and confirms the field reducers handle
// it correctly: two dispatches updating different fields BOTH end up applied.
describe('sessionSlice — lost-update race regression', () => {
  it('two field updates targeting different keys both apply (no clobber)', () => {
    const store = make_store();
    store.dispatch(login({ user: {
      game_data: {},
      premium_game_data: { tokens: 100, mastery_scroll_1: 0, mastery_scroll_2: 0 },
    } }));

    // Two "concurrent" field updates that, with the old whole-object pattern,
    // would have clobbered each other.
    store.dispatch(update_premium_game_data_field({ key: 'tokens', value: 200 }));
    store.dispatch(increment_premium_game_data_field({ key: 'mastery_scroll_1', amount: 5 }));

    const pgd = store.getState().session.premium_game_data;
    expect(pgd.tokens).toBe(200);          // first dispatch applied
    expect(pgd.mastery_scroll_1).toBe(5);  // second dispatch ALSO applied (didn't get clobbered)
    expect(pgd.mastery_scroll_2).toBe(0);  // unrelated field untouched
  });

  it('many concurrent increments on the same field all sum correctly', () => {
    const store = make_store();
    store.dispatch(login({ user: {
      game_data: {},
      premium_game_data: { tokens: 0 },
    } }));

    // Fire 10 increments. With the old whole-object pattern these could race.
    // With increment_*_field the reducer reads-and-writes inside the reducer
    // (which Redux processes serially), so all 10 land.
    for (let i = 0; i < 10; i++) {
      store.dispatch(increment_premium_game_data_field({ key: 'tokens', amount: 7 }));
    }

    expect(store.getState().session.premium_game_data.tokens).toBe(70);
  });
});
