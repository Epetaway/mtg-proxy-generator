import type { CardIdentity, CardPrice } from 'shared/types';

const BASE_URL = 'https://api.scryfall.com/cards';

export async function fetchCardPrice(card: CardIdentity): Promise<CardPrice> {
  const res = await fetch(`${BASE_URL}/${card.scryfallId}`);
  if (!res.ok) throw new Error('Failed to fetch price');
  const data = await res.json();
  const marketPrice = card.isFoil ? Number(data.prices.usd_foil) : Number(data.prices.usd);
  return {
    provider: 'scryfall',
    marketPrice: isNaN(marketPrice) ? null : marketPrice,
    isFoilPrice: card.isFoil,
    currency: 'USD',
    fetchedAt: new Date().toISOString(),
  };
}
