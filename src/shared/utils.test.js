import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tier_num, notify_migration } from './utils';
import toast from 'react-hot-toast';

// react-hot-toast doesn't actually render anything when called from a test
// without a Toaster mounted, so we just spy on it and assert call counts /
// arguments.
vi.mock('react-hot-toast', () => ({
  default: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('tier_num', () => {
  it('extracts the numeric tier from "account_tier_N" strings', () => {
    expect(tier_num('account_tier_5')).toBe(5);
    expect(tier_num('account_tier_0')).toBe(0);
    expect(tier_num('account_tier_9')).toBe(9);
  });

  it('returns 0 for null / undefined / empty input', () => {
    expect(tier_num(null)).toBe(0);
    expect(tier_num(undefined)).toBe(0);
    expect(tier_num('')).toBe(0);
  });

  it('returns 0 for malformed input', () => {
    expect(tier_num('garbage')).toBe(0);
  });
});

describe('notify_migration', () => {
  it('does nothing when migration_info is null or undefined', () => {
    notify_migration(null);
    notify_migration(undefined);
    expect(toast).not.toHaveBeenCalled();
  });

  it('does nothing when migrated is false', () => {
    notify_migration({ migrated: false, added_premium_keys: [], added_game_keys: [] });
    expect(toast).not.toHaveBeenCalled();
  });

  it('fires a toast when migration ran with added keys', () => {
    notify_migration({
      migrated: true,
      added_premium_keys: ['foo', 'bar'],
      added_game_keys: ['baz'],
    });
    expect(toast).toHaveBeenCalledTimes(1);
    const [message] = toast.mock.calls[0];
    expect(message).toContain('added 3');
  });

  it('fires a toast when migration removed keys', () => {
    notify_migration({
      migrated: true,
      added_premium_keys: [],
      added_game_keys: [],
      removed_building_keys: ['old_building'],
    });
    expect(toast).toHaveBeenCalledTimes(1);
    const [message] = toast.mock.calls[0];
    expect(message).toContain('removed 1');
  });
});
