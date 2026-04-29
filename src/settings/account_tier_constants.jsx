import * as Constants from '../shared/constants';

export const ACCOUNT_TIERS = [
  {
    id: 'free',
    label: Constants.ACCOUNT_TIER_0_LABEL,
    stripe_link: null,
  },
  {
    id: 'account_tier_1',
    label: Constants.ACCOUNT_TIER_1_LABEL,
    stripe_link: Constants.ACCOUNT_TIER_1_STRIPE_LINK,
  },
  {
    id: 'account_tier_2',
    label: Constants.ACCOUNT_TIER_2_LABEL,
    stripe_link: Constants.ACCOUNT_TIER_2_STRIPE_LINK,
  },
  {
    id: 'account_tier_3',
    label: Constants.ACCOUNT_TIER_3_LABEL,
    stripe_link: Constants.ACCOUNT_TIER_3_STRIPE_LINK,
  },
  {
    id: 'account_tier_4',
    label: Constants.ACCOUNT_TIER_4_LABEL,
    stripe_link: Constants.ACCOUNT_TIER_4_STRIPE_LINK,
  },
  {
    id: 'account_tier_5',
    label: Constants.ACCOUNT_TIER_5_LABEL,
    stripe_link: Constants.ACCOUNT_TIER_5_STRIPE_LINK,
  },
];
