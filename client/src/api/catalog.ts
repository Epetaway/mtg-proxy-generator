import type { CardIdentity } from 'shared/types';
import { USE_SERVER, SERVER_URL } from '../config';
import { searchCardsByName } from '../scryfall';

export async function searchCardsSmart(query: string, setCode?: string): Promise<CardIdentity[]> {
  if (USE_SERVER) {
    const params = new URLSearchParams({ name: query, set: setCode || '', limit: '60' });
    const res = await fetch(`${SERVER_URL}/api/cards?${params.toString()}`);
    if (!res.ok) throw new Error('Server catalog search failed');
    const rows = await res.json();
    return rows.map((r: any) => ({
      scryfallId: r.id,
      name: r.name,
      setCode: r.set_code,
      collectorNumber: r.collector_number,
      isFoil: false,
      imageUri: r.image_uri || '',
      lang: r.lang || 'en',
    }));
  }
  // Fallback to Scryfall direct
  return searchCardsByName(query, setCode);
}
