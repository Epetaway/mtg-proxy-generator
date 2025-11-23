import React, { useEffect, useState } from 'react';
import type { CollectionEntry } from 'shared/types';
import { LocalBrowserCollectionRepository } from '../repository/LocalBrowserCollectionRepository';
import { fetchCardPrice } from '../pricing/ScryfallPriceProvider';
import { exportCollectionAsGenericCsv, exportCollectionAsCardKingdomCsv } from '../utils/csv';

const repo = new LocalBrowserCollectionRepository();

export default function DashboardPage() {
  const [entries, setEntries] = useState<CollectionEntry[]>([]);
  const [prices, setPrices] = useState<{[id: string]: number | null}>({});

  useEffect(() => {
    repo.getAll().then(async (es: CollectionEntry[]) => {
      setEntries(es);
      // Fetch prices for each entry
      const priceMap: {[id: string]: number | null} = {};
      for (const entry of es) {
        try {
          const price = await fetchCardPrice(entry.card);
          priceMap[entry.id] = price.marketPrice;
        } catch {
          priceMap[entry.id] = null;
        }
      }
      setPrices(priceMap);
    });
  }, []);

  const totalCards = entries.reduce((sum, e) => sum + e.quantity, 0);
  const totalValue = entries.reduce((sum, e) => sum + (prices[e.id] || 0) * e.quantity, 0);

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6">
      <h2 className="text-xl font-semibold mb-2">Collection Dashboard</h2>
      <div className="mb-4 flex gap-8 text-sm">
        <div>Total cards: <span className="font-bold">{totalCards}</span></div>
        <div>Estimated value: <span className="font-bold">${totalValue.toFixed(2)}</span></div>
        <button className="ml-auto rounded border px-3 py-1 text-xs" onClick={() => {
          const csv = exportCollectionAsGenericCsv(entries);
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'collection.csv';
          a.click();
          URL.revokeObjectURL(url);
        }}>Export CSV</button>
        <button className="rounded border px-3 py-1 text-xs" onClick={() => {
          const csv = exportCollectionAsCardKingdomCsv(entries);
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'cardkingdom.csv';
          a.click();
          URL.revokeObjectURL(url);
        }}>Export Card Kingdom CSV</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="bg-slate-100">
              <th className="p-2">Card</th>
              <th className="p-2">Set</th>
              <th className="p-2">#</th>
              <th className="p-2">Qty</th>
              <th className="p-2">Tags</th>
              <th className="p-2">Price</th>
              <th className="p-2">Value</th>
              <th className="p-2">Added</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(entry => (
              <tr key={entry.id} className="border-b">
                <td className="p-2 flex items-center gap-2">
                  <img src={entry.card.imageUri} alt={entry.card.name} className="w-10 h-14 object-cover rounded" />
                  <span>{entry.card.name}</span>
                </td>
                <td className="p-2">{entry.card.setCode}</td>
                <td className="p-2">{entry.card.collectorNumber}</td>
                <td className="p-2">{entry.quantity}</td>
                <td className="p-2">{entry.tags.join(', ')}</td>
                <td className="p-2">{prices[entry.id] != null ? `$${prices[entry.id]?.toFixed(2)}` : '-'}</td>
                <td className="p-2">{prices[entry.id] != null ? `$${((prices[entry.id] || 0) * entry.quantity).toFixed(2)}` : '-'}</td>
                <td className="p-2">{new Date(entry.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
