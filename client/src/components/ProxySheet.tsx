import React from 'react';
import type { CardIdentity } from 'shared/types';

interface ProxySheetProps {
  cards: CardIdentity[];
}

export default function ProxySheet({ cards }: ProxySheetProps) {
  // Fill up to 9 cards for 3x3 grid
  const filled = [...cards];
  while (filled.length < 9) filled.push(null);

  return (
    <div className="bg-white rounded-xl border border-dashed border-slate-300 p-4 grid grid-cols-3 gap-2 min-h-[200px]">
      {filled.map((card, i) => (
        <div key={i} className="border rounded-xl bg-slate-100" style={{ aspectRatio: '2.5 / 3.5' }}>
          {card ? (
            <img src={card.imageUri} alt={card.name} className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">Empty</div>
          )}
        </div>
      ))}
    </div>
  );
}
