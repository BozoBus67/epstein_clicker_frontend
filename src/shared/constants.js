// ─────────────────────────────────────────────────────────────────────────────
// User-facing text content for the entire game.
//
// This is THE swappable layer: every name, label, ad string, and tier title
// the user sees is exported from here. Swap (or fork) this file to retheme
// the game wholesale — e.g. an SFW edition would change QUANTITY_NAME from
// "children trafficked" to "cookies", BUILDING_NAMES from "Diddy Factory" to
// "Mine", ACCOUNT_TIER_NAMES from "Jewish+++" to "Premium+++", etc.
//
// Underlying mechanics (building costs, scroll effects, ELO bands, etc.)
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

export const SCROLL_NAMES = {
  mastery_scroll_1:  '6/7 Kid',
  mastery_scroll_2:  'Adolf Hitler',
  mastery_scroll_3:  'Shadow Clone Jutsu',
  mastery_scroll_4:  'CaseOh',
  mastery_scroll_5:  'Charlie Kirk',
  mastery_scroll_6:  'Dexter',
  mastery_scroll_7:  'Diddy',
  mastery_scroll_8:  'Doakes',
  mastery_scroll_9:  'Donald Trump',
  mastery_scroll_10: 'Drake',
  mastery_scroll_11: 'Elon Musk',
  mastery_scroll_12: 'Freddy Fazbear',
  mastery_scroll_13: 'George Floyd',
  mastery_scroll_14: 'Hillary Clinton',
  mastery_scroll_15: 'iShowSpeed',
  mastery_scroll_16: 'Kai Cenat',
  mastery_scroll_17: 'Khaby Lame',
  mastery_scroll_18: 'Mark Zuckerberg',
  mastery_scroll_19: 'MrBeast',
  mastery_scroll_20: 'Ninja',
  mastery_scroll_21: 'Roy Lee',
  mastery_scroll_22: 'State Trooper',
  mastery_scroll_23: 'Stephen Hawking',
  mastery_scroll_24: 'Tun Tun Tun Sahur',
  mastery_scroll_25: 'Walter White',
};

export const SCROLL_TIERS = [
  { min: 100, tier: 5 },
  { min: 25,  tier: 4 },
  { min: 10,  tier: 3 },
  { min: 4,   tier: 2 },
  { min: 1,   tier: 1 },
];

export const SCROLL_DESCRIPTIONS = {
  mastery_scroll_1:  'Not yet implemented',
  mastery_scroll_2:  'Not yet implemented',
  mastery_scroll_3:  `${QUANTITY_NAME} per second multiplied by 1000`,
  mastery_scroll_4:  'Not yet implemented',
  mastery_scroll_5:  'Unlocks Kirk Mode (toggle in settings) — kirkifies all clickbait ads',
  mastery_scroll_6:  'Not yet implemented',
  mastery_scroll_7:  'Diddy Factory, Baby Oil Factory, and Mega Diddy Factory production ×2500',
  mastery_scroll_8:  'Not yet implemented',
  mastery_scroll_9:  'Not yet implemented',
  mastery_scroll_10: 'Not yet implemented',
  mastery_scroll_11: 'Not yet implemented',
  mastery_scroll_12: 'Not yet implemented',
  mastery_scroll_13: 'Unlocks dark mode',
  mastery_scroll_14: 'Not yet implemented',
  mastery_scroll_15: 'Not yet implemented',
  mastery_scroll_16: 'Not yet implemented',
  mastery_scroll_17: 'Not yet implemented',
  mastery_scroll_18: 'Not yet implemented',
  mastery_scroll_19: 'Not yet implemented',
  mastery_scroll_20: 'Not yet implemented',
  mastery_scroll_21: 'Not yet implemented',
  mastery_scroll_22: 'Unlocks light mode',
  mastery_scroll_23: 'Not yet implemented',
  mastery_scroll_24: 'Not yet implemented',
  mastery_scroll_25: 'Not yet implemented',
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
