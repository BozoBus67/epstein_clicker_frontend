// ─────────────────────────────────────────────────────────────────────────────
// User-facing text content for the entire game.
//
// This is THE swappable layer: every name, label, ad string, tier title, and
// scroll name/description the user sees is exported from here. Swap (or fork)
// this file to retheme the game wholesale — e.g. an SFW edition would change
// QUANTITY_NAME from "children trafficked" to "cookies", BUILDING_NAMES from
// "Diddy Factory" to "Mine", SCROLL_DISPLAY_NAMES.adolf_hitler from "Adolf
// Hitler" to "Hank", ACCOUNT_TIER_NAMES from "Jewish+++" to "Premium+++", etc.
//
// Scroll IDs (the keys below) are the stable slug identifiers from
// `scroll_registry.js` — those are mechanics-side and never change. Only the
// values here are the swappable user-facing strings.
//
// Underlying mechanics (building costs, ELO bands, scroll → chess_elo, etc.)
// live elsewhere and don't reference any of this. Strings only.
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

export const SCROLL_DISPLAY_NAMES = {
  '6_7_kid':             '6/7 Kid',
  adolf_hitler:          'Adolf Hitler',
  blurry_epstein:        'Shadow Clone Jutsu',
  caseoh:                'CaseOh',
  charlie_kirk:          'Charlie Kirk',
  dexter:                'Dexter',
  diddy:                 'Diddy',
  doakes:                'Doakes',
  donald_trump:          'Donald Trump',
  drake:                 'Drake',
  elon_musk:             'Elon Musk',
  freddy_fazbear:        'Freddy Fazbear',
  george_floyd:          'George Floyd',
  hillary_clinton:       'Hillary Clinton',
  ishowspeed:            'iShowSpeed',
  kai_cenat:             'Kai Cenat',
  khaby_lame:            'Khaby Lame',
  mark_zuckerberg:       'Mark Zuckerberg',
  mr_beast:              'MrBeast',
  ninja_from_fortnite:   'Ninja',
  roy_lee:               'Roy Lee',
  state_trooper_cop:     'State Trooper',
  stephen_hawking:       'Stephen Hawking',
  tun_tun_tun_sahur:     'Tun Tun Tun Sahur',
  walter_white:          'Walter White',
};

export const SCROLL_DESCRIPTIONS = {
  '6_7_kid':             'Not yet implemented',
  adolf_hitler:          'Not yet implemented',
  blurry_epstein:        `${QUANTITY_NAME} per second multiplied by 1000`,
  caseoh:                'Not yet implemented',
  charlie_kirk:          'Unlocks Kirk Mode (toggle in settings) — kirkifies all clickbait ads',
  dexter:                'Not yet implemented',
  diddy:                 'Diddy Factory, Baby Oil Factory, and Mega Diddy Factory production ×2500',
  doakes:                'Not yet implemented',
  donald_trump:          'Not yet implemented',
  drake:                 'Not yet implemented',
  elon_musk:             'Not yet implemented',
  freddy_fazbear:        'Not yet implemented',
  george_floyd:          'Unlocks dark mode',
  hillary_clinton:       'Not yet implemented',
  ishowspeed:            'Not yet implemented',
  kai_cenat:             'Not yet implemented',
  khaby_lame:            'Not yet implemented',
  mark_zuckerberg:       'Not yet implemented',
  mr_beast:              'Not yet implemented',
  ninja_from_fortnite:   'Not yet implemented',
  roy_lee:               'Not yet implemented',
  state_trooper_cop:     'Unlocks light mode',
  stephen_hawking:       'Not yet implemented',
  tun_tun_tun_sahur:     'Not yet implemented',
  walter_white:          'Not yet implemented',
};

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
