import { get, post, auth_headers } from '../shared/api_client';

export const api_create_listing = async (body) =>
  post('/create_listing', body, await auth_headers());

export const api_get_listings = () =>
  get('/get_listings');

export const api_buy_listing = async (listing_id) =>
  post('/buy_listing', { listing_id }, await auth_headers());

export const api_cancel_listing = async (listing_id) =>
  post('/cancel_listing', { listing_id }, await auth_headers());
