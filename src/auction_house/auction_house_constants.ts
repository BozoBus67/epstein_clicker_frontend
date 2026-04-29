export const CURRENCIES = [
  { id: 'cookies', label: 'Cookies' },
  { id: 'tokens',  label: 'Tokens'  },
] as const;

export type CurrencyType = typeof CURRENCIES[number]['id'];

export const CURRENCY_IDS = CURRENCIES.map(c => c.id);

export function opposite_currency(type: CurrencyType): CurrencyType {
  return type === 'cookies' ? 'tokens' : 'cookies';
}
