import { get_auth, post } from '../shared/api_client';

export const api_me = () =>
  get_auth('/me');

export const api_login = (username_or_email, password) =>
  post('/login', { username_or_email, password });

export const api_signup = (email, username, password) =>
  post('/signup', { email, username, password });
