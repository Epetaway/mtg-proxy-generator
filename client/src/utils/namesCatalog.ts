import Fuse from 'fuse.js';

const CACHE_KEY = 'scryfall_card_names_cache_v1';
const CACHE_AT_KEY = 'scryfall_card_names_cached_at_v1';
let fuse: Fuse<string> | null = null;

async function fetchNames(): Promise<string[]> {
  const res = await fetch('https://api.scryfall.com/catalog/card-names');
  if (!res.ok) throw new Error('Failed to fetch Scryfall card names');
  const data = await res.json();
  return data.data || [];
}

export async function ensureNamesIndex(): Promise<void> {
  if (fuse) return;
  const cached = localStorage.getItem(CACHE_KEY);
  const cachedAt = Number(localStorage.getItem(CACHE_AT_KEY) || '0');
  const stale = Date.now() - cachedAt > 1000 * 60 * 60 * 24 * 7; // 7 days
  let names: string[] = [];
  if (cached && !stale) {
    names = JSON.parse(cached);
  } else {
    names = await fetchNames();
    localStorage.setItem(CACHE_KEY, JSON.stringify(names));
    localStorage.setItem(CACHE_AT_KEY, String(Date.now()));
  }
  fuse = new Fuse(names, { includeScore: true, threshold: 0.35 });
}

export async function suggestNames(query: string, limit = 5): Promise<string[]> {
  await ensureNamesIndex();
  if (!fuse || !query.trim()) return [];
  return fuse.search(query).slice(0, limit).map(r => r.item);
}
