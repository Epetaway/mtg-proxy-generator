import React, { useRef, useState } from 'react';
import { searchCardsByName } from '../scryfall';
import ProxySheet from '../components/ProxySheet';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { CardIdentity } from 'shared/types';

export default function ProxyPage() {
  const [cardName, setCardName] = useState('');
  const [setCode, setSetCode] = useState('');
  const [results, setResults] = useState<CardIdentity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<CardIdentity[]>([]);
  const printRef = useRef<HTMLDivElement>(null);

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
        {!loading && !error && results.length > 0 && <span>{results.length} results</span>}
      </div>
      <div className="mt-2">
        <button className="rounded border px-3 py-1 text-xs" onClick={async () => {
          setCardName('Lightning Bolt');
          setLoading(true);
          try {
            const cards = await searchCardsByName('Lightning Bolt');
            setResults(cards);
          } catch (e:any) { setError(e.message || 'Failed'); } finally { setLoading(false); }
        }}>Try Sample</button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <button className="rounded border px-3 py-1" onClick={() => setSelected([])}>Clear Sheet</button>
        <button className="rounded border px-3 py-1" onClick={async () => {
          if (!printRef.current) return;
          const canvas = await html2canvas(printRef.current, { backgroundColor: '#ffffff', scale: 2 });
          const link = document.createElement('a');
          link.download = 'proxy-sheet.png';
          link.href = canvas.toDataURL('image/png');
          link.click();
        }}>Download PNG</button>
        <button className="rounded border px-3 py-1" onClick={async () => {
          if (!printRef.current) return;
          const canvas = await html2canvas(printRef.current, { backgroundColor: '#ffffff', scale: 2 });
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
          pdf.save('proxy-sheet.pdf');
        }}>Download PDF</button>
        <button className="rounded border px-3 py-1" onClick={() => {
          const w = window.open('', 'PRINT', 'height=800,width=600');
          if (!w) return;
          const styles = `@page{size:Letter;margin:0.25in;} .print-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:0.12in;padding:0.05in;} .print-card{width:2.5in;height:3.5in;position:relative;background:#fff;} .print-card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;} .print-card::before{content:"";position:absolute;width:0.125in;height:0.125in;pointer-events:none;background:transparent;box-shadow: -0.125in 0 0 0 #000, 0 -0.125in 0 0 #000, 2.625in 0 0 0 #000, 2.5in -0.125in 0 0 #000, -0.125in 3.5in 0 0 #000, 0 3.625in 0 0 #000, 2.625in 3.5in 0 0 #000, 2.5in 3.625in 0 0 #000;}`;
          w.document.write(`<html><head><title>Print Proxy Sheet</title><style>${styles}</style></head><body>`);
          w.document.write(printRef.current?.outerHTML || '');
          w.document.write('</body></html>');
          w.document.close();
          w.focus();
          w.print();
          w.close();
        }}>Print</button>
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
        <div ref={printRef} className="print-grid" style={{ background: '#fff' }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="print-card">
              {selected[i] ? (
                <img src={selected[i].imageUri} alt={selected[i].name} />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
