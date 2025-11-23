import React, { useState } from 'react';
import { searchCardsByName } from '../scryfall';
import type { CardIdentity, CollectionEntry } from '../../../shared/types';
import { LocalBrowserCollectionRepository } from '../repository/LocalBrowserCollectionRepository';

const repo = new LocalBrowserCollectionRepository();

export default function AddPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CardIdentity[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<CardIdentity | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('');

  async function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    try {
      const cards = await searchCardsByName(query);
      setResults(cards);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!selected) return;
    const entry: CollectionEntry = {
      id: crypto.randomUUID(),
      card: selected,
      quantity,
      condition: 'NM',
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await repo.add(entry);
    setStatus('Added to collection!');
    setSelected(null);
    setQuantity(1);
    setTags('');
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6">
      <form className="flex gap-2" onSubmit={handleSearch}>
        <input value={query} onChange={e => setQuery(e.target.value)} className="w-full rounded-xl border-slate-300" placeholder="Search card name..." />
        <button type="submit" className="rounded-xl bg-indigo-600 text-white px-4 py-2 font-semibold">Search</button>
      </form>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {results.map(card => (
          <div key={card.scryfallId} className={`border rounded-xl p-2 flex flex-col items-center cursor-pointer ${selected?.scryfallId === card.scryfallId ? 'border-indigo-500 ring-2 ring-indigo-400' : ''}`} onClick={() => setSelected(card)}>
            <img src={card.imageUri} alt={card.name} className="w-full h-32 object-cover rounded" />
            <div className="mt-2 text-xs text-center">
              <div className="font-semibold">{card.name}</div>
              <div>{card.setCode} #{card.collectorNumber}</div>
            </div>
          </div>
        ))}
      </div>
      {selected && (
        <div className="mt-6 p-4 border rounded-xl bg-slate-50">
          <h3 className="font-semibold mb-2">Add to Collection</h3>
          <div className="flex gap-4 items-center">
            <img src={selected.imageUri} alt={selected.name} className="w-24 h-32 object-cover rounded" />
            <div>
              <div className="mb-2">{selected.name} ({selected.setCode} #{selected.collectorNumber})</div>
              <label className="block mb-1">Quantity
                <input type="number" min={1} value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="ml-2 w-16 border rounded" />
              </label>
              <label className="block mb-1">Tags
                <input type="text" value={tags} onChange={e => setTags(e.target.value)} className="ml-2 w-32 border rounded" placeholder="comma separated" />
              </label>
              <button type="button" onClick={handleAdd} className="mt-2 rounded bg-emerald-600 text-white px-3 py-1">Add</button>
            </div>
          </div>
          {status && <div className="mt-2 text-emerald-600">{status}</div>}
        </div>
      )}
    </section>
  );
}
