import { get, post_auth } from '../shared/api_client';

export const api_create_listing = (body) =>
  post_auth('/create_listing', body);

// Public endpoint — no auth needed.
export const api_get_listings = () =>
  get('/get_listings');

export const api_buy_listing = (listing_id) =>
  post_auth('/buy_listing', { listing_id });

export const api_cancel_listing = (listing_id) =>
  post_auth('/cancel_listing', { listing_id });
