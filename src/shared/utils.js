import toast from 'react-hot-toast';
import { api_me } from '../auth/api';
import { update_game_data, update_premium_game_data } from './store/sessionSlice';

export const tier_num = (tier_str) => parseInt(tier_str?.replace('account_tier_', '')) || 0;

// Re-fetch the user's account data from /me, push it through Redux, and surface
// any backend-side migration toast. Used by App.jsx for session restore and by
// the top bar's refresh button. Pass the Redux dispatch fn — this lives in a
// plain module so we can't reach for useDispatch.
export async function refresh_user_data(dispatch) {
  const data = await api_me();
  dispatch(update_game_data(data.user.game_data));
  dispatch(update_premium_game_data(data.user.premium_game_data));
  notify_migration(data.migration_info);
}

// Surface a toast when the backend reports that a data migration ran. Called
// from the few entry points that may trigger ensure_user_data_complete: app
// startup (App.jsx) and the refresh button (top_bar.jsx). Game endpoints
// don't return migration_info, so calling this with their responses is a no-op.
export function notify_migration(migration_info) {
  if (!migration_info?.migrated) return;
  const added =
    (migration_info.added_premium_keys?.length ?? 0) +
    (migration_info.added_game_keys?.length ?? 0) +
    (migration_info.added_building_keys?.length ?? 0);
  const removed = migration_info.removed_building_keys?.length ?? 0;
  const parts = [];
  if (added) parts.push(`added ${added}`);
  if (removed) parts.push(`removed ${removed}`);
  toast(`Account data migrated: ${parts.join(', ')} field(s).`, { icon: '🛠️', duration: 6000 });
}
