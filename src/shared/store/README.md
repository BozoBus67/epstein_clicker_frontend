# Redux store

Single Redux Toolkit slice (`sessionSlice.js`) holding everything the frontend mirrors from the backend: session data, game state, premium game data, account tier list, building metadata, scroll metadata.

## Reducers worth knowing

- **`update_game_data(payload)`** — replace the whole `game_data` object. Use only when the backend returns a fresh full snapshot (e.g. response from `/me`, `/buy_listing`).
- **`update_game_data_field({ key, value })`** — set a single top-level field on `game_data`.
- **`increment_game_data_field({ key, amount })`** — atomic add. Negative `amount` to subtract.
- **`update_premium_game_data(payload)`** / **`update_premium_game_data_field`** / **`increment_premium_game_data_field`** — same trio for `premium_game_data`.

**Default to the field-granular reducers** for any update that targets one (or a few) fields. Reach for the whole-object replacement only when the backend's response IS the new full state — typically API responses that return the entire game_data or premium_game_data object.

---

## Legacy notes — spare-time reading only

> Skip this section unless you're curious about why the field-granular reducers exist. It documents a real bug class we hit and the fix; nothing here is required for normal feature work — just **use the `*_field` reducers and you'll never trip on this.**

### The bug we used to have

Before adding the field-granular reducers, every state update went through the whole-object replacement. The pattern looked like:

```js
const pgd = useSelector(s => s.session.premium_game_data);
// ... inside an async handler ...
const data = await api_spin();
dispatch(update_premium_game_data({ ...pgd, tokens: data.tokens_remaining }));
```

This works fine in isolation. The problem shows up when **two async handlers run concurrently**. Single-threaded JS doesn't have classic-thread races, but `await` introduces interleaving:

```
Handler A:               Handler B:
read pgd (v1)
await api_spin()
                         read pgd (v1)        ← B sees the SAME pgd as A
                         await api_save()
build new pgd:
{ ...v1, tokens: 900 }
dispatch(new pgd)        // tokens=900, everything else from v1
                         build new pgd:
                         { ...v1, scroll_5: 3 }
                         dispatch(new pgd)    // scroll_5=3, EVERYTHING ELSE FROM v1 — including tokens reverted to v1's value
```

This is called a **lost-update race** or **read-modify-write race**. The reason it's silent: the `...v1` spread copies every field, so B's dispatch *technically* succeeds — it just clobbers any updates A made between its read and B's read.

### Why this is the *less* scary kind of race

The "races are notoriously hard to debug" reputation comes from concurrent threads in compiled languages — two CPU cores writing to the same memory at clock-cycle resolution. JS is single-threaded; its races are about async interleaving, which is **explicitly visible** at every `await`. You can reason about who reads/writes what state. No mutex/lock needed — the fix is a structural change.

### The fix (what you see in this slice now)

Field-granular reducers eliminate the read-modify-write window:

```js
update_premium_game_data_field(state, action) {
  const { key, value } = action.payload;
  if (state.premium_game_data) state.premium_game_data[key] = value;
}
increment_premium_game_data_field(state, action) {
  const { key, amount } = action.payload;
  if (state.premium_game_data) {
    state.premium_game_data[key] = (state.premium_game_data[key] ?? 0) + amount;
  }
}
```

Now A and B can race freely:

- A: `update_premium_game_data_field({ key: 'tokens', value: 900 })` → reducer sets `pgd.tokens = 900`. Doesn't touch any other field.
- B: `update_premium_game_data_field({ key: 'scroll_5', value: 3 })` → reducer sets `pgd.scroll_5 = 3`. Doesn't touch any other field.

End state has both. **No spread-and-override means no clobbering.**

For things that read-then-modify (like incrementing a counter), use the increment variant — it reads inside the reducer where the read-and-write are atomic relative to other dispatches (Redux processes reducers serially).

### Things to remember when writing new code

- If you find yourself writing `dispatch(update_*_game_data({ ...pgd, foo: ... }))`, **stop** — use the field reducers.
- If you need to update multiple fields atomically, you can dispatch them in sequence. They process serially. The render after them all is one render with both updates applied.
- The whole-object reducers are still around because they're correct for "backend just gave us a fresh full object" cases. Easy to tell apart: if you're spreading existing state into the dispatch, switch to a field reducer; if you're passing the response object directly, the whole-object reducer is fine.

### Side benefit

Before the fix, modals had `pgd_ref` workarounds (`useRef` + `useEffect` to keep the ref pointing at the latest pgd snapshot) so async handlers could spread the *latest* state at dispatch time. Once we switched to field reducers, those refs became unnecessary — the reducer reads state directly. Keep an eye out for that pattern in any other folders; if you see a ref tracking redux state, it's probably leftover scaffolding from this same race.
