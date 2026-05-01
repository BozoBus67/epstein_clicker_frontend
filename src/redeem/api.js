import { post_auth } from '../shared/api_client';

export const api_redeem_tokens = (answer_1, answer_2, answer_3) =>
  post_auth('/three_assumptions_poisson', { answer_1, answer_2, answer_3 });

export const api_redeem_promotion_oath = () =>
  post_auth('/promotion_oath');
