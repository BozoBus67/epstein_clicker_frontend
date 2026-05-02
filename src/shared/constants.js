// ─────────────────────────────────────────────────────────────────────────────
// User-facing text content for the entire game.
//
// This is THE swappable layer: every name, label, ad string, and tier title
// the user sees is exported from here. Swap (or fork) this file to retheme
// the game wholesale — e.g. an SFW edition would change QUANTITY_NAME from
// "children trafficked" to "cookies", BUILDING_NAMES from "Diddy Factory" to
// "Mine", ACCOUNT_TIER_NAMES from "Jewish+++" to "Premium+++", etc.
//
// Mastery-scroll names/descriptions live in `scroll_registry.js`. They're
// keyed by stable slug there rather than positional id, and own their own
// chess metadata too — see that file for why.
//
// Underlying mechanics (building costs, ELO bands, etc.) live elsewhere
// and don't reference any of this. Strings only.
// ─────────────────────────────────────────────────────────────────────────────

export const QUANTITY_NAME = 'children trafficked';

export const BUILDING_NAMES = {
  building_1:  'Cursor',
  building_2:  'Diddy Factory',
  building_3:  'Baby Oil Factory',
  building_4:  'Mega Diddy Factory',
  building_5:  'NYC Apartment',
  building_6:  'Mexico House',
  building_7:  'Gulfstream Jet',
  building_8:  'Private Island Runway',
  building_9:  'Shell Company Empire',
  building_10: 'Offshore Money Network',
  building_11: 'Media Control Machine',
  building_12: 'Global Lobbying Force',
  building_13: 'World Influence Grid',
};

// Tier thresholds for owned-count → tier badge. Descending so callers can
// return on first match (highest matching tier wins). Mirrored in
// backend/data/scrolls.py — keep both in sync.
export const SCROLL_TIERS = [
  { min: 100, tier: 5 },
  { min: 25,  tier: 4 },
  { min: 10,  tier: 3 },
  { min: 4,   tier: 2 },
  { min: 1,   tier: 1 },
];

export const AD_TEXT = 'HOT GIRLS IN YOUR AREA WANT TO S3X';
export const BAKERY_SUBSTITUTE_NAME = 'Island';

export const ACCOUNT_TIER_NAMES = {
  account_tier_0: 'Free',
  account_tier_1: 'Plus',
  account_tier_2: 'Pro',
  account_tier_3: 'Enterprise',
  account_tier_4: 'Premium',
  account_tier_5: 'Luxurious',
  account_tier_6: 'Jewish',
  account_tier_7: 'Jewish+',
  account_tier_8: 'Jewish++',
  account_tier_9: 'Jewish+++',
};
