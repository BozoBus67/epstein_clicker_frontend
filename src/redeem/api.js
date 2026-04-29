import { post, auth_headers } from '../shared/api_client';

export const api_redeem_tokens = async (answer_1, answer_2, answer_3) =>
  post('/three_assumptions_poisson', { answer_1, answer_2, answer_3 }, await auth_headers());
