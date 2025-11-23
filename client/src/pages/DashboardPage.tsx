import React, { useEffect, useState } from 'react';
import type { CollectionEntry } from '../../../shared/types';
import { LocalBrowserCollectionRepository } from '../repository/LocalBrowserCollectionRepository';

const repo = new LocalBrowserCollectionRepository();

export default function DashboardPage() {
  const [entries, setEntries] = useState<CollectionEntry[]>([]);

  useEffect(() => {
    repo.getAll().then(setEntries);
  }, []);

  const totalCards = entries.reduce((sum, e) => sum + e.quantity, 0);
  // Pricing integration will be added in next phase
  const totalValue = entries.reduce((sum, e) => sum + (e.acquisitionPrice || 0) * e.quantity, 0);

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6">
      <h2 className="text-xl font-semibold mb-2">Collection Dashboard</h2>
      <div className="mb-4 flex gap-8 text-sm">
        <div>Total cards: <span className="font-bold">{totalCards}</span></div>
        <div>Estimated value: <span className="font-bold">${totalValue.toFixed(2)}</span></div>
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
                <td className="p-2">{new Date(entry.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
