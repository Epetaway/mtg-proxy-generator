// Shared TypeScript interfaces for client/server

export type CardCondition = 'NM' | 'LP' | 'MP' | 'HP' | 'DMG';

export interface CardIdentity {
  scryfallId: string;
  name: string;
  setCode: string;
  collectorNumber: string;
  isFoil: boolean;
  imageUri: string;
  lang: string;
}

export interface CollectionEntry {
  id: string;
  card: CardIdentity;
  quantity: number;
  condition: CardCondition;
  tags: string[];
  acquisitionPrice?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CardPrice {
  provider: 'scryfall';
  marketPrice: number | null;
  isFoilPrice?: boolean;
  currency: 'USD';
  fetchedAt: string;
}

export interface CollectionRepository {
  getAll(): Promise<CollectionEntry[]>;
  getById(id: string): Promise<CollectionEntry | null>;
  add(entry: CollectionEntry): Promise<void>;
  update(entry: CollectionEntry): Promise<void>;
  remove(id: string): Promise<void>;
  bulkImport(entries: CollectionEntry[]): Promise<void>;
  clearAll(): Promise<void>;
}
