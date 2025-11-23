import type { CollectionEntry } from 'shared/types';

export function exportCollectionAsGenericCsv(entries: CollectionEntry[]): string {
  const header = ['Name', 'Set Code', 'Collector Number', 'Quantity', 'Condition', 'Tags'];
  const rows = entries.map(e => [
    e.card.name,
    e.card.setCode,
    e.card.collectorNumber,
    e.quantity,
    e.condition,
    e.tags.join(';'),
  ]);
  return [header, ...rows].map(r => r.join(',')).join('\n');
}

export function exportCollectionAsCardKingdomCsv(entries: CollectionEntry[]): string {
  const header = ['Name', 'Edition', 'Number', 'Quantity', 'Foil'];
  const rows = entries.map(e => [
    e.card.name,
    e.card.setCode,
    e.card.collectorNumber,
    e.quantity,
    e.card.isFoil ? 'Yes' : 'No',
  ]);
  return [header, ...rows].map(r => r.join(',')).join('\n');
}
