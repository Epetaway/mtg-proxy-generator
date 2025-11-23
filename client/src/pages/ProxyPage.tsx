import React, { useState } from 'react';
import { searchCardsByName } from '../scryfall';
import ProxySheet from '../components/ProxySheet';
import type { CardIdentity } from '../../../shared/types';

export default function ProxyPage() {
  const [cardName, setCardName] = useState('');
  const [setCode, setSetCode] = useState('');
  const [results, setResults] = useState<CardIdentity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<CardIdentity[]>([]);

  async function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const cards = await searchCardsByName(cardName, setCode);
      setResults(cards);
    } catch (err: any) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  }

  function toggleSelect(card: CardIdentity) {
    setSelected(sel => {
      if (sel.find(c => c.scryfallId === card.scryfallId)) {
        return sel.filter(c => c.scryfallId !== card.scryfallId);
      } else if (sel.length < 9) {
        return [...sel, card];
      } else {
        return sel;
      }
    });
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6">
      <form className="grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={handleSearch}>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="cardName">Card Name</label>
          <input id="cardName" value={cardName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCardName(e.target.value)} className="w-full rounded-xl border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g., Lightning Bolt" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="setCode">Set Code (optional)</label>
          <input id="setCode" value={setCode} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSetCode(e.target.value)} className="w-full rounded-xl border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g., MPS, BLB" />
        </div>
        <div className="flex items-end gap-2">
          <button type="submit" className="w-full inline-flex justify-center rounded-xl bg-indigo-600 text-white px-4 py-2 font-semibold hover:bg-indigo-700 transition-colors">Search</button>
        </div>
      </form>
      <div className="mt-4 text-sm text-slate-600">
        {loading && 'Searching...'}
        {error && <span className="text-rose-600">{error}</span>}
      </div>
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {results.map(card => {
          const isSelected = selected.find(c => c.scryfallId === card.scryfallId);
          return (
            <div key={card.scryfallId} className={`border rounded-xl p-2 flex flex-col items-center cursor-pointer ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-400' : ''}`} onClick={() => toggleSelect(card)}>
              <img src={card.imageUri} alt={card.name} className="w-full h-32 object-cover rounded" />
              <div className="mt-2 text-xs text-center">
                <div className="font-semibold">{card.name}</div>
                <div>{card.setCode} #{card.collectorNumber}</div>
                {isSelected && <div className="text-indigo-600 font-bold">Selected</div>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Sheet Preview</h3>
        <span className="text-xs text-slate-500">Target: 9 cards (3×3)</span>
        <ProxySheet cards={selected} />
      </div>
    </section>
  );
}
