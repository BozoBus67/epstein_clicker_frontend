export const tier_num = (tier_str) => parseInt(tier_str?.replace('account_tier_', '')) || 0;
