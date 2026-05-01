// Shared types and helpers for the auction house. CURRENCIES is the source of
// truth for what can be listed or priced (cookies, tokens) — add an entry here
// to introduce a new currency to the marketplace.
export const CURRENCIES = [
  { id: 'cookies', label: 'Cookies' },
  { id: 'tokens',  label: 'Tokens'  },
] as const;

export type CurrencyType = typeof CURRENCIES[number]['id'];

export const CURRENCY_IDS = CURRENCIES.map(c => c.id);

export function opposite_currency(type: CurrencyType): CurrencyType {
  return type === 'cookies' ? 'tokens' : 'cookies';
}
