import type { CollectionEntry, CollectionRepository } from 'shared/types';
import { COLLECTION_STORAGE_KEY } from '../config';
export class LocalBrowserCollectionRepository implements CollectionRepository {
  async getAll(): Promise<CollectionEntry[]> {
    const raw = localStorage.getItem(COLLECTION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }
  async getById(id: string): Promise<CollectionEntry | null> {
    const all = await this.getAll();
    return all.find(e => e.id === id) || null;
  }
  async add(entry: CollectionEntry): Promise<void> {
    const all = await this.getAll();
    all.push(entry);
    localStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(all));
  }
  async update(entry: CollectionEntry): Promise<void> {
    const all = await this.getAll();
    const idx = all.findIndex(e => e.id === entry.id);
    if (idx !== -1) {
      all[idx] = entry;
      localStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(all));
    }
  }
  async remove(id: string): Promise<void> {
    const all = await this.getAll();
    localStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(all.filter(e => e.id !== id)));
  }
  async bulkImport(entries: CollectionEntry[]): Promise<void> {
    localStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(entries));
  }
  async clearAll(): Promise<void> {
    localStorage.removeItem(COLLECTION_STORAGE_KEY);
  }
}
