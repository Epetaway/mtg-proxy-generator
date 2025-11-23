// Scryfall API client for card search and details
import type { CardIdentity } from '../../shared/types';

const BASE_URL = 'https://api.scryfall.com';

export async function searchCardsByName(query: string, setCode?: string): Promise<CardIdentity[]> {
  const params = new URLSearchParams({
    q: query + (setCode ? ` set:${setCode}` : ''),
    unique: 'prints',
    order: 'released',
    dir: 'desc',
  });
  const res = await fetch(`${BASE_URL}/cards/search?${params}`);
  if (!res.ok) throw new Error('Scryfall search failed');
  const data = await res.json();
  return (data.data || []).map((card: any) => ({
    scryfallId: card.id,
    name: card.name,
    setCode: card.set,
    collectorNumber: card.collector_number,
    isFoil: card.foil,
    imageUri: card.image_uris?.normal || card.image_uris?.small || '',
    lang: card.lang || 'en',
  }));
}

export async function getCardById(scryfallId: string): Promise<CardIdentity> {
  const res = await fetch(`${BASE_URL}/cards/${scryfallId}`);
  if (!res.ok) throw new Error('Scryfall card fetch failed');
  const card = await res.json();
  return {
    scryfallId: card.id,
    name: card.name,
    setCode: card.set,
    collectorNumber: card.collector_number,
    isFoil: card.foil,
    imageUri: card.image_uris?.normal || card.image_uris?.small || '',
    lang: card.lang || 'en',
  };
}
